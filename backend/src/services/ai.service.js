const { getGeminiClient } = require('../config/ai');
const env = require('../config/env');
const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const SkillQuizAttempt = require('../models/SkillQuizAttempt');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { extractResumeText } = require('../utils/resumeTextExtractor');

/**
 * Sends a single-turn prompt to Claude and returns the text response.
 * Centralizes error normalization so every AI feature reports failures
 * the same way (rate limits, auth errors, etc. from the provider all
 * become a clean ApiError instead of leaking SDK internals).
 */
async function askAI(systemPrompt, userPrompt) {
  const client = getGeminiClient();
  try {
    const response = await client.models.generateContent({
      model: env.ai.model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: env.ai.maxTokens,
        temperature: 0.2,
      },
    });

    const text = typeof response.text === 'function' ? response.text() : response.text;
    if (!text || !String(text).trim()) {
      throw new Error('Gemini returned an empty response');
    }
    return String(text).trim();
  } catch (error) {
    logger.error(`Gemini API call failed: ${error.message}`);
    throw ApiError.serviceUnavailable('The AI service is temporarily unavailable. Please try again shortly.');
  }
}

function parseJsonResponse(rawText) {
  const cleaned = rawText.replace(/^```json\s*|```\s*$/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw ApiError.serviceUnavailable('The AI service returned an unexpected response. Please try again.');
  }
}

async function getProfileOrThrow(candidateId) {
  const profile = await CandidateProfile.findOne({ user: candidateId });
  if (!profile) {
    throw ApiError.badRequest('Please complete your candidate profile first');
  }
  return profile;
}

function buildProfileSummary(profile) {
  const lines = [
    `Headline: ${profile.headline || 'Not set'}`,
    `Bio: ${profile.bio || 'Not set'}`,
    `Skills: ${(profile.skills || []).join(', ') || 'None listed'}`,
    'Experience:',
    ...(profile.experience || []).map(
      (exp) => `- ${exp.jobTitle} at ${exp.company} (${exp.isCurrent ? 'current' : 'past'})`,
    ),
    'Education:',
    ...(profile.education || []).map((edu) => `- ${edu.degree} in ${edu.fieldOfStudy || 'N/A'} at ${edu.institution}`),
  ];
  return lines.join('\n');
}

// --- 1. AI Resume Analysis ---

async function analyzeResume(candidateId) {
  const profile = await getProfileOrThrow(candidateId);
  if (!profile.resume?.url) {
    throw ApiError.badRequest('Please upload a resume before requesting an analysis');
  }

  const resumeText = await extractResumeText(profile.resume.url, profile.resume.originalFileName);

  const systemPrompt =
    'You are an expert technical recruiter and resume reviewer. Respond with ONLY a JSON object ' +
    'and no other text, matching this exact shape: {"summary": string, "strengths": string[], ' +
    '"weaknesses": string[], "suggestions": string[], "atsScore": number (0-100)}. Keep each array ' +
    'to at most 5 concise items.';
  const userPrompt = `Analyze the following resume text and provide constructive, specific feedback:\n\n${resumeText}`;

  const rawResponse = await askAI(systemPrompt, userPrompt);
  const parsed = parseJsonResponse(rawResponse);

  profile.aiResumeAnalysis = {
    summary: parsed.summary,
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    suggestions: parsed.suggestions,
    atsScore: parsed.atsScore,
    generatedAt: new Date(),
  };
  await profile.save();
  return profile.aiResumeAnalysis;
}

async function getSavedResumeAnalysis(candidateId) {
  const profile = await getProfileOrThrow(candidateId);
  return profile.aiResumeAnalysis?.generatedAt ? profile.aiResumeAnalysis : null;
}

// --- 2. AI Resume Builder ---

async function generateResumeDraft(candidateId) {
  const profile = await getProfileOrThrow(candidateId);

  const systemPrompt =
    'You are a professional resume writer. Write a polished, ATS-friendly resume in clean plain ' +
    'text (no markdown symbols) based on the structured profile data provided. Use clear section ' +
    'headers (SUMMARY, SKILLS, EXPERIENCE, EDUCATION). Do not invent facts not present in the data.';
  const userPrompt = `Candidate profile data:\n\n${buildProfileSummary(profile)}`;

  const draft = await askAI(systemPrompt, userPrompt);
  return { draft, generatedAt: new Date() };
}

// --- 3. AI Job Recommendations ---

/**
 * Deterministic skill-overlap scoring against open jobs (fast, free,
 * and reproducible), then asks Claude for a one-line "why it fits"
 * explanation for only the top few matches - balances relevance
 * against the cost/latency of an LLM call per job.
 */
async function getJobRecommendations(candidateId, limit = 5) {
  const profile = await getProfileOrThrow(candidateId);
  const candidateSkills = new Set((profile.skills || []).map((skill) => skill.toLowerCase()));

  if (candidateSkills.size === 0) {
    throw ApiError.badRequest('Add some skills to your profile to get job recommendations');
  }

  const openJobs = await Job.find({ status: 'open' })
    .populate('company', 'companyName logo')
    .limit(200);

  const scored = openJobs
    .map((job) => {
      const jobSkills = (job.skills || []).map((skill) => skill.toLowerCase());
      const overlap = jobSkills.filter((skill) => candidateSkills.has(skill));
      return { job, score: overlap.length, matchedSkills: overlap };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length === 0) {
    return [];
  }

  const systemPrompt =
    'You are a career advisor. For each job, write one concise sentence (max 25 words) explaining ' +
    'why it could be a good fit for the candidate, referencing their matched skills. Respond with ' +
    'ONLY a JSON array of strings, one per job, in the same order given.';
  const userPrompt = [
    `Candidate skills: ${(profile.skills || []).join(', ')}`,
    'Jobs:',
    ...scored.map((entry, i) => `${i + 1}. ${entry.job.title} - matched skills: ${entry.matchedSkills.join(', ')}`),
  ].join('\n');

  let explanations = [];
  try {
    const rawResponse = await askAI(systemPrompt, userPrompt);
    explanations = parseJsonResponse(rawResponse);
  } catch (error) {
    // Recommendations are still useful without the AI explanation -
    // fall back to the scored list rather than failing the request.
    logger.error(`Job recommendation explanations failed: ${error.message}`);
  }

  return scored.map((entry, i) => ({
    job: entry.job,
    matchedSkills: entry.matchedSkills,
    matchScore: entry.score,
    whyItFits: explanations[i] || null,
  }));
}

// --- 4. AI Career Suggestions ---

async function getCareerSuggestions(candidateId) {
  const profile = await getProfileOrThrow(candidateId);

  const systemPrompt =
    'You are a career coach. Based on the candidate profile, suggest 3-5 concrete next steps for ' +
    'their career growth (skills to learn, roles to target, certifications worth pursuing). Write in ' +
    'plain text with short paragraphs or a simple numbered list. Keep it under 300 words.';
  const userPrompt = `Candidate profile data:\n\n${buildProfileSummary(profile)}`;

  const content = await askAI(systemPrompt, userPrompt);

  profile.aiCareerSuggestions = { content, generatedAt: new Date() };
  await profile.save();
  return profile.aiCareerSuggestions;
}

async function getSavedCareerSuggestions(candidateId) {
  const profile = await getProfileOrThrow(candidateId);
  return profile.aiCareerSuggestions?.generatedAt ? profile.aiCareerSuggestions : null;
}

// --- 5. AI Interview Preparation ---

async function getInterviewPrep(candidateId, jobId) {
  const profile = await getProfileOrThrow(candidateId);
  const job = await Job.findOne({ _id: jobId, status: 'open' }).populate('company', 'companyName');
  if (!job) {
    throw ApiError.notFound('Job not found or is no longer open');
  }

  const systemPrompt =
    'You are an interview coach. Generate 6-8 likely interview questions for this specific job, ' +
    "tailored to the candidate's background where relevant. For each question, give one short tip " +
    'on how to approach the answer. Respond with ONLY a JSON array of objects: ' +
    '[{"question": string, "tip": string}].';
  const userPrompt = [
    `Job title: ${job.title}`,
    `Company: ${job.company?.companyName || 'N/A'}`,
    `Job description: ${job.description}`,
    `Required skills: ${(job.skills || []).join(', ')}`,
    '',
    `Candidate background:\n${buildProfileSummary(profile)}`,
  ].join('\n');

  const rawResponse = await askAI(systemPrompt, userPrompt);
  const questions = parseJsonResponse(rawResponse);

  return { job: { _id: job._id, title: job.title, company: job.company }, questions, generatedAt: new Date() };
}

// --- 6. AI Skill Verification Quiz ---
// Unique feature: candidates can earn a "Verified" badge on a skill by
// passing a short AI-generated quiz, giving recruiters a real trust
// signal beyond a self-reported skill tag.

const MAX_PENDING_QUIZZES_PER_CANDIDATE = 3;

async function generateSkillQuiz(candidateId, skill) {
  const profile = await getProfileOrThrow(candidateId);

  if (!(profile.skills || []).some((s) => s.toLowerCase() === skill.toLowerCase())) {
    throw ApiError.badRequest('Add this skill to your profile before requesting a verification quiz');
  }
  if ((profile.verifiedSkills || []).some((s) => s.toLowerCase() === skill.toLowerCase())) {
    throw ApiError.conflict('This skill is already verified');
  }

  const pendingCount = await SkillQuizAttempt.countDocuments({ candidate: candidateId, status: 'pending' });
  if (pendingCount >= MAX_PENDING_QUIZZES_PER_CANDIDATE) {
    throw ApiError.badRequest('You have unfinished quizzes — complete or let them expire before starting a new one');
  }

  const systemPrompt =
    'You are a technical assessor. Generate 5 practical multiple-choice questions testing real, ' +
    'working knowledge of the given skill (not trivia). Each question has exactly 4 options with ' +
    'one correct answer. Respond with ONLY a JSON array: ' +
    '[{"question": string, "options": [string, string, string, string], "correctIndex": number (0-3)}].';
  const userPrompt = `Skill to test: ${skill}`;

  const rawResponse = await askAI(systemPrompt, userPrompt);
  const questions = parseJsonResponse(rawResponse);

  if (!Array.isArray(questions) || questions.length === 0) {
    throw ApiError.serviceUnavailable('The AI service returned an unexpected response. Please try again.');
  }

  const attempt = await SkillQuizAttempt.create({ candidate: candidateId, skill, questions });

  // Strip correct answers before returning - the candidate should never
  // see them until after they submit.
  return {
    quizId: attempt._id,
    skill: attempt.skill,
    questions: attempt.questions.map((q) => ({ question: q.question, options: q.options })),
  };
}

async function submitSkillQuiz(candidateId, quizId, answers) {
  const attempt = await SkillQuizAttempt.findById(quizId);
  if (!attempt) {
    throw ApiError.notFound('Quiz not found');
  }
  if (attempt.candidate.toString() !== candidateId.toString()) {
    throw ApiError.forbidden('This quiz does not belong to you');
  }
  if (attempt.status !== 'pending') {
    throw ApiError.badRequest('This quiz has already been submitted');
  }
  if (!Array.isArray(answers) || answers.length !== attempt.questions.length) {
    throw ApiError.badRequest(`Expected ${attempt.questions.length} answers`);
  }

  const correctCount = attempt.questions.reduce(
    (count, q, i) => (answers[i] === q.correctIndex ? count + 1 : count),
    0,
  );
  const score = correctCount / attempt.questions.length;
  const passed = score >= SkillQuizAttempt.PASS_THRESHOLD;

  attempt.status = passed ? 'passed' : 'failed';
  attempt.score = score;
  attempt.submittedAt = new Date();
  await attempt.save();

  if (passed) {
    await CandidateProfile.updateOne(
      { user: candidateId, verifiedSkills: { $ne: attempt.skill } },
      { $push: { verifiedSkills: attempt.skill } },
    );
  }

  return {
    skill: attempt.skill,
    score,
    correctCount,
    totalQuestions: attempt.questions.length,
    passed,
    correctAnswers: attempt.questions.map((q) => q.correctIndex),
  };
}

// --- 7. Resume parser ---

async function parseResume(candidateId) {
  const profile = await getProfileOrThrow(candidateId);
  if (!profile.resume?.url) throw ApiError.badRequest('Please upload a resume first');
  const resumeText = await extractResumeText(profile.resume.url, profile.resume.originalFileName);
  const raw = await askAI(
    'You are a resume parser. Return ONLY JSON with keys name, email, phone, headline, location, skills, education, experience, projects, certifications, achievements. Use empty arrays/strings when unavailable. Never invent information.',
    resumeText,
  );
  return parseJsonResponse(raw);
}

// --- 8. Job-specific ATS analysis ---

async function getAtsScore(candidateId, jobDescription) {
  const profile = await getProfileOrThrow(candidateId);
  if (!profile.resume?.url) throw ApiError.badRequest('Please upload a resume before running an ATS analysis');
  if (!jobDescription || jobDescription.trim().length < 40) {
    throw ApiError.badRequest('Provide a job description with at least 40 characters');
  }

  const resumeText = await extractResumeText(profile.resume.url, profile.resume.originalFileName);
  const systemPrompt =
    'You are an ATS optimization specialist. Respond ONLY with JSON: ' +
    '{"atsScore":number,"keywordCoverage":number,"experienceMatch":number,"educationMatch":number,' +
    '"matchedSkills":string[],"missingSkills":string[],"suggestions":string[]}. ' +
    'Scores must be 0-100. Do not invent candidate facts.';
  const raw = await askAI(systemPrompt, `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`);
  return { ...parseJsonResponse(raw), generatedAt: new Date() };
}

// --- 8. Job readiness, skill gaps and roadmap ---

function normalizeSkills(skills = []) {
  return [...new Set(skills.map((s) => String(s).trim().toLowerCase()).filter(Boolean))];
}

async function getSkillGaps(candidateId, targetRole, jobId) {
  const profile = await getProfileOrThrow(candidateId);
  let job = null;
  if (jobId) job = await Job.findById(jobId).select('title skills description experienceLevel');
  const required = normalizeSkills(job?.skills || []);
  if (!required.length && targetRole) {
    const raw = await askAI(
      'Return ONLY a JSON array of 6-10 technical skills normally expected for the requested role.',
      `Target role: ${targetRole}`,
    );
    required.push(...normalizeSkills(parseJsonResponse(raw)));
  }
  if (!required.length) throw ApiError.badRequest('Choose a target role or a job with required skills');
  const current = normalizeSkills(profile.skills);
  const missing = required.filter((skill) => !current.includes(skill));
  const matched = required.filter((skill) => current.includes(skill));
  return {
    targetRole: job?.title || targetRole,
    requiredSkills: required,
    matchedSkills: matched,
    missingSkills: missing,
    gapCount: missing.length,
    generatedAt: new Date(),
  };
}

async function getReadiness(candidateId, targetRole, jobId) {
  const profile = await getProfileOrThrow(candidateId);
  const gaps = await getSkillGaps(candidateId, targetRole, jobId);
  const profileScore = [profile.headline, profile.bio, profile.skills?.length, profile.resume?.url,
    profile.education?.length || profile.experience?.length].filter(Boolean).length / 5 * 100;
  const technical = gaps.requiredSkills.length
    ? (gaps.matchedSkills.length / gaps.requiredSkills.length) * 100
    : Math.min((profile.skills?.length || 0) * 10, 100);
  const resume = profile.aiResumeAnalysis?.atsScore ?? 50;
  const experience = profile.experience?.length ? Math.min(100, 55 + profile.experience.length * 15) : 35;
  const projects = profile.projects?.length ? Math.min(100, 50 + profile.projects.length * 15) : 20;
  const interview = 50;
  const certifications = Math.min(100, (profile.certifications?.length || 0) * 25);
  const communication = profile.bio ? 80 : 30;
  const score = Math.round(
    technical * .30 + resume * .15 + experience * .15 + projects * .10 +
    interview * .15 + certifications * .05 + profileScore * .05 + communication * .05,
  );
  return {
    score: Math.max(0, Math.min(100, score)),
    targetRole: gaps.targetRole,
    factors: { technicalSkills: Math.round(technical), resumeQuality: Math.round(resume),
      relevantExperience: Math.round(experience), projects: projects, interviewPerformance: interview,
      certifications: Math.round(certifications), profileCompleteness: Math.round(profileScore),
      communication: communication },
    skillGaps: gaps.missingSkills,
    disclaimer: 'Estimated preparedness indicator, not a guarantee of employment.',
    generatedAt: new Date(),
  };
}

async function getRoadmap(candidateId, targetRole, jobId) {
  const readiness = await getReadiness(candidateId, targetRole, jobId);
  const profile = await getProfileOrThrow(candidateId);
  const raw = await askAI(
    'You are a practical career coach. Return ONLY JSON array of 4-6 objects with keys priority, action, skill, outcome. Base everything on the supplied data and do not invent candidate experience.',
    `Target role: ${readiness.targetRole}\nCurrent readiness: ${readiness.score}\nMissing skills: ${readiness.skillGaps.join(', ') || 'None'}\nCurrent skills: ${(profile.skills || []).join(', ')}`,
  );
  return { targetRole: readiness.targetRole, readinessScore: readiness.score, stages: parseJsonResponse(raw), generatedAt: new Date() };
}

// --- 9. AI career assistant ---

async function askCareerAssistant(candidateId, question) {
  if (!question || question.trim().length < 3) throw ApiError.badRequest('Ask a career question first');
  const profile = await getProfileOrThrow(candidateId);
  const jobs = await Job.find({ status: 'open' }).select('title skills experienceLevel location').limit(8).lean();
  const systemPrompt =
    'You are TalentForge Career Copilot. Answer concisely and practically. Use only the candidate data and job data supplied. ' +
    'Never claim a score or fact that is not present. Clearly label recommendations as AI-generated. Return plain text.';
  const context = [
    `Candidate: ${buildProfileSummary(profile)}`,
    `Open jobs: ${jobs.map((j) => `${j.title} [${(j.skills || []).join(', ')}]`).join('; ')}`,
    `Question: ${question}`,
  ].join('\n\n');
  const answer = await askAI(systemPrompt, context);
  return { question, answer, generatedAt: new Date() };
}

// --- 10. Recruiter AI candidate screening ---

async function rankCandidatesForJob(recruiterId, jobId) {
  const job = await Job.findOne({ _id: jobId, recruiter: recruiterId }).lean();
  if (!job) throw ApiError.notFound('Job not found');
  const applications = await Application.find({ job: jobId })
    .populate('candidate', 'fullName email')
    .lean();
  const profiles = await CandidateProfile.find({ user: { $in: applications.map((a) => a.candidate?._id).filter(Boolean) } }).lean();
  const byUser = new Map(profiles.map((p) => [String(p.user), p]));
  const required = normalizeSkills(job.skills);
  const ranked = applications.map((application) => {
    const profile = byUser.get(String(application.candidate?._id)) || {};
    const skills = normalizeSkills(profile.skills);
    const matched = required.filter((s) => skills.includes(s));
    const skillMatch = required.length ? matched.length / required.length * 100 : 50;
    const experience = profile.experience?.length ? Math.min(100, 60 + profile.experience.length * 15) : 35;
    const verification = required.length ? required.filter((s) => (profile.verifiedSkills || []).map(String).map((x) => x.toLowerCase()).includes(s)).length / required.length * 100 : 0;
    const resume = profile.resume?.url ? 100 : 0;
    const score = Math.round(skillMatch * .55 + experience * .20 + verification * .15 + resume * .10);
    return {
      applicationId: application._id, candidate: application.candidate, score,
      matchedSkills: matched, missingSkills: required.filter((s) => !skills.includes(s)),
      status: application.status,
    };
  }).sort((a,b) => b.score - a.score).slice(0, 25);

  if (!ranked.length) return { job: { _id: job._id, title: job.title }, candidates: [] };
  let explanations = [];
  try {
    const raw = await askAI(
      'You are an ethical recruiting copilot. Return ONLY a JSON array of short explanations, one per candidate, explaining the score using only supplied job/candidate evidence. Never mention protected characteristics. Max 30 words each.',
      [`Job: ${job.title}`, `Required skills: ${job.skills.join(', ')}`, ...ranked.map((r,i) => `${i+1}. Score ${r.score}; matched ${r.matchedSkills.join(', ') || 'none'}; missing ${r.missingSkills.join(', ') || 'none'}`)].join('\n'),
    );
    explanations = parseJsonResponse(raw);
  } catch (error) {
    logger.warn(`Candidate ranking explanations unavailable: ${error.message}`);
  }
  return {
    job: { _id: job._id, title: job.title },
    candidates: ranked.map((r,i) => ({ ...r, explanation: explanations[i] || 'Ranked from job-relevant skills, experience and resume availability.' })),
    humanOversight: 'AI ranking is advisory only. Recruiters must review candidate evidence before making hiring decisions.',
  };
}

module.exports = {
  analyzeResume,
  getSavedResumeAnalysis,
  generateResumeDraft,
  getJobRecommendations,
  getCareerSuggestions,
  getSavedCareerSuggestions,
  getInterviewPrep,
  generateSkillQuiz,
  submitSkillQuiz,
  getAtsScore,
  getSkillGaps,
  getReadiness,
  getRoadmap,
  askCareerAssistant,
  rankCandidatesForJob,
  parseResume,
};

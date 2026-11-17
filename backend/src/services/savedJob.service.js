const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const ApiError = require('../utils/ApiError');

async function saveJob(candidateId, jobId) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  // Idempotent: saving an already-saved job is a no-op success rather
  // than an error, since the client action is "toggle saved" not
  // "create a new save."
  const savedJob = await SavedJob.findOneAndUpdate(
    { candidate: candidateId, job: jobId },
    { candidate: candidateId, job: jobId },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return savedJob;
}

async function unsaveJob(candidateId, jobId) {
  await SavedJob.findOneAndDelete({ candidate: candidateId, job: jobId });
}

async function listSavedJobs(candidateId, { page = 1, limit = 10 }) {
  const query = { candidate: candidateId };
  const skip = (page - 1) * limit;

  const [savedJobs, total] = await Promise.all([
    SavedJob.find(query)
      .populate({ path: 'job', populate: { path: 'company', select: 'companyName logo industry' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SavedJob.countDocuments(query),
  ]);

  return {
    savedJobs,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
}

module.exports = { saveJob, unsaveJob, listSavedJobs };

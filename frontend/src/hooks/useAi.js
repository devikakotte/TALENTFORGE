import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import aiService from '../services/aiService';

function aiErrorMessage(error) {
  return error.response?.data?.message || 'The AI service could not complete this request';
}

// --- Resume analysis ---

export function useSavedResumeAnalysis() {
  return useQuery({
    queryKey: ['ai', 'resumeAnalysis'],
    queryFn: aiService.getSavedResumeAnalysis,
  });
}

export function useAnalyzeResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aiService.analyzeResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'resumeAnalysis'] });
      toast.success('Resume analysis ready');
    },
    onError: (error) => toast.error(aiErrorMessage(error)),
  });
}

// --- Resume builder ---

export function useGenerateResumeDraft() {
  return useMutation({
    mutationFn: aiService.generateResumeDraft,
    onError: (error) => toast.error(aiErrorMessage(error)),
  });
}

// --- Job recommendations ---

export function useJobRecommendations(limit = 5, options = {}) {
  return useQuery({
    queryKey: ['ai', 'jobRecommendations', limit],
    queryFn: () => aiService.getJobRecommendations(limit),
    enabled: options.enabled ?? true,
  });
}

// --- Career suggestions ---

export function useSavedCareerSuggestions() {
  return useQuery({
    queryKey: ['ai', 'careerSuggestions'],
    queryFn: aiService.getSavedCareerSuggestions,
  });
}

export function useGenerateCareerSuggestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aiService.generateCareerSuggestions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'careerSuggestions'] });
      toast.success('Career suggestions ready');
    },
    onError: (error) => toast.error(aiErrorMessage(error)),
  });
}

// --- Interview prep ---

export function useInterviewPrep(jobId, options = {}) {
  return useQuery({
    queryKey: ['ai', 'interviewPrep', jobId],
    queryFn: () => aiService.getInterviewPrep(jobId),
    enabled: Boolean(jobId) && (options.enabled ?? false),
    retry: false,
  });
}

// --- Skill verification quiz ---

export function useGenerateSkillQuiz() {
  return useMutation({
    mutationFn: aiService.generateSkillQuiz,
    onError: (error) => toast.error(aiErrorMessage(error)),
  });
}

export function useSubmitSkillQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, answers }) => aiService.submitSkillQuiz(quizId, answers),
    onSuccess: (result) => {
      if (result.passed) {
        queryClient.invalidateQueries({ queryKey: ['candidate', 'profile'] });
        toast.success(`${result.skill} verified! 🎉`);
      } else {
        toast(`Scored ${Math.round(result.score * 100)}% — try again anytime.`);
      }
    },
    onError: (error) => toast.error(aiErrorMessage(error)),
  });
}


export function useAtsScore() {
  return useMutation({
    mutationFn: aiService.getAtsScore,
    onError: (error) => toast.error(aiErrorMessage(error)),
  });
}

export function useReadiness(params = {}, options = {}) {
  return useQuery({
    queryKey: ['ai', 'readiness', params],
    queryFn: () => aiService.getReadiness(params),
    enabled: options.enabled ?? true,
    retry: false,
  });
}

export function useSkillGaps(params = {}, options = {}) {
  return useQuery({
    queryKey: ['ai', 'skillGaps', params],
    queryFn: () => aiService.getSkillGaps(params),
    enabled: options.enabled ?? true,
    retry: false,
  });
}

export function useRoadmap(params = {}, options = {}) {
  return useQuery({
    queryKey: ['ai', 'roadmap', params],
    queryFn: () => aiService.getRoadmap(params),
    enabled: options.enabled ?? false,
    retry: false,
  });
}

export function useCareerAssistant() {
  return useMutation({
    mutationFn: aiService.askCareerAssistant,
    onError: (error) => toast.error(aiErrorMessage(error)),
  });
}

export function useCandidateRanking(jobId, options = {}) {
  return useQuery({
    queryKey: ['ai', 'candidateRanking', jobId],
    queryFn: () => aiService.getCandidateRanking(jobId),
    enabled: Boolean(jobId) && (options.enabled ?? false),
    retry: false,
  });
}

export function useParseResume() { return useMutation({ mutationFn: aiService.parseResume, onError: (error) => toast.error(aiErrorMessage(error)) }); }

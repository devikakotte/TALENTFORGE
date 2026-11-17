import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import candidateProfileService from '../services/candidateProfileService';

const PROFILE_QUERY_KEY = ['candidate', 'profile'];

export function useCandidateProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: candidateProfileService.getMyProfile,
  });
}

function useProfileMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      if (successMessage) toast.success(successMessage);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    },
  });
}

export function useUpdateProfile() {
  return useProfileMutation(candidateProfileService.updateMyProfile, 'Profile updated');
}

export function useUploadResume() {
  return useProfileMutation(candidateProfileService.uploadResume, 'Resume uploaded');
}

export function useDeleteResume() {
  return useProfileMutation(candidateProfileService.deleteResume, 'Resume removed');
}

export function useUploadProfilePhoto() {
  return useProfileMutation(candidateProfileService.uploadProfilePhoto, 'Photo updated');
}

export function useAddEducation() {
  return useProfileMutation(candidateProfileService.education.add, 'Education added');
}
export function useUpdateEducation() {
  return useProfileMutation(
    ({ itemId, payload }) => candidateProfileService.education.update(itemId, payload),
    'Education updated',
  );
}
export function useRemoveEducation() {
  return useProfileMutation(candidateProfileService.education.remove, 'Education removed');
}

export function useAddExperience() {
  return useProfileMutation(candidateProfileService.experience.add, 'Experience added');
}
export function useUpdateExperience() {
  return useProfileMutation(
    ({ itemId, payload }) => candidateProfileService.experience.update(itemId, payload),
    'Experience updated',
  );
}
export function useRemoveExperience() {
  return useProfileMutation(candidateProfileService.experience.remove, 'Experience removed');
}

export function useAddCertification() {
  return useProfileMutation(candidateProfileService.certifications.add, 'Certification added');
}
export function useUpdateCertification() {
  return useProfileMutation(
    ({ itemId, payload }) => candidateProfileService.certifications.update(itemId, payload),
    'Certification updated',
  );
}
export function useRemoveCertification() {
  return useProfileMutation(
    candidateProfileService.certifications.remove,
    'Certification removed',
  );
}

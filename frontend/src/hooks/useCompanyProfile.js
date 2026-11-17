import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import companyProfileService from '../services/companyProfileService';

const COMPANY_QUERY_KEY = ['recruiter', 'company'];

export function useCompanyProfile() {
  return useQuery({
    queryKey: COMPANY_QUERY_KEY,
    queryFn: companyProfileService.getMyCompany,
  });
}

function useCompanyMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEY });
      if (successMessage) toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });
}

export function useUpdateCompany() {
  return useCompanyMutation(companyProfileService.updateMyCompany, 'Company profile updated');
}

export function useUploadLogo() {
  return useCompanyMutation(companyProfileService.uploadLogo, 'Logo updated');
}

export function useTalentSearch(params = {}) {
  return useQuery({
    queryKey: ['recruiter', 'talentSearch', params],
    queryFn: () => companyProfileService.talentSearch(params),
    keepPreviousData: true,
  });
}

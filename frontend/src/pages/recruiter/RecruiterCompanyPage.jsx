import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, UploadCloud } from 'lucide-react';
import { useCompanyProfile, useUpdateCompany, useUploadLogo } from '../../hooks/useCompanyProfile';
import LoadingScreen from '../../components/common/LoadingScreen';
import FormField from '../../components/form/FormField';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

function RecruiterCompanyPage() {
  const { data: company, isLoading } = useCompanyProfile();
  const updateCompany = useUpdateCompany();
  const uploadLogo = useUploadLogo();
  const logoInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      companyName: '',
      industry: '',
      companySize: '',
      website: '',
      description: '',
      headquarters: '',
      foundedYear: '',
      socialLinks: { linkedin: '', twitter: '' },
    },
  });

  useEffect(() => {
    if (company) {
      reset({
        companyName: company.companyName || '',
        industry: company.industry || '',
        companySize: company.companySize || '',
        website: company.website || '',
        description: company.description || '',
        headquarters: company.headquarters || '',
        foundedYear: company.foundedYear || '',
        socialLinks: {
          linkedin: company.socialLinks?.linkedin || '',
          twitter: company.socialLinks?.twitter || '',
        },
      });
    }
  }, [company, reset]);

  if (isLoading) return <LoadingScreen label="Loading company profile..." />;

  const handleLogoSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) uploadLogo.mutate(file);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Company profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This is what candidates see on your job postings.
        </p>
      </div>

      <div className="card flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          {company?.logo?.url ? (
            <img src={company.logo.url} alt="Company logo" className="h-full w-full object-cover" />
          ) : (
            <Building2 className="text-slate-400" size={28} />
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="btn-secondary gap-1.5 text-sm"
            disabled={uploadLogo.isPending}
          >
            <UploadCloud size={16} />
            {uploadLogo.isPending ? 'Uploading...' : 'Upload logo'}
          </button>
          <p className="mt-1 text-xs text-slate-400">PNG, JPEG, or WebP — up to 2MB</p>
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleLogoSelect}
          className="hidden"
        />
      </div>

      <form
        className="card flex flex-col gap-4"
        onSubmit={handleSubmit((values) => updateCompany.mutate(values))}
        noValidate
      >
        <FormField label="Company name" id="companyName" error={errors.companyName}>
          <input
            id="companyName"
            type="text"
            className="input-field"
            {...register('companyName', { required: 'Company name is required' })}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Industry" id="industry" error={errors.industry}>
            <input id="industry" type="text" className="input-field" {...register('industry')} />
          </FormField>
          <FormField label="Company size" id="companySize" error={errors.companySize}>
            <select id="companySize" className="input-field" {...register('companySize')}>
              <option value="">Select size</option>
              {COMPANY_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} employees
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Website" id="website" error={errors.website}>
            <input
              id="website"
              type="url"
              placeholder="https://..."
              className="input-field"
              {...register('website')}
            />
          </FormField>
          <FormField label="Headquarters" id="headquarters" error={errors.headquarters}>
            <input id="headquarters" type="text" className="input-field" {...register('headquarters')} />
          </FormField>
        </div>

        <FormField label="Founded year" id="foundedYear" error={errors.foundedYear}>
          <input
            id="foundedYear"
            type="number"
            className="input-field max-w-[160px]"
            {...register('foundedYear')}
          />
        </FormField>

        <FormField label="About the company" id="description" error={errors.description}>
          <textarea id="description" rows={4} className="input-field" {...register('description')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="LinkedIn" id="linkedin" error={errors.socialLinks?.linkedin}>
            <input
              id="linkedin"
              type="url"
              className="input-field"
              {...register('socialLinks.linkedin')}
            />
          </FormField>
          <FormField label="Twitter / X" id="twitter" error={errors.socialLinks?.twitter}>
            <input
              id="twitter"
              type="url"
              className="input-field"
              {...register('socialLinks.twitter')}
            />
          </FormField>
        </div>

        <div>
          <button type="submit" className="btn-primary" disabled={updateCompany.isPending}>
            {updateCompany.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecruiterCompanyPage;

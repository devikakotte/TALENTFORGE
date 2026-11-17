import {
  useAddCertification,
  useAddEducation,
  useAddExperience,
  useCandidateProfile,
  useRemoveCertification,
  useRemoveEducation,
  useRemoveExperience,
  useUpdateCertification,
  useUpdateEducation,
  useUpdateExperience,
  useUpdateProfile,
} from '../../hooks/useCandidateProfile';
import LoadingScreen from '../../components/common/LoadingScreen';
import ProfileBasicsForm from '../../components/candidate/ProfileBasicsForm';
import SkillsEditor from '../../components/candidate/SkillsEditor';
import CrudListSection from '../../components/candidate/CrudListSection';
import DiscoverabilityToggle from '../../components/candidate/DiscoverabilityToggle';

const EDUCATION_FIELDS = [
  { name: 'institution', label: 'Institution', required: true },
  { name: 'degree', label: 'Degree', required: true },
  { name: 'fieldOfStudy', label: 'Field of study' },
  { name: 'startDate', label: 'Start date', type: 'date', required: true },
  { name: 'isCurrent', label: 'I currently study here', type: 'checkbox' },
  { name: 'endDate', label: 'End date', type: 'date' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

const EXPERIENCE_FIELDS = [
  { name: 'jobTitle', label: 'Job title', required: true },
  { name: 'company', label: 'Company', required: true },
  { name: 'location', label: 'Location' },
  { name: 'startDate', label: 'Start date', type: 'date', required: true },
  { name: 'isCurrent', label: 'I currently work here', type: 'checkbox' },
  { name: 'endDate', label: 'End date', type: 'date' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

const CERTIFICATION_FIELDS = [
  { name: 'name', label: 'Certification name', required: true },
  { name: 'issuingOrganization', label: 'Issuing organization', required: true },
  { name: 'issueDate', label: 'Issue date', type: 'date' },
  { name: 'expirationDate', label: 'Expiration date', type: 'date' },
  { name: 'credentialId', label: 'Credential ID' },
  { name: 'credentialUrl', label: 'Credential URL' },
];

function formatMonthYear(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function CandidateProfilePage() {
  const { data: profile, isLoading } = useCandidateProfile();
  const updateProfile = useUpdateProfile();

  const addEducation = useAddEducation();
  const updateEducation = useUpdateEducation();
  const removeEducation = useRemoveEducation();

  const addExperience = useAddExperience();
  const updateExperience = useUpdateExperience();
  const removeExperience = useRemoveExperience();

  const addCertification = useAddCertification();
  const updateCertification = useUpdateCertification();
  const removeCertification = useRemoveCertification();

  if (isLoading) return <LoadingScreen label="Loading your profile..." />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Your profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Keep this up to date — recruiters see this when you apply.
        </p>
      </div>

      <ProfileBasicsForm
        profile={profile}
        onSubmit={(values) => updateProfile.mutate(values)}
        isSaving={updateProfile.isPending}
      />

      <DiscoverabilityToggle isDiscoverable={Boolean(profile?.isDiscoverable)} />

      <SkillsEditor
        skills={profile?.skills || []}
        verifiedSkills={profile?.verifiedSkills || []}
        onChange={(skills) => updateProfile.mutate({ skills })}
        isSaving={updateProfile.isPending}
      />

      <CrudListSection
        title="Education"
        items={profile?.education || []}
        fields={EDUCATION_FIELDS}
        addMutation={addEducation}
        updateMutation={updateEducation}
        removeMutation={removeEducation}
        renderSummary={(item) => (
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">{item.degree}</p>
            <p>{item.institution}{item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ''}</p>
            <p className="text-xs text-slate-400">
              {formatMonthYear(item.startDate)} — {item.isCurrent ? 'Present' : formatMonthYear(item.endDate)}
            </p>
          </div>
        )}
      />

      <CrudListSection
        title="Experience"
        items={profile?.experience || []}
        fields={EXPERIENCE_FIELDS}
        addMutation={addExperience}
        updateMutation={updateExperience}
        removeMutation={removeExperience}
        renderSummary={(item) => (
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">{item.jobTitle}</p>
            <p>{item.company}{item.location ? ` · ${item.location}` : ''}</p>
            <p className="text-xs text-slate-400">
              {formatMonthYear(item.startDate)} — {item.isCurrent ? 'Present' : formatMonthYear(item.endDate)}
            </p>
          </div>
        )}
      />

      <CrudListSection
        title="Certifications"
        items={profile?.certifications || []}
        fields={CERTIFICATION_FIELDS}
        addMutation={addCertification}
        updateMutation={updateCertification}
        removeMutation={removeCertification}
        renderSummary={(item) => (
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">{item.name}</p>
            <p>{item.issuingOrganization}</p>
            {item.issueDate && (
              <p className="text-xs text-slate-400">Issued {formatMonthYear(item.issueDate)}</p>
            )}
          </div>
        )}
      />
    </div>
  );
}

export default CandidateProfilePage;

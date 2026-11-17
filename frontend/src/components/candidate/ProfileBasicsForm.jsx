import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FormField from '../form/FormField';

function ProfileBasicsForm({ profile, onSubmit, isSaving }) {
  const saveProfile = (values) => onSubmit({
    headline: values.headline,
    bio: values.bio,
    phone: values.phone,
    location: values.location,
    socialLinks: values.socialLinks,
    projects: values.projectsText.split('\n').map((v) => v.trim()).filter(Boolean),
    achievements: values.achievementsText.split('\n').map((v) => v.trim()).filter(Boolean),
    preferences: values.preferencesText.split(',').map((v) => v.trim()).filter(Boolean),
    expectedSalary: values.expectedSalary ? Number(values.expectedSalary) : undefined,
    availability: values.availability,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      headline: '',
      bio: '',
      phone: '',
      location: '',
      socialLinks: { linkedin: '', github: '', portfolio: '', twitter: '' },
      projectsText: '',
      achievementsText: '',
      preferencesText: '',
      expectedSalary: '',
      availability: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        headline: profile.headline || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        projectsText: (profile.projects || []).join('\n'),
        achievementsText: (profile.achievements || []).join('\n'),
        preferencesText: (profile.preferences || []).join(', '),
        expectedSalary: profile.expectedSalary || '',
        availability: profile.availability || '',
        socialLinks: {
          linkedin: profile.socialLinks?.linkedin || '',
          github: profile.socialLinks?.github || '',
          portfolio: profile.socialLinks?.portfolio || '',
          twitter: profile.socialLinks?.twitter || '',
        },
      });
    }
  }, [profile, reset]);

  return (
    <form className="card flex flex-col gap-4" onSubmit={handleSubmit(saveProfile)} noValidate>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">About you</h2>

      <FormField label="Headline" id="headline" error={errors.headline}>
        <input
          id="headline"
          type="text"
          placeholder="e.g. Senior Frontend Engineer"
          className="input-field"
          {...register('headline', { maxLength: { value: 150, message: 'Headline is too long' } })}
        />
      </FormField>

      <FormField label="Bio" id="bio" error={errors.bio}>
        <textarea
          id="bio"
          rows={4}
          className="input-field"
          {...register('bio', { maxLength: { value: 2000, message: 'Bio is too long' } })}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Phone" id="phone" error={errors.phone}>
          <input id="phone" type="tel" className="input-field" {...register('phone')} />
        </FormField>
        <FormField label="Location" id="location" error={errors.location}>
          <input id="location" type="text" className="input-field" {...register('location')} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Expected salary" id="expectedSalary"><input id="expectedSalary" type="number" min="0" className="input-field" placeholder="e.g. 800000" {...register('expectedSalary')} /></FormField>
        <FormField label="Availability" id="availability"><input id="availability" className="input-field" placeholder="e.g. Immediate / 30 days" {...register('availability')} /></FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Projects" id="projectsText"><textarea id="projectsText" rows={4} className="input-field" placeholder="One project per line" {...register('projectsText')} /></FormField>
        <FormField label="Achievements" id="achievementsText"><textarea id="achievementsText" rows={4} className="input-field" placeholder="One achievement per line" {...register('achievementsText')} /></FormField>
      </div>
      <FormField label="Preferred roles / locations" id="preferencesText"><input id="preferencesText" className="input-field" placeholder="Backend Developer, Remote, Hyderabad" {...register('preferencesText')} /></FormField>

      <h3 className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Social links</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="LinkedIn" id="linkedin" error={errors.socialLinks?.linkedin}>
          <input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/..."
            className="input-field"
            {...register('socialLinks.linkedin')}
          />
        </FormField>
        <FormField label="GitHub" id="github" error={errors.socialLinks?.github}>
          <input
            id="github"
            type="url"
            placeholder="https://github.com/..."
            className="input-field"
            {...register('socialLinks.github')}
          />
        </FormField>
        <FormField label="Portfolio" id="portfolio" error={errors.socialLinks?.portfolio}>
          <input
            id="portfolio"
            type="url"
            className="input-field"
            {...register('socialLinks.portfolio')}
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
        <button type="submit" className="btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

export default ProfileBasicsForm;

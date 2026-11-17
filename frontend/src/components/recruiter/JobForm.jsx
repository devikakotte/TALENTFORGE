import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FormField from '../form/FormField';

const JOB_CATEGORIES = [
  'engineering',
  'design',
  'product',
  'marketing',
  'sales',
  'customer-support',
  'operations',
  'finance',
  'hr',
  'other',
];
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];

function toMultiline(arr) {
  return (arr || []).join('\n');
}

function fromMultiline(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function JobForm({ job, onSubmit, isSubmitting, submitLabel = 'Save' }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'engineering',
      jobType: 'full-time',
      experienceLevel: 'mid',
      location: '',
      isRemote: false,
      salaryMin: '',
      salaryMax: '',
      currency: 'USD',
      applicationDeadline: '',
      skills: '',
      responsibilities: '',
      requirements: '',
    },
  });

  useEffect(() => {
    if (job) {
      reset({
        title: job.title || '',
        description: job.description || '',
        category: job.category || 'engineering',
        jobType: job.jobType || 'full-time',
        experienceLevel: job.experienceLevel || 'mid',
        location: job.location || '',
        isRemote: Boolean(job.isRemote),
        salaryMin: job.salaryMin ?? '',
        salaryMax: job.salaryMax ?? '',
        currency: job.currency || 'USD',
        applicationDeadline: job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : '',
        skills: (job.skills || []).join(', '),
        responsibilities: toMultiline(job.responsibilities),
        requirements: toMultiline(job.requirements),
      });
    }
  }, [job, reset]);

  const submit = (values) => {
    onSubmit({
      ...values,
      salaryMin: values.salaryMin ? Number(values.salaryMin) : undefined,
      salaryMax: values.salaryMax ? Number(values.salaryMax) : undefined,
      applicationDeadline: values.applicationDeadline || undefined,
      skills: values.skills
        ? values.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      responsibilities: fromMultiline(values.responsibilities),
      requirements: fromMultiline(values.requirements),
    });
  };

  return (
    <form className="card flex flex-col gap-4" onSubmit={handleSubmit(submit)} noValidate>
      <FormField label="Job title" id="title" error={errors.title}>
        <input
          id="title"
          type="text"
          className="input-field"
          {...register('title', { required: 'Job title is required' })}
        />
      </FormField>

      <FormField label="Description" id="description" error={errors.description}>
        <textarea
          id="description"
          rows={5}
          className="input-field"
          {...register('description', { required: 'Description is required' })}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Category" id="category" error={errors.category}>
          <select id="category" className="input-field" {...register('category')}>
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('-', ' ')}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Job type" id="jobType" error={errors.jobType}>
          <select id="jobType" className="input-field" {...register('jobType')}>
            {JOB_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace('-', ' ')}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Experience level" id="experienceLevel" error={errors.experienceLevel}>
          <select id="experienceLevel" className="input-field" {...register('experienceLevel')}>
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Location" id="location" error={errors.location}>
          <input id="location" type="text" className="input-field" {...register('location')} />
        </FormField>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" className="rounded" {...register('isRemote')} />
          This role is remote
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Min salary" id="salaryMin" error={errors.salaryMin}>
          <input id="salaryMin" type="number" className="input-field" {...register('salaryMin')} />
        </FormField>
        <FormField label="Max salary" id="salaryMax" error={errors.salaryMax}>
          <input id="salaryMax" type="number" className="input-field" {...register('salaryMax')} />
        </FormField>
        <FormField label="Currency" id="currency" error={errors.currency}>
          <input id="currency" type="text" className="input-field" {...register('currency')} />
        </FormField>
      </div>

      <FormField label="Application deadline" id="applicationDeadline" error={errors.applicationDeadline}>
        <input
          id="applicationDeadline"
          type="date"
          className="input-field max-w-xs"
          {...register('applicationDeadline')}
        />
      </FormField>

      <FormField label="Skills (comma-separated)" id="skills" error={errors.skills}>
        <input
          id="skills"
          type="text"
          placeholder="React, Node.js, MongoDB"
          className="input-field"
          {...register('skills')}
        />
      </FormField>

      <FormField label="Responsibilities (one per line)" id="responsibilities" error={errors.responsibilities}>
        <textarea id="responsibilities" rows={4} className="input-field" {...register('responsibilities')} />
      </FormField>

      <FormField label="Requirements (one per line)" id="requirements" error={errors.requirements}>
        <textarea id="requirements" rows={4} className="input-field" {...register('requirements')} />
      </FormField>

      <div>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default JobForm;

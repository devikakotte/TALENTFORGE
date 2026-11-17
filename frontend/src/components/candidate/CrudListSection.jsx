import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import FormField from '../form/FormField';

/**
 * Renders an "Add new" form plus a list of existing entries (each with
 * inline Edit/Delete), driven entirely by a `fields` config. Used for
 * education, experience, and certifications so the three nearly-identical
 * CRUD flows share one implementation instead of three copies.
 */
function CrudListSection({ title, items, fields, addMutation, updateMutation, removeMutation, renderSummary }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="btn-secondary gap-1.5 text-sm"
          >
            <Plus size={16} />
            Add
          </button>
        )}
      </div>

      {isAdding && (
        <EntryForm
          fields={fields}
          onCancel={() => setIsAdding(false)}
          onSubmit={(values) =>
            addMutation.mutate(values, { onSuccess: () => setIsAdding(false) })
          }
          isSubmitting={addMutation.isPending}
        />
      )}

      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item._id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            {editingId === item._id ? (
              <EntryForm
                fields={fields}
                defaultValues={item}
                onCancel={() => setEditingId(null)}
                onSubmit={(values) =>
                  updateMutation.mutate(
                    { itemId: item._id, payload: values },
                    { onSuccess: () => setEditingId(null) },
                  )
                }
                isSubmitting={updateMutation.isPending}
              />
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm text-slate-700 dark:text-slate-300">{renderSummary(item)}</div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label="Edit"
                    onClick={() => setEditingId(item._id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => removeMutation.mutate(item._id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {items.length === 0 && !isAdding && (
          <p className="text-sm text-slate-400 dark:text-slate-500">Nothing added yet.</p>
        )}
      </ul>
    </div>
  );
}

function toInputDate(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function EntryForm({ fields, defaultValues = {}, onCancel, onSubmit, isSubmitting }) {
  const normalizedDefaults = { ...defaultValues };
  fields.forEach((field) => {
    if (field.type === 'date') {
      normalizedDefaults[field.name] = toInputDate(defaultValues[field.name]);
    }
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: normalizedDefaults });

  const isCurrent = watch('isCurrent');

  return (
    <form
      className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {fields.map((field) => {
        if (field.name === 'endDate' && isCurrent) return null;
        if (field.type === 'checkbox') {
          return (
            <label key={field.name} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" {...register(field.name)} className="rounded" />
              {field.label}
            </label>
          );
        }
        return (
          <FormField key={field.name} label={field.label} id={field.name} error={errors[field.name]}>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                rows={3}
                className="input-field"
                {...register(field.name, { required: field.required && `${field.label} is required` })}
              />
            ) : (
              <input
                id={field.name}
                type={field.type || 'text'}
                className="input-field"
                {...register(field.name, { required: field.required && `${field.label} is required` })}
              />
            )}
          </FormField>
        );
      })}

      <div className="mt-1 flex gap-2">
        <button type="submit" className="btn-primary text-sm" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary gap-1 text-sm">
          <X size={14} />
          Cancel
        </button>
      </div>
    </form>
  );
}

export default CrudListSection;

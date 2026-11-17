function FormField({ label, id, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
}

export default FormField;

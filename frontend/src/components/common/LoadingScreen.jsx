function LoadingScreen({ label = 'Loading...' }) {
  return (
    <div className="flex h-full min-h-[50vh] w-full flex-col items-center justify-center gap-3">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"
        role="status"
        aria-label={label}
      />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export default LoadingScreen;

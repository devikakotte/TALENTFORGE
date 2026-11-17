const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  open: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  closed: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
};

function JobStatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        STATUS_STYLES[status] || STATUS_STYLES.draft
      }`}
    >
      {status}
    </span>
  );
}

export default JobStatusBadge;

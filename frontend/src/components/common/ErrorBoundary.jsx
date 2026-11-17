import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production this should report to an error-tracking service
    // (e.g. Sentry) rather than only logging to the console.
    // eslint-disable-next-line no-console
    console.error('Uncaught application error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign('/');
  };

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="flex h-full min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center dark:bg-slate-950">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            An unexpected error occurred. Please try reloading the page. If the problem
            persists, contact support.
          </p>
          <button type="button" className="btn-primary" onClick={this.handleReload}>
            Reload TalentForge
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

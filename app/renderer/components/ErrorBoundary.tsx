import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary. Catches render-phase exceptions in the
 * React tree (Monaco, the preview, anything else) and shows a recovery
 * surface instead of a blank window. We deliberately don't try to be
 * clever here - the goal is "the user is never stranded."
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Keep this for when we add a crash reporter (Sentry / a small file
    // logger) in Phase 6. For now, console is enough to keep devs sane.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg text-fg p-6">
        <div className="max-w-md w-full bg-bg-elevated border border-border rounded-lg p-6 shadow-overlay">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-warn shrink-0 mt-0.5" />
            <div>
              <h1 className="text-base font-semibold tracking-tight">Something broke</h1>
              <p className="text-xs text-fg-muted mt-1">
                The renderer hit an unrecoverable error. Your unsaved work may be lost.
              </p>
            </div>
          </div>

          <pre className="text-[11px] font-mono whitespace-pre-wrap overflow-auto p-2.5 rounded border border-border bg-surface-1 text-fg-muted max-h-48 mb-4">
            {this.state.error.stack || this.state.error.message || 'Unknown error'}
          </pre>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="h-8 px-3 text-xs rounded-md border border-border bg-surface-1 hover:bg-surface-2 transition-colors"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="h-8 px-3 text-xs rounded-md bg-accent text-accent-fg hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Reload window
            </button>
          </div>
        </div>
      </div>
    );
  }
}

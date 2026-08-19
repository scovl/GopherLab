import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
  componentStack?: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error);
    this.setState({ componentStack: info.componentStack ?? undefined });
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '1rem', border: '2px solid #ef4444', borderRadius: '8px', background: '#fef2f2', color: '#7f1d1d', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          <strong>Erro de renderização:</strong>
          {'\n'}
          {String(this.state.error?.message ?? this.state.error)}
          {'\n\n'}
          <strong>Onde ocorreu:</strong>
          {'\n'}
          {this.state.componentStack ?? '(sem stack)'}
        </div>
      );
    }
    return this.props.children;
  }
}
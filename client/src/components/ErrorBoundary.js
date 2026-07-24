import React from 'react';
import { api } from '../api/client';

// App-wide safety net. A render error anywhere below this boundary previously
// blanked the whole app to a white screen (React unmounts the tree when an
// error is uncaught). Now we catch it, keep the header/nav alive, show a
// recoverable message, and quietly log the real error to the backend so the
// root cause can be found and fixed.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: (error && error.message) || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    try {
      // eslint-disable-next-line no-console
      console.error('Caught by ErrorBoundary:', error, info);
      if (api && api.logClientError) {
        api.logClientError({
          message: (error && error.message) || String(error),
          stack: (error && error.stack) || '',
          component_stack: (info && info.componentStack) || '',
          url: window.location.href,
        }).catch(() => {});
      }
    } catch (_) { /* never let logging throw */ }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 560, margin: '40px auto', padding: '24px', background: '#fff', border: '1px solid #fecaca', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
          <h2 style={{ margin: '0 0 8px', color: '#991b1b', fontSize: '1.1rem' }}>Something hiccuped on this screen</h2>
          <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '0.9rem' }}>
            Your work was saved. This view hit a snag and stopped rendering. Reload to continue — nothing was lost.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Reload</button>
            <button onClick={() => { window.location.href = '/records'; }} style={{ padding: '8px 16px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Back to Records</button>
          </div>
          {this.state.message && (
            <p style={{ marginTop: 14, color: '#9ca3af', fontSize: '0.75rem', fontFamily: 'monospace' }}>{this.state.message}</p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

import { Component } from 'react';

export class PreviewErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.themeId !== this.props.themeId) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      const label = this.props.label || 'Preview unavailable';

      return (
        <div style={{
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: '#1a1a1a', color: '#737373', fontSize: '13px',
          flexDirection: 'column', gap: '6px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {label}
        </div>
      );
    }
    return this.props.children;
  }
}

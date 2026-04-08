import React from 'react';

class DebugBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("DEBUG ERROR BOUNDARY CAUGHT ERROR:", error, errorInfo);
    
    // Auto-write dump to file for the AI to read!
    fetch('http://localhost:5000', { method: 'POST', body: 'crash' }) // Dummy trigger, but safer:
      .catch(() => {});
    
    try {
       // Since we are in browser, we can't write to file directly. We will force the error text into local storage!
       localStorage.setItem('LAST_CRASH', error.toString() + '\\n' + errorInfo.componentStack);
    } catch(e) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#fee2e2', color: '#991b1b', border: '2px solid #ef4444', margin: '2rem', borderRadius: '12px', zIndex: 9999, position: 'relative' }}>
          <h2>Something went wrong in the component!</h2>
          <details open style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', background: '#f8717122', padding: '1rem', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default DebugBoundary;

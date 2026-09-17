import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 text-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#f59e0b' }}>
              Etwas ist schiefgelaufen.
            </h1>
            <p className="text-gray-300 mb-6">
              Bitte laden Sie die Seite neu oder kontaktieren Sie uns direkt.
            </p>
            <a
              href="/"
              className="inline-block bg-[#f59e0b] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#ffc61a] transition-colors"
            >
              Zur Startseite
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

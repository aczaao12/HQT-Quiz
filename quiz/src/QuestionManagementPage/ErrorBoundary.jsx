import React from 'react';
import { Alert, Container } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in QuestionManagementPage:", error, errorInfo);
    this.setState({ errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Container className="py-5">
          <Alert variant="danger" className="text-center">
            <Alert.Heading>Oops! Something went wrong in this section.</Alert.Heading>
            <p>We're sorry, but an error occurred while displaying the question management interface.</p>
            <p>Please try refreshing the page or contact support if the issue persists.</p>
            {this.props.showDetails && this.state.error && (
              <details className="mt-3 text-start">
                <summary>Error Details</summary>
                <p>{this.state.error && this.state.error.toString()}</p>
                <p>Component Stack Error:</p>
                <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

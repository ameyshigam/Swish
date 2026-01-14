import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <div className="p-8 bg-card rounded-lg shadow-md border border-border text-center max-w-2xl">
                        <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
                        <p className="text-foreground mb-4">We're sorry, but an unexpected error has occurred.</p>
                        {this.state.error && (
                            <pre className="text-left bg-muted p-4 rounded overflow-auto text-sm mb-4 max-w-full text-foreground">
                                {this.state.error.toString()}
                                <br />
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 focus:outline-none"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

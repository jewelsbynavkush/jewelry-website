'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { logError } from '@/lib/security/error-handler';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error securely using error handler
    logError('ErrorBoundary', error);
    // Also log errorInfo in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary errorInfo:', errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-[#2a2a2a] mb-4 sm:mb-6">Something went wrong</h1>
            <p className="text-[#6a6a6a] mb-6 sm:mb-8">
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


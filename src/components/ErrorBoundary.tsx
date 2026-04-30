"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Global Error Boundary
 * Catches unhandled errors in the component tree and logs them to Cloud Logging.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Unhandled UI Error", {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center glass rounded-3xl m-4 animate-in fade-in zoom-in">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mb-6">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-foreground/60 mb-8 max-w-md">
              Our intelligent systems have logged this issue. Please try
              refreshing the page or navigating back.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-95"
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

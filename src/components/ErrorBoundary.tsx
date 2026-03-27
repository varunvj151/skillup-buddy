import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 border-destructive/20 shadow-2xl backdrop-blur-sm bg-card/50 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-8">
              {this.state.error?.message || "An unexpected error occurred while loading the application."}
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full h-12 rounded-full font-semibold gap-2"
              >
                <RefreshCcw className="w-4 h-4" /> Reload Page
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full h-12 rounded-full font-semibold"
              >
                Return to Home
              </Button>
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                System Status: Degraded
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

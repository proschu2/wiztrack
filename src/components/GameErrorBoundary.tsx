"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[WizTrack] Error loading game:", error, errorInfo);
  }

  handleStartNewGame = () => {
    localStorage.removeItem("wiztrack_game");
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center space-y-4">
              <h2 className="text-xl font-semibold text-destructive">
                Unable to Load Game
              </h2>
              <p className="text-muted-foreground">
                {this.props.fallbackMessage || 
                  "Something went wrong while loading your game. Please start a new game."}
              </p>
              <Button onClick={this.handleStartNewGame} className="w-full">
                Start New Game
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GameErrorBoundary;
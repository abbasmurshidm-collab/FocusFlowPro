import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FocusSession } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Timer() {
  const { toast } = useToast();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<"focus" | "break">("focus");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: sessions, isLoading } = useQuery<FocusSession[]>({
    queryKey: ["/api/focus-sessions"],
  });

  const startSessionMutation = useMutation({
    mutationFn: (data: { sessionType: "focus" | "break" }) =>
      apiRequest("POST", "/api/focus-sessions/start", data),
    onSuccess: (data: any) => {
      setCurrentSessionId(data.id);
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/focus-sessions/end`, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      setCurrentSessionId(null);
    },
  });

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            setMinutes((prevMin) => {
              if (prevMin === 0) {
                handleTimerComplete();
                return 0;
              }
              return prevMin - 1;
            });
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (currentSessionId) {
      endSessionMutation.mutate(currentSessionId);
    }
    toast({
      title: sessionType === "focus" ? "Focus session complete!" : "Break time over!",
      description: sessionType === "focus" ? "Great work! Time for a break." : "Ready to focus again?",
    });
  };

  const handleStart = () => {
    if (!isRunning && !currentSessionId) {
      startSessionMutation.mutate({ sessionType });
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(sessionType === "focus" ? 25 : 5);
    setSeconds(0);
    if (currentSessionId) {
      endSessionMutation.mutate(currentSessionId);
    }
  };

  const handleSwitchType = (type: "focus" | "break") => {
    setSessionType(type);
    setMinutes(type === "focus" ? 25 : 5);
    setSeconds(0);
    setIsRunning(false);
    if (currentSessionId) {
      endSessionMutation.mutate(currentSessionId);
    }
  };

  const totalMinutes = sessions?.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) || 0;
  const totalSessions = sessions?.filter(s => s.sessionType === "focus").length || 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Focus Timer</h1>
        <p className="text-muted-foreground">Stay focused with the Pomodoro technique</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8">
              {/* Session Type Toggle */}
              <div className="flex gap-2 mb-8 justify-center">
                <Button
                  variant={sessionType === "focus" ? "default" : "outline"}
                  onClick={() => handleSwitchType("focus")}
                  disabled={isRunning}
                  data-testid="button-focus-mode"
                >
                  Focus (25 min)
                </Button>
                <Button
                  variant={sessionType === "break" ? "default" : "outline"}
                  onClick={() => handleSwitchType("break")}
                  disabled={isRunning}
                  data-testid="button-break-mode"
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  Break (5 min)
                </Button>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="text-8xl font-mono font-bold mb-4" data-testid="text-timer-display">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </div>
                <p className="text-muted-foreground">
                  {sessionType === "focus" ? "Focus Session" : "Break Time"}
                </p>
              </div>

              {/* Controls */}
              <div className="flex gap-4 justify-center">
                {!isRunning ? (
                  <Button size="lg" onClick={handleStart} data-testid="button-start-timer">
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </Button>
                ) : (
                  <Button size="lg" onClick={handlePause} variant="secondary" data-testid="button-pause-timer">
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                )}
                <Button size="lg" onClick={handleReset} variant="outline" data-testid="button-reset-timer">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Card data-testid="card-timer-stats">
            <CardHeader>
              <CardTitle>Today's Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : (
                <>
                  <div className="text-center p-4 rounded-md bg-muted">
                    <div className="text-3xl font-bold" data-testid="text-total-sessions">
                      {totalSessions}
                    </div>
                    <p className="text-sm text-muted-foreground">Sessions Completed</p>
                  </div>
                  <div className="text-center p-4 rounded-md bg-muted">
                    <div className="text-3xl font-bold" data-testid="text-total-minutes">
                      {totalMinutes}
                    </div>
                    <p className="text-sm text-muted-foreground">Minutes Focused</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : sessions && sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted"
                      data-testid={`history-session-${session.id}`}
                    >
                      <span className="text-sm">
                        {session.sessionType === "focus" ? "Focus" : "Break"}
                      </span>
                      <span className="text-sm font-medium">
                        {session.durationMinutes || 0} min
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sessions yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

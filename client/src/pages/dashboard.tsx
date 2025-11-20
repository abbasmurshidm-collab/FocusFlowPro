import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Flame, ListTodo, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Task, FocusSession, Habit } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachResponse, setCoachResponse] = useState("");
  const [loadingCoach, setLoadingCoach] = useState(false);

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery<FocusSession[]>({
    queryKey: ["/api/focus-sessions"],
  });

  const { data: habits, isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const isLoading = tasksLoading || sessionsLoading || habitsLoading;

  const completedTasks = tasks?.filter(t => t.status === "completed").length || 0;
  const totalTasks = tasks?.length || 0;
  const focusTime = sessions?.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) || 0;
  const currentStreak = habits?.reduce((max, h) => Math.max(max, h.currentStreak), 0) || 0;

  const handleAskCoach = async () => {
    if (!coachQuestion.trim()) return;

    setLoadingCoach(true);
    try {
      const response = await fetch("/api/ai/coach-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: coachQuestion }),
      });

      if (!response.ok) throw new Error("Failed to get coach advice");

      const data = await response.json();
      setCoachResponse(data.advice);
      setCoachQuestion("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI coach advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingCoach(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your productivity overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-tasks-completed">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-tasks-completed">
                  {completedTasks}/{totalTasks}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% complete` : "No tasks yet"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-focus-time">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-focus-time">
                  {focusTime} min
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.floor(focusTime / 60)}h {focusTime % 60}m total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-current-streak">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-current-streak">
                  {currentStreak} days
                </div>
                <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-active-tasks">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-active-tasks">
                  {tasks?.filter(t => t.status !== "completed").length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">In progress</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Coach Widget */}
      <Card data-testid="card-ai-coach">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Productivity Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Ask me anything about productivity, time management, or staying focused..."
              value={coachQuestion}
              onChange={(e) => setCoachQuestion(e.target.value)}
              className="min-h-[80px] resize-none"
              data-testid="input-coach-question"
            />
            <Button
              onClick={handleAskCoach}
              disabled={loadingCoach || !coachQuestion.trim()}
              className="w-full"
              data-testid="button-ask-coach"
            >
              {loadingCoach ? "Thinking..." : "Get AI Advice"}
            </Button>
          </div>

          {coachResponse && (
            <div className="p-4 rounded-md bg-muted" data-testid="text-coach-response">
              <p className="text-sm leading-relaxed">{coachResponse}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

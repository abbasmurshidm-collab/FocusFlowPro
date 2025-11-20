import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Target, CheckCircle2 } from "lucide-react";
import type { Task, FocusSession, Habit } from "@shared/schema";

export default function Analytics() {
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

  // Calculate analytics
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === "completed").length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const highPriorityCompleted = tasks?.filter(t => t.priority === "high" && t.status === "completed").length || 0;
  const mediumPriorityCompleted = tasks?.filter(t => t.priority === "medium" && t.status === "completed").length || 0;
  const lowPriorityCompleted = tasks?.filter(t => t.priority === "low" && t.status === "completed").length || 0;

  const totalFocusTime = sessions?.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) || 0;
  const focusSessions = sessions?.filter(s => s.sessionType === "focus").length || 0;

  const activeHabits = habits?.length || 0;
  const totalStreak = habits?.reduce((sum, h) => sum + h.currentStreak, 0) || 0;

  const categoryBreakdown = tasks?.reduce((acc, task) => {
    const category = task.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Insights into your productivity patterns</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-completion-rate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-completion-rate">
                  {completionRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTasks} of {totalTasks} tasks
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-focus">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-focus">
                  {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {focusSessions} sessions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-active-habits">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
            <Target className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-active-habits">
                  {activeHabits}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalStreak} total streak days
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-avg-session">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-avg-session">
                  {focusSessions > 0 ? Math.round(totalFocusTime / focusSessions) : 0} min
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per focus session
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority Breakdown */}
      <Card data-testid="card-priority-breakdown">
        <CardHeader>
          <CardTitle>Tasks by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="font-medium">High Priority</span>
                </div>
                <span className="text-2xl font-bold" data-testid="text-high-priority">
                  {highPriorityCompleted}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="font-medium">Medium Priority</span>
                </div>
                <span className="text-2xl font-bold" data-testid="text-medium-priority">
                  {mediumPriorityCompleted}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="font-medium">Low Priority</span>
                </div>
                <span className="text-2xl font-bold" data-testid="text-low-priority">
                  {lowPriorityCompleted}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card data-testid="card-category-breakdown">
        <CardHeader>
          <CardTitle>Tasks by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : categoryBreakdown && Object.keys(categoryBreakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(categoryBreakdown).map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 rounded-md bg-muted"
                  data-testid={`category-${category}`}
                >
                  <span className="font-medium">{category}</span>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No categorized tasks yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Flame, CheckCircle2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Habit, InsertHabit } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Habits() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHabit, setNewHabit] = useState<Partial<InsertHabit>>({
    name: "",
    description: "",
    frequency: "daily",
  });

  const { data: habits, isLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const createHabitMutation = useMutation({
    mutationFn: (habit: InsertHabit) => apiRequest("POST", "/api/habits", habit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "Success", description: "Habit created successfully" });
      setIsAddDialogOpen(false);
      setNewHabit({ name: "", description: "", frequency: "daily" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create habit", variant: "destructive" });
    },
  });

  const checkInHabitMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/habits/${id}/check-in`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "Success", description: "Great job! Streak updated." });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/habits/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "Success", description: "Habit deleted" });
    },
  });

  const isCompletedToday = (habit: Habit) => {
    if (!habit.lastCompletedAt) return false;
    const lastCompleted = new Date(habit.lastCompletedAt);
    const today = new Date();
    return (
      lastCompleted.getDate() === today.getDate() &&
      lastCompleted.getMonth() === today.getMonth() &&
      lastCompleted.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Habits</h1>
          <p className="text-muted-foreground">Build consistent habits and track your streaks</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-habit">
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-add-habit">
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="e.g., Morning meditation"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  data-testid="input-habit-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="What makes this habit important?"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  data-testid="input-habit-description"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <Select
                  value={newHabit.frequency}
                  onValueChange={(value) => setNewHabit({ ...newHabit, frequency: value as any })}
                >
                  <SelectTrigger data-testid="select-habit-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => createHabitMutation.mutate(newHabit as InsertHabit)}
                disabled={!newHabit.name || createHabitMutation.isPending}
                className="w-full"
                data-testid="button-create-habit"
              >
                {createHabitMutation.isPending ? "Creating..." : "Create Habit"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Habits Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : habits && habits.length > 0 ? (
          habits.map((habit) => {
            const completedToday = isCompletedToday(habit);
            return (
              <Card key={habit.id} className="hover-elevate" data-testid={`card-habit-${habit.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg" data-testid={`text-habit-name-${habit.id}`}>
                      {habit.name}
                    </CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {habit.frequency}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteHabitMutation.mutate(habit.id)}
                    data-testid={`button-delete-habit-${habit.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {habit.description && (
                    <p className="text-sm text-muted-foreground">{habit.description}</p>
                  )}

                  {/* Streak Info */}
                  <div className="flex items-center justify-around p-3 rounded-md bg-muted">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Flame className="w-4 h-4 text-warning" />
                        <span className="text-2xl font-bold" data-testid={`text-streak-${habit.id}`}>
                          {habit.currentStreak}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Current</p>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div className="text-center">
                      <div className="text-2xl font-bold" data-testid={`text-best-streak-${habit.id}`}>
                        {habit.bestStreak}
                      </div>
                      <p className="text-xs text-muted-foreground">Best</p>
                    </div>
                  </div>

                  {/* Check-in Button */}
                  <Button
                    onClick={() => checkInHabitMutation.mutate(habit.id)}
                    disabled={completedToday || checkInHabitMutation.isPending}
                    className="w-full"
                    variant={completedToday ? "secondary" : "default"}
                    data-testid={`button-checkin-habit-${habit.id}`}
                  >
                    {completedToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed Today
                      </>
                    ) : (
                      "Check In"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No habits yet. Create one to start building consistency!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

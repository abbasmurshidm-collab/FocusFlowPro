import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task, InsertTask } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Tasks() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "todo" | "completed">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [goal, setGoal] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const [newTask, setNewTask] = useState<Partial<InsertTask>>({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    category: "",
    estimatedMinutes: 60,
  });

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const createTaskMutation = useMutation({
    mutationFn: (task: InsertTask) => apiRequest("POST", "/api/tasks", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Success", description: "Task created successfully" });
      setIsAddDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        category: "",
        estimatedMinutes: 60,
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Task>) =>
      apiRequest("PATCH", `/api/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Success", description: "Task deleted" });
    },
  });

  const handleToggleComplete = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      status: task.status === "completed" ? "todo" : "completed",
      completedAt: task.status === "completed" ? null : new Date(),
    });
  };

  const handleGenerateTasks = async () => {
    if (!goal.trim()) return;

    setLoadingAI(true);
    try {
      const response = await fetch("/api/ai/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });

      if (!response.ok) throw new Error("Failed to generate tasks");

      const data = await response.json();
      
      // Create all generated tasks
      for (const taskData of data.tasks) {
        await createTaskMutation.mutateAsync(taskData as InsertTask);
      }

      setGoal("");
      setIsAIDialogOpen(false);
      toast({ title: "Success", description: `Generated ${data.tasks.length} tasks!` });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const filteredTasks = tasks?.filter((task) => {
    if (filter === "all") return true;
    if (filter === "todo") return task.status !== "completed";
    if (filter === "completed") return task.status === "completed";
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-muted-foreground">Manage your tasks and boost productivity</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-ai-generate">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-ai-generate">
              <DialogHeader>
                <DialogTitle>AI Task Generator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe your goal... (e.g., Build a personal portfolio website)"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="min-h-[100px] resize-none"
                  data-testid="input-ai-goal"
                />
                <Button
                  onClick={handleGenerateTasks}
                  disabled={loadingAI || !goal.trim()}
                  className="w-full"
                  data-testid="button-generate-tasks"
                >
                  {loadingAI ? "Generating..." : "Generate Tasks"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-task">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-add-task">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    data-testid="input-task-title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    data-testid="input-task-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}
                    >
                      <SelectTrigger data-testid="select-task-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Est. Time (min)</label>
                    <Input
                      type="number"
                      value={newTask.estimatedMinutes}
                      onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) || 0 })}
                      data-testid="input-task-time"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    placeholder="e.g., Work, Personal, Learning"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    data-testid="input-task-category"
                  />
                </div>
                <Button
                  onClick={() => createTaskMutation.mutate(newTask as InsertTask)}
                  disabled={!newTask.title || createTaskMutation.isPending}
                  className="w-full"
                  data-testid="button-create-task"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          data-testid="filter-all"
        >
          All
        </Button>
        <Button
          variant={filter === "todo" ? "default" : "outline"}
          onClick={() => setFilter("todo")}
          data-testid="filter-active"
        >
          Active
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
          data-testid="filter-completed"
        >
          Completed
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : filteredTasks && filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover-elevate" data-testid={`card-task-${task.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={() => handleToggleComplete(task)}
                    className="mt-1"
                    data-testid={`checkbox-task-${task.id}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <h3
                        className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                        data-testid={`text-task-title-${task.id}`}
                      >
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(task.priority)} data-testid={`badge-priority-${task.id}`}>
                          {task.priority}
                        </Badge>
                        {task.category && (
                          <Badge variant="outline" data-testid={`badge-category-${task.id}`}>
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}
                    {task.estimatedMinutes && (
                      <p className="text-xs text-muted-foreground">
                        Est. {task.estimatedMinutes} minutes
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTaskMutation.mutate(task.id)}
                    data-testid={`button-delete-task-${task.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No tasks found. Create one to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

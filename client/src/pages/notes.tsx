import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Sparkles, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Note, InsertNote } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Notes() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");

  const [newNote, setNewNote] = useState<Partial<InsertNote>>({
    title: "",
    content: "",
  });

  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const createNoteMutation = useMutation({
    mutationFn: (note: InsertNote) => apiRequest("POST", "/api/notes", note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Success", description: "Note created successfully" });
      setIsAddDialogOpen(false);
      setNewNote({ title: "", content: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create note", variant: "destructive" });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Note>) =>
      apiRequest("PATCH", `/api/notes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Success", description: "Note updated successfully" });
      setEditingNote(null);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Success", description: "Note deleted" });
    },
  });

  const handleSummarize = async (note: Note) => {
    setSummarizingId(note.id);
    setSummary("");
    try {
      const response = await fetch("/api/ai/summarize-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note.content }),
      });

      if (!response.ok) throw new Error("Failed to summarize");

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to summarize note",
        variant: "destructive",
      });
    } finally {
      setSummarizingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notes</h1>
          <p className="text-muted-foreground">Capture ideas and AI-powered summaries</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-note">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" data-testid="dialog-add-note">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  data-testid="input-note-title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Write your note here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="min-h-[200px] resize-none"
                  data-testid="input-note-content"
                />
              </div>
              <Button
                onClick={() => createNoteMutation.mutate(newNote as InsertNote)}
                disabled={!newNote.title || !newNote.content || createNoteMutation.isPending}
                className="w-full"
                data-testid="button-create-note"
              >
                {createNoteMutation.isPending ? "Creating..." : "Create Note"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      {editingNote && (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent className="max-w-2xl" data-testid="dialog-edit-note">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  data-testid="input-edit-note-title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="min-h-[200px] resize-none"
                  data-testid="input-edit-note-content"
                />
              </div>
              <Button
                onClick={() => updateNoteMutation.mutate(editingNote)}
                disabled={updateNoteMutation.isPending}
                className="w-full"
                data-testid="button-update-note"
              >
                {updateNoteMutation.isPending ? "Updating..." : "Update Note"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Notes Grid */}
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
        ) : notes && notes.length > 0 ? (
          notes.map((note) => (
            <Card key={note.id} className="hover-elevate" data-testid={`card-note-${note.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                <CardTitle className="text-lg flex-1 min-w-0" data-testid={`text-note-title-${note.id}`}>
                  {note.title}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingNote(note)}
                    data-testid={`button-edit-note-${note.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                    data-testid={`button-delete-note-${note.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {note.content}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSummarize(note)}
                  disabled={summarizingId === note.id}
                  className="w-full"
                  data-testid={`button-summarize-note-${note.id}`}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {summarizingId === note.id ? "Summarizing..." : "AI Summarize"}
                </Button>

                {summary && summarizingId === null && (
                  <div className="p-3 rounded-md bg-muted" data-testid={`text-summary-${note.id}`}>
                    <p className="text-sm font-medium mb-1">AI Summary:</p>
                    <p className="text-sm">{summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No notes yet. Create one to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

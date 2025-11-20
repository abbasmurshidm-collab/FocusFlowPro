import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateTasks, getCoachAdvice, summarizeNote } from "./ai/gemini";
import {
  insertTaskSchema,
  insertFocusSessionSchema,
  insertHabitSchema,
  insertNoteSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============= Tasks API =============
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, validatedData);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const success = await storage.deleteTask(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= AI Task Generation =============
  app.post("/api/ai/generate-tasks", async (req, res) => {
    try {
      const { goal } = req.body;
      if (!goal) {
        return res.status(400).json({ error: "Goal is required" });
      }

      const tasks = await generateTasks(goal);
      res.json({ tasks });
    } catch (error: any) {
      console.error("AI task generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============= Focus Sessions API =============
  app.get("/api/focus-sessions", async (req, res) => {
    try {
      const sessions = await storage.getFocusSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/focus-sessions/start", async (req, res) => {
    try {
      const validatedData = insertFocusSessionSchema.parse({
        startTime: new Date(),
        sessionType: req.body.sessionType || "focus",
        taskId: req.body.taskId || null,
        endTime: null,
        durationMinutes: null,
      });
      const session = await storage.createFocusSession(validatedData);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/focus-sessions/end", async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const session = await storage.getFocusSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const endTime = new Date();
      const durationMinutes = Math.floor(
        (endTime.getTime() - new Date(session.startTime).getTime()) / 60000
      );

      const updatedSession = await storage.updateFocusSession(id, {
        endTime,
        durationMinutes,
      });

      res.json(updatedSession);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= Habits API =============
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      res.json(habits);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const validatedData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(validatedData);
      res.status(201).json(habit);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/habits/:id/check-in", async (req, res) => {
    try {
      const habit = await storage.getHabit(req.params.id);
      if (!habit) {
        return res.status(404).json({ error: "Habit not found" });
      }

      const now = new Date();
      const lastCompleted = habit.lastCompletedAt ? new Date(habit.lastCompletedAt) : null;

      let newStreak = habit.currentStreak;

      // Check if already completed today
      if (lastCompleted) {
        const isSameDay =
          lastCompleted.getDate() === now.getDate() &&
          lastCompleted.getMonth() === now.getMonth() &&
          lastCompleted.getFullYear() === now.getFullYear();

        if (isSameDay) {
          return res.status(400).json({ error: "Already checked in today" });
        }

        // Check if consecutive day
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive =
          lastCompleted.getDate() === yesterday.getDate() &&
          lastCompleted.getMonth() === yesterday.getMonth() &&
          lastCompleted.getFullYear() === yesterday.getFullYear();

        newStreak = isConsecutive ? habit.currentStreak + 1 : 1;
      } else {
        newStreak = 1;
      }

      const newBestStreak = Math.max(habit.bestStreak, newStreak);

      const updatedHabit = await storage.updateHabit(req.params.id, {
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        lastCompletedAt: now,
      });

      res.json(updatedHabit);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const success = await storage.deleteHabit(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Habit not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= Notes API =============
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const validatedData = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(req.params.id, validatedData);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const success = await storage.deleteNote(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= AI APIs =============
  app.post("/api/ai/coach-advice", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      const advice = await getCoachAdvice(question);
      res.json({ advice });
    } catch (error: any) {
      console.error("AI coach error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/summarize-note", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const summary = await summarizeNote(content);
      res.json({ summary });
    } catch (error: any) {
      console.error("AI summarization error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

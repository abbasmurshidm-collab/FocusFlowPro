import {
  type Task, type InsertTask,
  type FocusSession, type InsertFocusSession,
  type Habit, type InsertHabit,
  type Note, type InsertNote,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Focus Sessions
  getFocusSessions(): Promise<FocusSession[]>;
  getFocusSession(id: string): Promise<FocusSession | undefined>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: string, session: Partial<FocusSession>): Promise<FocusSession | undefined>;

  // Habits
  getHabits(): Promise<Habit[]>;
  getHabit(id: string): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, habit: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: string): Promise<boolean>;

  // Notes
  getNotes(): Promise<Note[]>;
  getNote(id: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, note: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task>;
  private focusSessions: Map<string, FocusSession>;
  private habits: Map<string, Habit>;
  private notes: Map<string, Note>;

  constructor() {
    this.tasks = new Map();
    this.focusSessions = new Map();
    this.habits = new Map();
    this.notes = new Map();
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
      completedAt: null,
      dueDate: insertTask.dueDate || null,
      description: insertTask.description || null,
      category: insertTask.category || null,
      estimatedMinutes: insertTask.estimatedMinutes || null,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    const updated = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Focus Sessions
  async getFocusSessions(): Promise<FocusSession[]> {
    return Array.from(this.focusSessions.values());
  }

  async getFocusSession(id: string): Promise<FocusSession | undefined> {
    return this.focusSessions.get(id);
  }

  async createFocusSession(insertSession: InsertFocusSession): Promise<FocusSession> {
    const id = randomUUID();
    const session: FocusSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      endTime: insertSession.endTime || null,
      durationMinutes: insertSession.durationMinutes || null,
      taskId: insertSession.taskId || null,
    };
    this.focusSessions.set(id, session);
    return session;
  }

  async updateFocusSession(id: string, updates: Partial<FocusSession>): Promise<FocusSession | undefined> {
    const session = this.focusSessions.get(id);
    if (!session) return undefined;
    const updated = { ...session, ...updates };
    this.focusSessions.set(id, updated);
    return updated;
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const habit: Habit = {
      ...insertHabit,
      id,
      description: insertHabit.description || null,
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedAt: null,
      createdAt: new Date(),
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    const updated = { ...habit, ...updates };
    this.habits.set(id, updated);
    return updated;
  }

  async deleteHabit(id: string): Promise<boolean> {
    return this.habits.delete(id);
  }

  // Notes
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }

  async getNote(id: string): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = randomUUID();
    const note: Note = {
      ...insertNote,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    const updated = { ...note, ...updates, updatedAt: new Date() };
    this.notes.set(id, updated);
    return updated;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }
}

export const storage = new MemStorage();

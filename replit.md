# FocusFlow Pro - AI-Powered Productivity App

An intelligent productivity application built with React, TypeScript, Express, and Google Gemini AI.

## Features Implemented

### ✅ Dashboard
- Real-time productivity stats (tasks completed, focus time, habit streaks, active tasks)
- AI Productivity Coach - ask questions and get personalized advice
- Beautiful card-based design with Inter font and blue/emerald color scheme

### ✅ Task Manager
- Create, edit, and delete tasks with priorities (low, medium, high)
- Filter tasks by status (All, Active, Completed)
- AI Task Generator - describe a goal and AI breaks it into actionable tasks
- Category and time estimation support
- Complete tasks with visual feedback

### ✅ Pomodoro Focus Timer
- 25-minute focus sessions and 5-minute breaks
- Session tracking and history
- Real-time countdown display
- Statistics showing total sessions and focus time

### ✅ Habit Tracker
- Create daily or weekly habits
- Check-in system with streak tracking
- Current and best streak display with flame icons
- Beautiful card layout for each habit

### ✅ Notes
- Create and edit notes with rich text
- AI-powered note summarization
- Clean interface for capturing ideas

### ✅ Analytics Dashboard
- Task completion rate
- Total focus time and session statistics
- Habit streak metrics
- Task breakdown by priority and category

## Technical Stack

**Frontend:**
- React 18 with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI components
- Tailwind CSS for styling
- Inter & JetBrains Mono fonts

**Backend:**
- Express.js REST API
- In-memory storage (MemStorage)
- Zod schema validation
- Google Gemini AI integration (@google/genai)

**AI Features:**
- Uses Gemini 2.5-flash model (free tier)
- Task generation from goals
- Productivity coaching advice
- Note summarization

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── app-sidebar.tsx      # Navigation sidebar
│   │   │   └── ui/                   # Shadcn components
│   │   ├── pages/
│   │   │   ├── dashboard.tsx
│   │   │   ├── tasks.tsx
│   │   │   ├── timer.tsx
│   │   │   ├── habits.tsx
│   │   │   ├── notes.tsx
│   │   │   └── analytics.tsx
│   │   └── App.tsx                   # Main app with routing
├── server/
│   ├── ai/
│   │   └── gemini.ts                 # AI integration
│   ├── routes.ts                     # API endpoints
│   └── storage.ts                    # Data layer
└── shared/
    └── schema.ts                     # Data models & validation
```

## API Endpoints

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Focus Sessions
- `GET /api/focus-sessions` - List sessions
- `POST /api/focus-sessions/start` - Start session
- `POST /api/focus-sessions/end` - End session

### Habits
- `GET /api/habits` - List habits
- `POST /api/habits` - Create habit
- `POST /api/habits/:id/check-in` - Check in (updates streak)
- `DELETE /api/habits/:id` - Delete habit

### Notes
- `GET /api/notes` - List notes
- `POST /api/notes` - Create note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### AI
- `POST /api/ai/generate-tasks` - Generate tasks from goal
- `POST /api/ai/coach-advice` - Get productivity advice
- `POST /api/ai/summarize-note` - Summarize note content

## Environment Variables

- `GEMINI_API_KEY` - Google Gemini API key (required for AI features)
- `SESSION_SECRET` - Session secret (auto-configured)

## Running the App

The app starts automatically with:
```bash
npm run dev
```

Access at: `http://localhost:5000`

## Testing

All core features have been tested end-to-end:
- ✅ Dashboard loads and displays stats
- ✅ Task creation, completion, and filtering
- ✅ Timer starts, counts down, and resets
- ✅ Habit check-ins update streaks correctly
- ✅ Notes creation and display
- ✅ Analytics show correct metrics

## Design System

- **Primary Color**: Blue (#3B82F6) - for primary actions and branding
- **Secondary Color**: Emerald (#10B981) - for success states
- **Accent Color**: Amber (#F59E0B) - for warnings and highlights
- **Error Color**: Red (#EF4444) - for errors
- **Typography**: Inter for UI, JetBrains Mono for timer/code
- **Layout**: Sidebar navigation (desktop), responsive design

## Recent Updates

- ✅ Complete data schema for all entities (tasks, sessions, habits, notes)
- ✅ Full CRUD operations for all features
- ✅ Zod validation on all API endpoints
- ✅ AI integration with error handling
- ✅ Comprehensive UI with loading and error states
- ✅ End-to-end testing completed successfully

## Future Enhancements

- Dark mode implementation
- Drag-and-drop weekly planner
- Distraction blocker feature
- Export functionality for data
- Advanced analytics charts with Recharts
- Form refactoring to use react-hook-form + zodResolver pattern

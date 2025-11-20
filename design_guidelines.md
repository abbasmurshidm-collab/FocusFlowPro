# FocusFlow Pro - Design Guidelines

## Design Approach
**Utility-Focused Productivity App** - Clean, functional interface prioritizing efficiency and clarity over decorative elements. Card-based design system inspired by modern productivity tools like Notion and Linear.

## Color System
```
Primary: #3B82F6 (Blue) - Primary actions, links, active states
Secondary: #10B981 (Emerald) - Success states, positive feedback
Background: #F8FAFC - App background
Surface: #FFFFFF - Card backgrounds
Text: #1E293B - Primary text
Accent: #F59E0B (Amber) - Highlights, warnings
Error: #EF4444 - Error states
```

## Typography
- **Headings**: Inter Bold (Google Fonts) - h1: text-3xl, h2: text-2xl, h3: text-xl
- **Body**: Inter Regular - Base: text-base, Small: text-sm
- **Code/Numbers**: JetBrains Mono - For timer displays, statistics

## Layout Architecture

**Desktop (lg+)**:
- Persistent left sidebar navigation (w-64, bg-white, border-r)
- Main content area with max-w-7xl container
- Padding: px-6 py-6

**Mobile (base)**:
- Fixed bottom navigation bar (h-16)
- Full-width content with px-4 py-4
- Hide sidebar, show hamburger menu if needed

**Spacing System**: Use Tailwind units of 2, 4, 6, 8 for consistent rhythm
- Card padding: p-6
- Section gaps: space-y-6
- Grid gaps: gap-4 or gap-6

## Component Library

**Cards**: 
- White background (bg-white)
- Subtle shadow (shadow-sm)
- Rounded corners (rounded-lg)
- Border (border border-gray-200)

**Buttons**:
- Primary: bg-blue-600 text-white rounded-md px-4 py-2
- Secondary: bg-gray-100 text-gray-700 rounded-md px-4 py-2
- Hover states with subtle brightness changes

**Forms**:
- Input fields: border border-gray-300 rounded-md px-3 py-2
- Focus ring: ring-2 ring-blue-500
- Labels: text-sm font-medium text-gray-700

**Stats Cards**:
- Grid layout (grid-cols-2 md:grid-cols-4)
- Large numbers in accent colors
- Small descriptive labels
- Icons using Heroicons

**Navigation**:
- Sidebar items with icon + label
- Active state: bg-blue-50 text-blue-600 border-l-4 border-blue-600
- Icons: w-5 h-5

## Key Screen Layouts

**Dashboard**:
- Stats grid (4 cards showing tasks, focus time, streak)
- Quick actions section
- Recent activity feed
- AI coach widget (card with conversational UI)

**Task Manager**:
- Filter tabs at top (All, Today, Upcoming)
- Task list with checkbox, title, priority indicator, category tag
- Floating action button for adding tasks (bottom-right on mobile)
- AI task generator in collapsible card

**Focus Timer**:
- Large centered timer display (text-6xl with JetBrains Mono)
- Control buttons below timer
- Progress ring visualization using CSS/SVG
- Session history in card below

**Habits**:
- Grid of habit cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Checkmark interaction for daily completion
- Streak counter with flame icon
- Progress indicators

## Animations
**Minimal and purposeful only**:
- Button hover: subtle scale/brightness
- Card hover: slight shadow increase
- Timer countdown: smooth number transitions
- NO elaborate scroll animations or page transitions

## Icons
Use Heroicons (outline style) via CDN for all UI icons. Common icons:
- Tasks: CheckCircle, Clock, Tag
- Focus: Play, Pause, Stop
- Stats: ChartBar, Fire, Trophy
- Navigation: Home, Calendar, Clipboard, Chart

## Mobile Considerations
- Bottom nav with 5 primary routes (Home, Tasks, Timer, Habits, More)
- Touch targets minimum 44px height
- Simplified layouts, stack cards vertically
- FAB for primary actions (Add Task, Start Timer)

## Accessibility
- Proper color contrast ratios (WCAG AA)
- Focus indicators on all interactive elements
- Semantic HTML (nav, main, section, article)
- ARIA labels for icon-only buttons
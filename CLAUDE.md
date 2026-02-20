# Task Planner — Kanban Board Web App

## Project Overview
A Kanban-style task planner web app where users can organize tasks across columns (e.g., To Do, In Progress, Done) with drag-and-drop functionality.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** SQLite via Prisma ORM
- **Styling:** Tailwind CSS
- **Drag & Drop:** @hello-pangea/dnd (maintained fork of react-beautiful-dnd)
- **Auth:** Clerk (@clerk/nextjs)
- **Package Manager:** npm

## Project Structure (Feature-Based)
```
src/
  app/
    (auth)/                        # Clerk auth pages (grouped route)
      sign-in/[[...sign-in]]/page.tsx
      sign-up/[[...sign-up]]/page.tsx
      layout.tsx                   # Centered auth layout (no sidebar)
    (dashboard)/                   # Protected app routes (grouped route)
      layout.tsx                   # Dashboard layout — Sidebar + Main
      page.tsx                     # Home → Board feature
      calendar/page.tsx            # Calendar page
      settings/page.tsx            # Settings page
    api/                           # API route handlers
      boards/route.ts
      columns/route.ts
      columns/[id]/route.ts
      tasks/route.ts
      tasks/[id]/route.ts
    layout.tsx                     # Root layout (ClerkProvider wraps here)
  features/                        # Feature modules (core business logic)
    board/
      components/
        Board.tsx                  # Main Kanban board (client)
        Column.tsx                 # Single column with droppable zone (client)
        TaskCard.tsx               # Draggable task card (client)
        TaskModal.tsx              # Create/edit task modal (client)
        AddColumnButton.tsx        # Add new column button (client)
      hooks/
        useBoard.ts                # Board state, drag-and-drop logic
        useTasks.ts                # Task CRUD operations
        useColumns.ts              # Column CRUD operations
      types.ts                     # Board, Column, Task interfaces
      api.ts                       # Fetch wrappers for board API routes
    calendar/
      components/
        CalendarView.tsx           # Calendar grid (client)
        DayCell.tsx                # Single day cell (client)
      hooks/
        useCalendar.ts             # Calendar navigation, task grouping
      types.ts
      api.ts
    settings/
      components/
        SettingsForm.tsx           # Settings form (client)
        ProfileSection.tsx         # User profile section (client)
      hooks/
        useSettings.ts
      types.ts
  components/                      # Shared components (cross-feature)
    layout/
      Sidebar.tsx                  # Sidebar with collapse (client)
      TopBar.tsx                   # Top bar with title (client)
      BottomNav.tsx                # Mobile bottom nav (client)
      NavItem.tsx                  # Nav link item (client)
      Logo.tsx                     # App logo (server)
    ui/
      Button.tsx                   # Reusable button variants
      Modal.tsx                    # Reusable modal shell
      Input.tsx                    # Styled input field
      Select.tsx                   # Styled select dropdown
      Badge.tsx                    # Priority/status badge
      Skeleton.tsx                 # Skeleton loader component
      Spinner.tsx                  # Loading spinner
      Toast.tsx                    # Toast notification
  hooks/                           # Shared hooks (cross-feature)
    useLocalStorage.ts             # Persist state in localStorage
    useMediaQuery.ts               # Responsive breakpoint detection
    useToast.ts                    # Toast notification state
  lib/
    db.ts                          # Prisma client singleton
    utils.ts                       # Shared utility functions
  types/
    global.ts                      # Shared types (ApiResponse, Priority, etc.)
  middleware.ts                    # Clerk auth middleware
prisma/
  schema.prisma                    # Database schema
  dev.db                           # SQLite database file (gitignored)
.env.local                         # Clerk keys (gitignored)
```

---
---
# ======================== BACKEND ========================
---
---

## Database Design

### ORM: Prisma with SQLite

- Schema file: `prisma/schema.prisma`
- Database file: `prisma/dev.db` (gitignored)
- Client singleton: `src/lib/db.ts`

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Board {
  id        String   @id @default(cuid())
  userId    String
  title     String   @default("My Board")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  columns   Column[]

  @@index([userId])
}

model Column {
  id        String   @id @default(cuid())
  boardId   String
  title     String
  position  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  tasks     Task[]

  @@index([boardId])
}

model Task {
  id          String    @id @default(cuid())
  columnId    String
  title       String
  description String?
  priority    String    @default("medium")
  dueDate     DateTime?
  position    Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  column      Column    @relation(fields: [columnId], references: [id], onDelete: Cascade)

  @@index([columnId])
}
```

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Board     │       │    Column    │       │     Task     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id       PK  │──┐    │ id       PK  │──┐    │ id       PK  │
│ userId       │  │    │ boardId  FK  │  │    │ columnId FK  │
│ title        │  └───►│ title        │  └───►│ title        │
│ createdAt    │  1:N  │ position     │  1:N  │ description? │
│ updatedAt    │       │ createdAt    │       │ priority     │
└──────────────┘       │ updatedAt    │       │ dueDate?     │
                       └──────────────┘       │ position     │
                                              │ createdAt    │
                                              │ updatedAt    │
                                              └──────────────┘

User (Clerk) ──1:N──► Board ──1:N──► Column ──1:N──► Task
```

### Database Rules

1. **User isolation** — Every query MUST include `userId` in the WHERE clause. Users never see other users' data
2. **Cascade deletes** — Deleting a Board deletes all its Columns. Deleting a Column deletes all its Tasks
3. **Position ordering** — Columns and Tasks use an `Int` position field for ordering. Positions are 0-indexed
4. **IDs** — Use `cuid()` for all primary keys (collision-safe, URL-friendly)
5. **Timestamps** — All models have `createdAt` and `updatedAt` fields
6. **Indexes** — Always index foreign keys (`userId`, `boardId`, `columnId`) for query performance
7. **Nullable fields** — Only `description` and `dueDate` are nullable. Everything else is required
8. **Priority values** — Stored as string: `"urgent"`, `"high"`, `"medium"`, `"low"`

### Prisma Client Singleton

```ts
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export { db }
```

**Rules:**
- ALWAYS import from `@/lib/db` — never create a new `PrismaClient()` anywhere else
- Use the singleton pattern above to prevent connection exhaustion in development (hot reload)

### Default Board Seeding

When a new user signs in for the first time, auto-create a default board:

```ts
// Pattern: check if board exists, create if not
const getOrCreateBoard = async (userId: string) => {
  let board = await db.board.findFirst({
    where: { userId },
    include: { columns: { include: { tasks: true }, orderBy: { position: 'asc' } } },
  })

  if (!board) {
    board = await db.board.create({
      data: {
        userId,
        title: 'My Board',
        columns: {
          create: [
            { title: 'To Do', position: 0 },
            { title: 'In Progress', position: 1 },
            { title: 'Done', position: 2 },
          ],
        },
      },
      include: { columns: { include: { tasks: true }, orderBy: { position: 'asc' } } },
    })
  }

  return board
}
```

---

## API Routes

### Route Map

| Method   | Route                  | Action                          |
|----------|------------------------|---------------------------------|
| GET      | `/api/boards`          | Get user's board (with columns + tasks) |
| POST     | `/api/boards`          | Create a new board              |
| GET      | `/api/columns`         | Get columns for a board         |
| POST     | `/api/columns`         | Create a new column             |
| PATCH    | `/api/columns/[id]`    | Update column (title, position) |
| DELETE   | `/api/columns/[id]`    | Delete a column                 |
| POST     | `/api/tasks`           | Create a new task               |
| PATCH    | `/api/tasks/[id]`      | Update task (title, desc, priority, position, columnId) |
| DELETE   | `/api/tasks/[id]`      | Delete a task                   |

### API Route Template

Every API route MUST follow this exact pattern:

```ts
// src/app/api/<resource>/route.ts
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET — List / Read
export const GET = async () => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await db.<model>.findMany({ where: { /* userId filter */ } })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// POST — Create
export const POST = async (req: Request) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    // Validate body here
    const data = await db.<model>.create({ data: { ...body } })
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
```

```ts
// src/app/api/<resource>/[id]/route.ts
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// PATCH — Update
export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    // Verify ownership before updating
    const data = await db.<model>.update({ where: { id }, data: { ...body } })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE — Remove
export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    // Verify ownership before deleting
    await db.<model>.delete({ where: { id } })
    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
```

### API Rules

1. **Auth first** — Every route starts with `auth()` + `userId` check. No exceptions
2. **Ownership verification** — Before UPDATE or DELETE, verify the resource belongs to the user (check via board → userId)
3. **Response format** — Always return `{ data: T }` on success, `{ error: string }` on failure
4. **Status codes:**
   - `200` — Success (GET, PATCH, DELETE)
   - `201` — Created (POST)
   - `400` — Bad request (validation failed)
   - `401` — Unauthorized (no userId)
   - `403` — Forbidden (resource belongs to another user)
   - `404` — Not found
   - `500` — Server error
5. **Validation** — Validate required fields before DB operations. Return 400 with clear error messages
6. **No business logic in routes** — Keep routes thin. Complex logic goes into `src/lib/` utility functions
7. **Params in Next.js 15** — `params` is a Promise, always `await params` before using

### Ownership Verification Pattern

For nested resources (columns, tasks), verify ownership by tracing back to the board:

```ts
// Verify a column belongs to the user
const verifyColumnOwnership = async (columnId: string, userId: string) => {
  const column = await db.column.findUnique({
    where: { id: columnId },
    include: { board: { select: { userId: true } } },
  })
  if (!column || column.board.userId !== userId) return null
  return column
}

// Verify a task belongs to the user
const verifyTaskOwnership = async (taskId: string, userId: string) => {
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { column: { include: { board: { select: { userId: true } } } } },
  })
  if (!task || task.column.board.userId !== userId) return null
  return task
}
```

### Position Reordering Logic

When tasks or columns are reordered (drag-and-drop), update positions in bulk:

```ts
// Reorder items — accepts array of { id, position }
const reorderItems = async (
  model: 'column' | 'task',
  items: { id: string; position: number }[]
) => {
  await db.$transaction(
    items.map(item =>
      model === 'column'
        ? db.column.update({ where: { id: item.id }, data: { position: item.position } })
        : db.task.update({ where: { id: item.id }, data: { position: item.position } })
    )
  )
}
```

**Rules:**
- Use `$transaction` for bulk position updates — ensures all-or-nothing
- Positions are 0-indexed integers
- When moving a task between columns, update both `columnId` and `position`

### Database Commands

```bash
npx prisma db push        # Push schema changes to SQLite (dev)
npx prisma generate        # Regenerate Prisma client after schema changes
npx prisma studio          # Open database GUI in browser
npx prisma db seed         # Run seed script (if configured)
```

---
---
# ======================== FRONTEND ========================
---
---

## Authentication — Clerk

### Setup
- Package: `@clerk/nextjs`
- Environment variables in `.env.local`:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
  CLERK_SECRET_KEY=sk_test_...
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
  ```

### Architecture
- **Root layout** (`src/app/layout.tsx`): Wrap entire app with `<ClerkProvider>`
- **Middleware** (`src/middleware.ts`): Use `clerkMiddleware()` to protect routes
  ```ts
  import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

  const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

  export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
  })

  export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
  }
  ```
- **Auth pages**: Use Clerk's prebuilt `<SignIn />` and `<SignUp />` components inside route groups
- **Dashboard routes**: All under `(dashboard)/` — automatically protected by middleware

### Usage Patterns
- **Get user in Server Components:**
  ```ts
  import { auth } from '@clerk/nextjs/server'
  const { userId } = await auth()
  ```
- **Get user in API Routes:**
  ```ts
  import { auth } from '@clerk/nextjs/server'
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  ```
- **Get user in Client Components:**
  ```ts
  import { useUser } from '@clerk/nextjs'
  const { user, isLoaded } = useUser()
  ```
- **User button (avatar + menu):**
  ```tsx
  import { UserButton } from '@clerk/nextjs'
  <UserButton afterSignOutUrl="/sign-in" />
  ```

### Rules
- Every API route MUST call `auth()` and check `userId` before processing
- All database queries MUST filter by `userId` — users only see their own data
- Never expose Clerk secret key to the client
- Style Clerk components with `appearance` prop to match the dark glassmorphism theme:
  ```tsx
  <ClerkProvider
    appearance={{
      variables: {
        colorPrimary: '#10B981',
        colorBackground: '#1A1A2E',
        colorText: '#F1F5F9',
        colorInputBackground: 'rgba(255, 255, 255, 0.05)',
        colorInputText: '#F1F5F9',
        borderRadius: '0.75rem',
      },
    }}
  >
  ```

## Global Frontend Structure

All screens MUST follow this structure. This is the global rule for every page.

### App Shell Layout: Sidebar + Main Content

```
┌──────────────────────────────────────────────────┐
│ ┌────────┐ ┌──────────────────────────────────┐  │
│ │        │ │  TOP BAR (page title + actions)  │  │
│ │  SIDE  │ ├──────────────────────────────────┤  │
│ │  BAR   │ │                                  │  │
│ │        │ │        PAGE CONTENT              │  │
│ │  Logo  │ │                                  │  │
│ │  Nav   │ │   (each page renders here)       │  │
│ │  Items │ │                                  │  │
│ │        │ │                                  │  │
│ │ Collapse│ │                                  │  │
│ │  User  │ │                                  │  │
│ └────────┘ └──────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Component Hierarchy
```
RootLayout                         # src/app/layout.tsx — ClerkProvider, fonts, globals.css
  └── (auth)/layout.tsx            # Centered layout for sign-in/sign-up (no sidebar)
  └── (dashboard)/layout.tsx       # App shell — Sidebar + Main wrapper
        ├── Sidebar                # src/components/layout/Sidebar.tsx
        │     ├── Logo
        │     ├── NavItems
        │     ├── CollapseToggle
        │     └── UserButton
        ├── TopBar                 # src/components/layout/TopBar.tsx
        │     ├── PageTitle
        │     ├── SearchBar (optional)
        │     └── ActionButtons
        └── <children>             # Page content injected here
```

### Sidebar Behavior

#### Expanded State (default, width: `w-64`)
```
┌──────────────┐
│  🟢 TaskFlow │  ← Logo + App name
│              │
│  📋 Board    │  ← Icon + Label
│  📊 Calendar │
│  ⚙ Settings  │
│              │
│              │
│  « Collapse  │  ← Toggle button
│  👤 User     │  ← Clerk UserButton
└──────────────┘
```

#### Collapsed State (width: `w-[72px]`)
```
┌──────┐
│  🟢  │  ← Logo icon only
│      │
│  📋  │  ← Icon only (tooltip on hover)
│  📊  │
│  ⚙  │
│      │
│  »   │  ← Toggle button
│  👤  │
└──────┘
```

#### Sidebar Rules
- Use `transition-all duration-300` for smooth collapse animation
- Store collapse state in `localStorage` to persist across sessions
- Glass style: `bg-[#1A1A2E]/80 backdrop-blur-xl border-r border-white/10`
- Active nav item: `bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-500`
- Inactive nav item: `text-slate-400 hover:text-slate-200 hover:bg-white/5`
- Nav items use `lucide-react` icons, `size={20}`
- Tooltip on collapsed icons: show label on hover using `title` or custom tooltip

### Top Bar Rules
- Sticky: `sticky top-0 z-40`
- Glass style: `bg-[#0F0F0F]/80 backdrop-blur-xl border-b border-white/10`
- Height: `h-16`
- Content: `flex items-center justify-between px-6`
- Left: Page title (`text-lg font-semibold text-slate-100`)
- Right: Action buttons + optional search

### Page Content Area Rules
- Wrapper: `flex-1 overflow-y-auto p-6`
- Background: inherits from `bg-[#0F0F0F]`
- Max content width: none (full width) — Kanban boards need horizontal space
- Content scrolls independently from sidebar and top bar

### Responsive Design — Mobile (< 768px)

#### Mobile Layout
```
┌────────────────────────┐
│  TOP BAR  ☰  (burger)  │
├────────────────────────┤
│                        │
│     PAGE CONTENT       │
│     (scrollable)       │
│                        │
├────────────────────────┤
│  📋   📊   ⚙   👤    │  ← Bottom nav
└────────────────────────┘
```

#### Mobile Rules
- Sidebar hidden on mobile — replaced by bottom navigation bar
- Bottom nav: `fixed bottom-0 left-0 right-0 z-50`
- Bottom nav style: `bg-[#1A1A2E]/90 backdrop-blur-xl border-t border-white/10 h-16`
- Bottom nav items: `flex justify-around items-center` with icon + small label
- Active item in bottom nav: `text-emerald-400`, inactive: `text-slate-500`
- Top bar shows hamburger menu `☰` on left for additional options
- Page padding on mobile: `p-4` (reduced from `p-6`)
- Kanban columns stack vertically or scroll horizontally on mobile

#### Breakpoints (Tailwind defaults)
```
sm:   640px   — small phones landscape
md:   768px   — tablets / sidebar toggle point
lg:   1024px  — laptops
xl:   1280px  — desktops
```

- `md:` breakpoint = sidebar becomes visible
- Below `md:` = bottom nav replaces sidebar

### Screen Templates

Every new page MUST follow this pattern:

```tsx
// src/app/(dashboard)/page-name/page.tsx

const PageName = () => {
  return (
    <>
      {/* TopBar content is handled by layout, but page can pass title */}
      <div className="flex flex-col gap-6">
        {/* Page Header — title + description + action buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Page Title</h1>
            <p className="text-sm text-slate-400 mt-1">Page description</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Action buttons */}
          </div>
        </div>

        {/* Page Content */}
        <div>
          {/* Content here */}
        </div>
      </div>
    </>
  )
}

export { PageName as default }
```

### File Organization for Layout Components
```
src/components/
  layout/
    Sidebar.tsx          # Sidebar with collapse logic
    TopBar.tsx           # Top bar with page title
    BottomNav.tsx        # Mobile bottom navigation
    NavItem.tsx          # Single nav link (used in Sidebar + BottomNav)
    Logo.tsx             # App logo component
```

### Navigation Items (default)
| Label      | Icon (lucide)    | Path        |
|------------|------------------|-------------|
| Board      | `LayoutDashboard`| `/`         |
| Calendar   | `Calendar`       | `/calendar` |
| Settings   | `Settings`       | `/settings` |

### Global State for Layout
- `sidebarCollapsed`: `boolean` — stored in `localStorage`, toggled by collapse button
- Use a React context (`LayoutContext`) or simple `useState` in dashboard layout
- No external state library needed

---

## Global Design System

All UI must follow this design system. Never deviate from these styles.

### Theme: Dark Glassmorphism

#### Color Palette
```
--bg-primary:       #0F0F0F       (page background)
--bg-secondary:     #1A1A2E       (section/sidebar background)
--bg-glass:         rgba(255, 255, 255, 0.05)  (glass card fill)
--bg-glass-hover:   rgba(255, 255, 255, 0.08)  (glass card hover)
--border-glass:     rgba(255, 255, 255, 0.10)  (glass border)
--border-glass-hover: rgba(255, 255, 255, 0.18)

--accent:           #10B981       (primary green — buttons, links, active states)
--accent-hover:     #059669       (green hover)
--accent-light:     rgba(16, 185, 129, 0.15)  (green tint for badges/highlights)
--accent-glow:      rgba(16, 185, 129, 0.25)  (glow effect)

--text-primary:     #F1F5F9       (headings, primary text)
--text-secondary:   #94A3B8       (descriptions, labels)
--text-muted:       #64748B       (placeholders, disabled)

--danger:           #EF4444       (delete, errors)
--warning:          #F59E0B       (warnings, high priority)
--info:             #3B82F6       (info badges)
--success:          #10B981       (same as accent — completed states)
```

#### Tailwind Config Mapping
Use these Tailwind classes consistently:
```
Page background:     bg-[#0F0F0F]
Section background:  bg-[#1A1A2E]
Glass card:          bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
Glass card hover:    hover:bg-white/[0.08] hover:border-white/[0.18]
Accent button:       bg-emerald-500 hover:bg-emerald-600 text-white
Ghost button:        bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10
Text heading:        text-slate-100
Text body:           text-slate-400
Text muted:          text-slate-500
```

#### Typography
- **Font Family:** `Poppins` (import from Google Fonts)
  - Load weights: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Sizes:**
  - Page title: `text-2xl font-bold`
  - Section title: `text-lg font-semibold`
  - Card title: `text-sm font-medium`
  - Body text: `text-sm font-normal`
  - Caption/label: `text-xs font-medium`
  - Small/meta: `text-xs font-normal`

#### Glassmorphism Rules
Every card or container element must use:
```
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
shadow-lg shadow-black/20
```
On hover (if interactive):
```
hover:bg-white/[0.08]
hover:border-white/[0.18]
hover:shadow-xl hover:shadow-black/30
transition-all duration-200
```

#### Spacing System
- Page padding: `p-6`
- Between sections: `gap-6`
- Card internal padding: `p-4`
- Between cards: `gap-3`
- Between inline elements: `gap-2`
- Icon + text spacing: `gap-1.5`

#### Border Radius
- Cards/containers: `rounded-2xl`
- Buttons: `rounded-xl`
- Inputs: `rounded-xl`
- Badges/chips: `rounded-full`
- Small elements: `rounded-lg`

#### Shadows
- Cards: `shadow-lg shadow-black/20`
- Elevated cards (modal, dropdown): `shadow-2xl shadow-black/40`
- Glow on accent elements: `shadow-emerald-500/20`

#### Buttons
```
Primary:   bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20
Secondary: bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-4 py-2 rounded-xl transition-all duration-200
Danger:    bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl transition-all duration-200
Icon btn:  p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all duration-200
```

#### Inputs
```
bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100
placeholder:text-slate-500
focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none
transition-all duration-200
```

#### Modals
```
Overlay:   fixed inset-0 bg-black/60 backdrop-blur-sm z-50
Container: bg-[#1A1A2E] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-6 max-w-md w-full
```

#### Priority Colors (for task badges)
```
Urgent:  bg-red-500/15 text-red-400 border border-red-500/20
High:    bg-orange-500/15 text-orange-400 border border-orange-500/20
Medium:  bg-blue-500/15 text-blue-400 border border-blue-500/20
Low:     bg-slate-500/15 text-slate-400 border border-slate-500/20
```

#### Animations & Transitions
- All interactive elements: `transition-all duration-200`
- Modals: fade in with `animate-in fade-in` or custom keyframe
- Cards on drag: slight scale up `scale-105` with enhanced shadow
- Loading states: use skeleton shimmer with `animate-pulse` and `bg-white/5`

#### Scrollbar
Style custom scrollbar for dark theme:
```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
```

#### Icons
- Use `lucide-react` for all icons
- Icon size in buttons/nav: `size={18}`
- Icon size in cards: `size={16}`
- Icon size inline with text: `size={14}`
- Always pair icon color with nearby text color

---

## SSR vs CSR Rules

Next.js App Router defaults to **Server Components (SSR)**. Only use Client Components when necessary.

### Decision Rule: Server or Client?

```
Does the component need:
  → useState, useEffect, useRef, useReducer?       → CLIENT
  → onClick, onChange, onSubmit, any event handler?  → CLIENT
  → Browser APIs (localStorage, window, navigator)?  → CLIENT
  → Drag-and-drop (@hello-pangea/dnd)?               → CLIENT
  → Clerk hooks (useUser, useAuth)?                   → CLIENT
  → Third-party hooks or context consumers?           → CLIENT

  → Database queries (Prisma)?                        → SERVER
  → auth() from @clerk/nextjs/server?                 → SERVER
  → fetch() to external APIs?                         → SERVER
  → Static content, no interactivity?                 → SERVER
  → Reading env vars (CLERK_SECRET_KEY)?              → SERVER
```

### Server Components (default — NO directive needed)

**Use for:** Pages, layouts, data-fetching wrappers, static UI sections

```tsx
// src/app/(dashboard)/page.tsx — Server Component (default)
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { Board } from '@/components/board/Board'

const DashboardPage = async () => {
  const { userId } = await auth()
  const boards = await db.board.findMany({ where: { userId: userId! } })

  return <Board initialData={boards} />  // Pass data DOWN to client
}

export { DashboardPage as default }
```

**Server Component rules:**
- NEVER add `"use client"` — server is the default
- CAN directly `await` Prisma queries and `auth()`
- CAN access server-only env vars
- CANNOT use hooks, event handlers, or browser APIs
- Use for: pages, layouts, data-fetching wrappers

### Client Components (`"use client"` directive required)

**Use for:** Interactive UI, forms, drag-and-drop, stateful components

```tsx
// src/components/board/Board.tsx — Client Component
"use client"

import { useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'

interface BoardProps {
  initialData: BoardWithColumns[]
}

const Board = ({ initialData }: BoardProps) => {
  const [columns, setColumns] = useState(initialData)
  // ... drag-and-drop logic, event handlers
}

export { Board }
```

**Client Component rules:**
- MUST have `"use client"` as the very first line
- CAN use hooks, event handlers, browser APIs
- CANNOT directly call Prisma or access server-only code
- Fetch data via API routes (`fetch('/api/...')`) or receive data as props from server parents

### The SSR → CSR Boundary Pattern

This is the **primary pattern** for the entire app. Always follow it:

```
Server Component (page)          Client Component (interactive UI)
┌─────────────────────┐          ┌─────────────────────────┐
│                     │          │                         │
│  1. auth()          │  props   │  3. useState(data)      │
│  2. db.query()      │ ───────► │  4. event handlers      │
│                     │          │  5. drag-and-drop       │
│  (fetch data here)  │          │  (interactivity here)   │
│                     │          │                         │
└─────────────────────┘          └─────────────────────────┘
```

**Rules:**
1. **Pages are always Server Components** — they fetch data and pass it down
2. **Interactive components are Client Components** — they receive data as `initialData` props
3. **Push `"use client"` as far down as possible** — keep the boundary small
4. **Never make a layout a Client Component** — layouts should stay on the server

### Component Classification for This App

| Component              | Type     | Why                                      |
|------------------------|----------|------------------------------------------|
| `page.tsx` (all pages) | Server   | Fetches data with auth                   |
| `layout.tsx` (all)     | Server   | Wraps children, no interactivity         |
| `Sidebar`              | Client   | Collapse toggle, localStorage, nav state |
| `TopBar`               | Client   | Hamburger toggle, search input           |
| `BottomNav`            | Client   | Active state, navigation                 |
| `Board`                | Client   | Drag-and-drop, state management          |
| `Column`               | Client   | Droppable zone, add task handler         |
| `TaskCard`             | Client   | Draggable, click to edit                 |
| `TaskModal`            | Client   | Form inputs, submit handler              |
| `Logo`                 | Server   | Static, no interactivity                 |
| `PriorityBadge`        | Server   | Static display, no state                 |

### Data Mutation Pattern

Client components mutate data through API routes, then revalidate:

```tsx
// In a Client Component — create a task
const createTask = async (data: NewTask) => {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const { data: task } = await res.json()
  // Update local state optimistically or refetch
}
```

```tsx
// In API route — server handles DB + auth
// src/app/api/tasks/route.ts (Server-only)
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const task = await db.task.create({ data: { ...body, userId } })
  return NextResponse.json({ data: task })
}
```

### Forbidden Patterns (NEVER do these)

- **NEVER** import Prisma in a `"use client"` file
- **NEVER** call `auth()` from `@clerk/nextjs/server` in a client component
- **NEVER** add `"use client"` to a page or layout file
- **NEVER** use `useEffect` to fetch initial page data — fetch in the server parent instead
- **NEVER** pass functions as props from server to client components (functions aren't serializable)
- **NEVER** import a server component inside a client component

---

## Frontend Architecture

### Architecture Pattern: Feature-Based Modules

Each feature is a **self-contained module**. Everything a feature needs lives inside its folder.

```
features/<feature>/
  components/     # UI components specific to this feature
  hooks/          # Custom hooks for data + logic
  types.ts        # TypeScript interfaces for this feature
  api.ts          # Fetch wrappers for API calls
```

#### Rules
- A feature NEVER imports from another feature's `components/` or `hooks/`
- Cross-feature sharing goes through `src/components/`, `src/hooks/`, or `src/types/`
- Each feature's `api.ts` is the ONLY place that calls `fetch('/api/...')` for that feature
- Each feature's `types.ts` defines all interfaces for that domain

#### Import Hierarchy (strict — never import upward)
```
pages (app/)
  ↓ imports from
features/<name>/components
  ↓ imports from
features/<name>/hooks + features/<name>/api
  ↓ imports from
features/<name>/types
  ↓ imports from
src/components/ui  +  src/hooks/  +  src/types/  +  src/lib/
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        PAGE (Server)                    │
│  auth() → db.query() → pass data as props               │
└────────────────────┬────────────────────────────────────┘
                     │ initialData (props)
                     ▼
┌─────────────────────────────────────────────────────────┐
│               FEATURE COMPONENT (Client)                │
│  useState(initialData) → render UI → handle events      │
└────────┬───────────────────────────────────┬────────────┘
         │ calls                             │ uses
         ▼                                   ▼
┌────────────────────┐            ┌───────────────────────┐
│   FEATURE HOOKS    │            │   FEATURE API (api.ts)│
│  useBoard()        │───────────►│  createTask()         │
│  useTasks()        │            │  updateColumn()       │
│  useColumns()      │            │  deleteTask()         │
└────────────────────┘            └───────────┬───────────┘
                                              │ fetch()
                                              ▼
                                  ┌───────────────────────┐
                                  │  API ROUTES (Server)   │
                                  │  auth() → db.mutate() │
                                  └───────────────────────┘
```

### Feature Hook Pattern

Every feature has hooks that encapsulate business logic. Components stay thin.

```tsx
// features/board/hooks/useTasks.ts
"use client"

import { useState, useCallback } from 'react'
import { createTask, updateTask, deleteTask } from '../api'
import type { Task, NewTask } from '../types'

const useTasks = (initialTasks: Task[]) => {
  const [tasks, setTasks] = useState(initialTasks)
  const [isLoading, setIsLoading] = useState(false)

  const addTask = useCallback(async (data: NewTask) => {
    setIsLoading(true)
    const task = await createTask(data)
    setTasks(prev => [...prev, task])
    setIsLoading(false)
    return task
  }, [])

  const removeTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))  // optimistic
    await deleteTask(id)
  }, [])

  return { tasks, setTasks, addTask, removeTask, isLoading }
}

export { useTasks }
```

### Feature API Pattern

Each feature wraps `fetch()` calls in typed functions. Components never call `fetch()` directly.

```tsx
// features/board/api.ts
import type { Task, Column, Board, NewTask } from './types'
import type { ApiResponse } from '@/types/global'

const createTask = async (data: NewTask): Promise<Task> => {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create task')
  const json: ApiResponse<Task> = await res.json()
  return json.data
}

const updateTask = async (id: string, data: Partial<Task>): Promise<Task> => {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update task')
  const json: ApiResponse<Task> = await res.json()
  return json.data
}

const deleteTask = async (id: string): Promise<void> => {
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete task')
}

export { createTask, updateTask, deleteTask }
```

### Shared Types Pattern

```tsx
// src/types/global.ts

interface ApiResponse<T> {
  data: T
}

interface ApiError {
  error: string
}

type Priority = 'urgent' | 'high' | 'medium' | 'low'

type TaskStatus = 'todo' | 'in_progress' | 'done'

export type { ApiResponse, ApiError, Priority, TaskStatus }
```

```tsx
// features/board/types.ts

import type { Priority } from '@/types/global'

interface Board {
  id: string
  userId: string
  title: string
  columns: Column[]
  createdAt: Date
  updatedAt: Date
}

interface Column {
  id: string
  boardId: string
  title: string
  position: number
  tasks: Task[]
}

interface Task {
  id: string
  columnId: string
  title: string
  description: string | null
  priority: Priority
  dueDate: Date | null
  position: number
  createdAt: Date
  updatedAt: Date
}

interface NewTask {
  columnId: string
  title: string
  description?: string
  priority: Priority
  dueDate?: Date
}

export type { Board, Column, Task, NewTask }
```

### Loading & Error States

Use **skeletons** for initial page loads, **spinners** for actions, **toasts** for feedback.

#### Skeleton Loaders (initial data load)
```tsx
// src/components/ui/Skeleton.tsx
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
)

// Usage — board loading skeleton
const BoardSkeleton = () => (
  <div className="flex gap-6">
    {[1, 2, 3].map(i => (
      <div key={i} className="w-72 flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    ))}
  </div>
)
```

#### Spinner (action in progress)
```tsx
// src/components/ui/Spinner.tsx
import { Loader2 } from 'lucide-react'

const Spinner = ({ size = 16 }: { size?: number }) => (
  <Loader2 size={size} className="animate-spin text-emerald-400" />
)

// Usage — button loading state
<button disabled={isLoading} className="...">
  {isLoading ? <Spinner size={18} /> : 'Save Task'}
</button>
```

#### Toast Notifications (success, error, info)
```tsx
// src/hooks/useToast.ts
"use client"

import { useState, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return { toasts, addToast }
}

export { useToast }
export type { Toast, ToastType }
```

#### Toast Styles
```
success:  bg-emerald-500/15 border border-emerald-500/20 text-emerald-400
error:    bg-red-500/15 border border-red-500/20 text-red-400
info:     bg-blue-500/15 border border-blue-500/20 text-blue-400
Container: fixed bottom-6 right-6 z-[60] flex flex-col gap-2
Each toast: px-4 py-3 rounded-xl backdrop-blur-xl shadow-lg animate-in slide-in-from-right
```

#### When to Use What
| Scenario                          | Loading State        |
|-----------------------------------|----------------------|
| Page first load / data fetching   | Skeleton             |
| Creating a task                   | Button spinner       |
| Deleting a task                   | Optimistic + toast   |
| Drag-and-drop reorder             | Optimistic (instant) |
| Moving task between columns       | Optimistic + toast   |
| API error                         | Error toast          |
| Successful action                 | Success toast        |
| Form submission                   | Button spinner       |

### Optimistic Updates Pattern

For drag-and-drop and quick actions, update UI immediately, sync in background:

```tsx
// Optimistic: update state FIRST, then call API
const moveTask = async (taskId: string, toColumnId: string, newPosition: number) => {
  // 1. Save previous state for rollback
  const previousColumns = [...columns]

  // 2. Update state immediately (optimistic)
  setColumns(prev => reorderColumns(prev, taskId, toColumnId, newPosition))

  // 3. Sync with server in background
  try {
    await updateTask(taskId, { columnId: toColumnId, position: newPosition })
    addToast('Task moved', 'success')
  } catch {
    // 4. Rollback on failure
    setColumns(previousColumns)
    addToast('Failed to move task', 'error')
  }
}
```

### Error Handling Strategy

```
Layer           | Handles                    | Action
─────────────────────────────────────────────────────────
API route       | Auth failure               | Return { error }, 401
API route       | Validation failure         | Return { error }, 400
API route       | DB error                   | Return { error }, 500
Feature api.ts  | Non-ok response            | Throw Error
Feature hook    | Catch from api.ts          | Rollback + toast error
Component       | Render error boundary      | Show fallback UI
```

### Component Composition Rules

1. **Components are thin** — they render UI and delegate logic to hooks
2. **Hooks own the state** — all useState, mutations, and side effects live in hooks
3. **api.ts owns the network** — all fetch calls live here, typed in and out
4. **types.ts is the contract** — shared interfaces between components, hooks, and API

```
Component:  <Board columns={columns} onDragEnd={handleDragEnd} />
                ↑ receives data + callbacks from hook

Hook:       const { columns, handleDragEnd } = useBoard(initialData)
                ↑ manages state + calls api.ts

API:        const task = await createTask(data)
                ↑ typed fetch wrapper

Types:      interface Task { id: string; title: string; ... }
                ↑ shared contract
```

---
---
# ======================== GENERAL ========================
---
---

## Key Conventions

### Code Style
- Use functional components with arrow functions
- Prefer named exports over default exports
- Use `interface` for object shapes, `type` for unions/aliases
- Keep components small and focused — extract when a component exceeds ~80 lines
- Colocate component-specific types in the component file

### Naming
- Components: PascalCase (`TaskCard.tsx`)
- Utilities/hooks: camelCase (`useBoard.ts`, `formatDate.ts`)
- API routes: kebab-case folders (`api/tasks/[id]/route.ts`)
- CSS classes: Tailwind utility classes only — no custom CSS unless unavoidable
- Database models: PascalCase singular (`Board`, `Column`, `Task`)
- Database fields: camelCase (`boardId`, `createdAt`, `dueDate`)

### State Management
- Server state: fetch from API routes, revalidate with Next.js patterns
- Client state: React useState/useReducer for local UI state
- No external state management library needed

## Commands
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npx prisma studio` — Open database GUI
- `npx prisma db push` — Push schema changes to DB
- `npx prisma generate` — Regenerate Prisma client

## Git
- Commit messages: imperative mood, concise (e.g., "Add drag-and-drop to board")
- Branch naming: `feature/description`, `fix/description`

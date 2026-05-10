# TaskHub — Team Task Manager

A full-stack collaborative task management application built with React, Node.js, and PostgreSQL. Teams create projects, invite members, assign tasks, and track progress in real-time.

## 🎯 Key Features

- **User Authentication** — Signup/Login with JWT
- **Project Management** — Create projects, add members, manage permissions
- **Task Management** — Create, assign, track task status (To Do, In Progress, Done)
- **Dashboard** — Real-time stats, task breakdown by status, member workload
- **Admin Console** — System-wide oversight, user management, global task view
- **Real-Time Updates** — Dashboard stats auto-refresh when tasks are assigned/updated
- **Role-Based Access** — Members see only their tasks; Admins see everything

## 📊 Tech Stack

| Layer | Technologies |
|-------|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Redux Toolkit, Framer Motion |
| **Backend** | Node.js, Express, PostgreSQL, JWT, bcrypt |
| **Architecture** | Monorepo (frontend + backend in single repo) |
| **Deployment** | Railway (Postgres + Backend + Frontend) |

## 📁 Project Structure

```
Team_Task_Manager/
├── backend/              Express API + PostgreSQL (port 5000)
│   ├── config/          Database connection
│   ├── routes/          API endpoints
│   ├── controllers/      Business logic
│   ├── models/           Database queries
│   ├── middleware/       Auth, error handling
│   ├── schema.sql        Database schema
│   └── server.js         Entry point
├── frontend/            React app (port 3000)
│   ├── src/
│   │   ├── components/  Reusable UI components
│   │   ├── pages/       Page routes
│   │   ├── hooks/       Custom React hooks
│   │   ├── store/       Redux slices
│   │   ├── services/    API client
│   │   └── utils/       Helper functions
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node 18+, npm
- PostgreSQL 14+

### 1️⃣ Database Setup
```bash
createdb team_task_manager

cd backend
psql -U postgres -d team_task_manager -f schema.sql
```

### 2️⃣ Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env: set DB_PASSWORD, JWT_SECRET
npm install
npm run dev
# Server: http://localhost:5000
```

### 3️⃣ Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# App: http://localhost:3000
```

### 4️⃣ Create First Admin
After signup, promote yourself:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## 🔐 Environment Variables

### Backend (`.env`)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=team_task_manager
DB_USER=postgres
DB_PASSWORD=your_password
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
PGSSL=false
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| **Auth** |
| POST | `/auth/signup` | — | Register user |
| POST | `/auth/login` | — | Login user |
| GET | `/auth/me` | ✓ | Current user |
| **Projects** |
| GET | `/projects` | ✓ | List user's projects |
| POST | `/projects` | ✓ | Create project (user becomes admin) |
| GET | `/projects/:id` | ✓ | Project details |
| PUT | `/projects/:id` | admin | Edit project |
| DELETE | `/projects/:id` | admin | Delete project |
| POST | `/projects/:id/members` | admin | Add member |
| DELETE | `/projects/:id/members/:userId` | admin | Remove member |
| **Tasks** |
| GET | `/tasks/user/tasks` | ✓ | Tasks assigned to me |
| GET | `/tasks/project/:projectId` | ✓ | Tasks in project |
| POST | `/tasks` | ✓ | Create task |
| PUT | `/tasks/:id` | ✓ | Update task |
| DELETE | `/tasks/:id` | ✓ | Delete task |
| POST | `/tasks/:id/assign` | ✓ | Assign task to user |
| DELETE | `/tasks/:id/assign/:userId` | ✓ | Unassign task |
| **Admin** |
| GET | `/admin/stats` | admin | Dashboard stats (filtered by admin's projects) |
| GET | `/admin/projects` | admin | All projects |
| GET | `/admin/tasks` | admin | All tasks |
| **Users** |
| GET | `/users` | ✓ | List users (for dropdowns) |
| PATCH | `/users/:id/role` | admin | Promote/demote user |
| DELETE | `/users/:id` | admin | Delete user |

## 🗄️ Database Schema

### users
```sql
id, name, email, password, role (admin/member), created_at
```

### projects
```sql
id, name, description, admin_id (FK users), created_at, updated_at
```

### project_members
```sql
id, project_id (FK), user_id (FK), role, joined_at
```

### tasks
```sql
id, title, description, project_id (FK), created_by (FK), status,
priority, due_date, created_at, updated_at
```

### task_assignments
```sql
id, task_id (FK), user_id (FK), assigned_at
```

## 🔄 Key Features Deep Dive

### Member Dashboard
- **Real-time Stats** — Auto-updates when tasks assigned (3s polling + event broadcast)
- **Task Management** — Change status, view details, filter by status
- **My Projects** — See member count, task count, team members
- **Auto-refresh** — Refetches on tab focus, window focus, network reconnect

### Admin Dashboard
- **Isolated Stats** — Only shows admin's own projects and tasks
- **Task Breakdown** — Visual breakdown by status with percentages
- **Team Workload** — Bar chart showing tasks per member
- **Search & Filter** — Search by name/email, filter by role

### Admin Controls
- **User Management** — Promote/demote, delete, search
- **Project Management** — Create, edit, delete, manage members
- **Task Management** — Create, edit, delete, assign, track status
- **Global View** — See all projects and tasks across system (filtered by admin)

## 🏗️ Architecture Decisions

### Why React + Vite?
- React: Component-based, large ecosystem, industry standard
- Vite: 10x faster than CRA, modern ES modules, better DX

### Why Node.js + Express?
- Non-blocking I/O — handle many concurrent connections
- Same language as frontend — less context switching
- Lightweight and flexible — easy REST API development
- Industry standard — most Node.js jobs use Express

### Why PostgreSQL?
- Relational data with complex many-to-many relationships
- ACID compliance ensures data consistency
- JOINs for efficient querying across tables
- Data integrity with foreign keys

### Why Redux?
- Predictable state flow for medium+ apps
- Redux DevTools for debugging every action
- Scalable as app grows
- Professional approach (industry standard)

### Why JWT?
- Stateless authentication — no session storage needed
- Scalable across multiple servers
- REST API standard
- Mobile-friendly for future native apps

## 🚀 Deployment (Railway)

Complete guide to deploy TaskHub on Railway from scratch.

### Prerequisites

- GitHub account (with repo pushed)
- Railway account (free tier available)
- Node.js 18+ installed locally
- All environment variables ready

### 1️⃣ Railway Account Setup

**Create Railway Account:**
1. Go to https://railway.app
2. Click **"Start Now"** (top right)
3. Click **"GitHub"** to sign up with GitHub
4. Authorize Railway to access your repositories

**Create New Project:**
1. Dashboard → Click **"New Project"**
2. Click **"Deploy from GitHub repo"**
3. Select your **Team_Task_Manager** repo
4. Click **"Deploy Now"**

### 2️⃣ Create Database (PostgreSQL)

**In Railway Dashboard:**
1. Click **"Create"** (top right)
2. Select **"Database"** → **"PostgreSQL"**
3. Wait for database to start (green status)

**Note the Connection Details:**
```
DATABASE_URL will be auto-generated
Keep it safe - you'll need it!
```

### 3️⃣ Create Backend Service

**Step 1: Create Service**
- Click "Create" → "GitHub Repo"
- **Repo:** Team_Task_Manager
- **Root Directory:** `backend`
- **Environment:** nodejs

**Step 2: Set Environment Variables**

Click on Backend service → **"Variables"** tab

Add these variables:
```
DATABASE_URL = [Copy from PostgreSQL service]
JWT_SECRET = your-super-secret-key-min-32-chars-change-this
JWT_EXPIRE = 7d
NODE_ENV = production
PGSSL = true
CORS_ORIGIN = [Leave empty for now - update after frontend]
PORT = 5000
```

**Step 3: Configure Startup Command**

Go to **"Settings"** tab:
- **Start Command:** `npm run migrate && npm start`

**Step 4: Deploy**

Click **"Deploy"** button. Wait for green status.

**Note Backend URL:** e.g., `https://taskhub-backend-production.up.railway.app`

### 4️⃣ Create Frontend Service

**Step 1: Create Service**
- Click "Create" → "GitHub Repo"
- **Repo:** Team_Task_Manager
- **Root Directory:** `frontend`
- **Environment:** nodejs

**Step 2: Set Environment Variables**

Click on Frontend service → **"Variables"** tab

Add:
```
VITE_API_URL = https://your-backend-url/api
```
(Replace with actual backend URL from step 3)

**Step 3: Configure Build & Start**

Go to **"Settings"** tab:
- **Build Command:** `npm run build`
- **Start Command:** `npm start` or `npm run preview`

**Step 4: Deploy**

Click **"Deploy"** button. Wait for green status.

### 5️⃣ Update Backend CORS

**Back in Backend Service:**

1. Go to **"Variables"** tab
2. Update **CORS_ORIGIN:**
   ```
   CORS_ORIGIN = https://your-frontend-url
   ```
   (Use actual frontend URL)
3. Click **"Redeploy"** (top button)

### 6️⃣ Verify Deployment

**Backend Health Check:**
```
https://your-backend-url/health
```

Should return:
```json
{
  "message": "Server is running",
  "timestamp": "2026-05-10T..."
}
```

**Frontend:**
Visit your frontend URL - should load the app

**Login:**
1. Signup with test account
2. Promote to admin in Railway Postgres:
   - Go to PostgreSQL service
   - Click **"Connect"** → **"Postgres CLI"**
   - Run:
     ```sql
     UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
     ```

### Deployment Checklist

- [ ] GitHub repo created and pushed
- [ ] Railway account created
- [ ] PostgreSQL database created
- [ ] Backend deployed (green status)
- [ ] Frontend deployed (green status)
- [ ] CORS_ORIGIN updated in backend
- [ ] Backend redeployed
- [ ] Health check passing
- [ ] Signup working
- [ ] Admin promotion working
- [ ] Login working

### Common Issues & Fixes

**Build fails - "Module not found"**
- Check `root` directory is set correctly
- Ensure `package.json` exists in root folder

**Frontend shows blank page**
- Check `VITE_API_URL` is correct (with `/api`)
- Check backend CORS_ORIGIN matches frontend URL

**Can't login**
- Check database connection (DATABASE_URL)
- Run migration: Check Railway logs for errors

**Getting 502 Bad Gateway**
- Check backend logs in Railway
- Verify all environment variables are set
- Restart service

### Monitor Your Deployment

**In Railway Dashboard:**

1. **View Logs:**
   - Click service → **"Logs"** tab
   - See real-time logs

2. **Monitor Performance:**
   - Click service → **"Metrics"** tab
   - CPU, Memory usage

3. **Restart Service:**
   - Click service → **"Redeploy"** button

### Security Notes

- Never share `JWT_SECRET`
- Use strong `JWT_SECRET` (32+ characters)
- Keep `DATABASE_URL` private
- Use `CORS_ORIGIN` for only your frontend
- Set `NODE_ENV = production`

---

**Your app is now live on Railway!**

## 🔧 Development

### Running Everything
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Common Commands
```bash
# Install deps
npm install

# Development
npm run dev

# Production build
npm run build

# Reset database
npm run migrate

# Database migration
npx knex migrate:latest
```

## 📈 Performance Features

- **Dashboard Polling** — 3-second auto-refresh of task stats
- **Event Broadcasting** — BroadcastChannel for instant cross-tab updates
- **Window Focus Listeners** — Refetch when user returns to tab
- **Request Deduplication** — Prevent concurrent duplicate API calls
- **Stale Response Protection** — Only accept latest API response
- **Optimistic Updates** — UI updates before server confirmation

## 🔒 Security

- **JWT Authentication** — Stateless, token-based
- **Password Hashing** — bcryptjs with salt rounds
- **CORS** — Configured per environment
- **Role-Based Access** — Admin vs Member permissions enforced server-side
- **Input Validation** — Backend validates all inputs

## 📝 Code Quality

- **TypeScript** — Type-safe code with full IDE support
- **Redux DevTools** — Track every state change
- **Error Boundaries** — Graceful error handling
- **Responsive Design** — Mobile-first Tailwind CSS

## 🎓 Learning Resources

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Vite Guide](https://vitejs.dev/)
- [Express.js Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)

## 📄 License

MIT

---

**Built by:** Tisha Coding  
**Last Updated:** May 2026

# Mini Job Portal (Enhanced)

A full-stack Job Portal web application built using the MERN Stack (MongoDB, Express.js, React.js, Node.js).

This platform features role-based dashboards, authentication, bookmarks, notifications, advanced queries, and input validation.

---

# Features

## Recruiter Features
* **Live Stats Widget**: Real-time counter of jobs posted, total applications, and most-applied job category.
* **Job Management Dashboard**: Create, update, and delete job openings, and filter for self-posted jobs.
* **Applicant Inspection drawer**: View list of applicants with full candidate details, phone, and cover letters.

## Candidate Features
* **Interactive Dashboard**:
  * Manage candidate profile (Name, Location, Skills, and Experience).
  * History list of applied jobs showing dates and companies.
  * Bookmarks list of saved jobs to apply later.
* **Job Bookmarks**: Save/Unsave job postings from listing or detail views.
* **Advanced Search Feed**: Filter jobs by type, location, salary min/max, and text search (title/company).

## General UX/UI Features
* **Light & Dark Theme Toggling**: A seamless theme toggler in the navigation bar that persists the user's preference in `localStorage`.
* **Dedicated Profile Settings**: Standalone settings page for managing contact details, location, skills, and experience with clean CSS transitions.
* **Responsive Layouts**: Fully responsive interface design adapting seamlessly to mobile, tablet, and desktop viewports.

## Security & API Features
* **Role-Based Access Control**: Route protectors for Candidate / Recruiter namespaces.
* **Input Validation**: `express-validator` schema verification enforcing data integrity.
* **JWT Authorization**: Cookie/localStorage-backed secure tokens.
* **Email Alerts**: Automatic email dispatch to recruiters upon job application submission (using SMTP / fallback console logger).

---

# Tech Stack

## Frontend
* React.js
* React Router DOM
* Plain CSS
* Fetch API

## Backend
* Node.js
* Express.js
* JSON Web Tokens (JWT)
* bcryptjs
* express-validator
* nodemailer

## Database
* MongoDB
* Mongoose

---

# Folder Structure

```bash
mini-job-portal/
│
├── frontend/
│   ├── src/
│   │   ├── api/          # authApi.js, jobApi.js
│   │   ├── components/   # Navbar, ProtectedRoute, JobCard, etc.
│   │   ├── context/      # AuthContext.jsx, ThemeContext.jsx
│   │   ├── pages/        # Dashboard, Home, CreateJob, JobDetails, Profile, etc.
│   │   ├── routes/       # AppRoutes.jsx
│   │   └── styles/       # global.css
│
├── backend/
│   ├── src/
│   │   ├── config/       # db config
│   │   ├── controllers/  # authController, jobController, applicationController
│   │   ├── models/       # User, Job, Application
│   │   ├── routes/       # authRoutes, jobRoutes
│   │   └── utils/        # authMiddleware, validators, emailService
│
└── README.md
```

--- 

# Backend Setup

## Navigate to Backend Folder
```bash
cd backend
```

## Install Dependencies
```bash
npm install
```

## Create `.env` File
Add the following key variables:
```env
MONGO_URI=mongodb://127.0.0.1:27017/mini-job-portal
PORT=5000
JWT_SECRET=stikbook-secret-key-12345

# Email SMTP config (Optional - defaults to mock logging)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

## Start Backend Server
```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

---

# Frontend Setup

## Navigate to Frontend Folder
```bash
cd frontend
```

## Install Dependencies
```bash
npm install
```

## Start Frontend
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

# API Endpoints

## Authentication & Profile

### Register User
* **URL**: `POST /api/auth/register`
* **Access**: Public
* **Payload**: `{ name, email, password, role }`

### Login User
* **URL**: `POST /api/auth/login`
* **Access**: Public
* **Payload**: `{ email, password }`

### Get Current User Profile
* **URL**: `GET /api/auth/me`
* **Access**: Private (Bearer Token)

### Update User Profile
* **URL**: `PUT /api/auth/profile`
* **Access**: Private (Bearer Token)
* **Payload**: `{ name, email, skills, experience, location }`

---

## Jobs APIs

### Get All Jobs (Paginated / Filtered)
* **URL**: `GET /api/jobs`
* **Access**: Public
* **Params**: `?page=1&limit=6&search=React&location=Remote&type=Full-time&minSalary=50000&maxSalary=150000&sort=-createdAt&postedBy=me`

### Get Single Job
* **URL**: `GET /api/jobs/:id`
* **Access**: Public

### Create Job
* **URL**: `POST /api/jobs`
* **Access**: Private (Recruiter only)
* **Payload**: `{ title, company, location, salary, type, description }`

### Update Job
* **URL**: `PUT /api/jobs/:id`
* **Access**: Private (Recruiter only, creator only)

### Delete Job
* **URL**: `DELETE /api/jobs/:id`
* **Access**: Private (Recruiter only, creator only)

### Get Recruiter Stats
* **URL**: `GET /api/jobs/recruiter/stats`
* **Access**: Private (Recruiter only)

---

## Bookmarks (Saved Jobs)

### Save Job
* **URL**: `POST /api/jobs/:id/save`
* **Access**: Private (Candidate only)

### Unsave Job
* **URL**: `DELETE /api/jobs/:id/save`
* **Access**: Private (Candidate only)

### Get Bookmarked Jobs
* **URL**: `GET /api/jobs/saved`
* **Access**: Private (Candidate only)

---

## Applications APIs

### Submit Application
* **URL**: `POST /api/jobs/:id/applications`
* **Access**: Private (Candidate only)
* **Payload**: `{ name, email, phone, resume, coverLetter }`

### Get Applications for a Job
* **URL**: `GET /api/jobs/:id/applications`
* **Access**: Private (Recruiter only, owner only)

### Get Candidate Applications History
* **URL**: `GET /api/jobs/my-applications`
* **Access**: Private (Candidate only)

---

# License

This project is developed for educational and assignment purposes.

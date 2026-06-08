# Mini Job Portal

A full-stack Job Portal web application built using the MERN Stack (MongoDB, Express.js, React.js, Node.js).

This platform allows recruiters to create and manage job postings while candidates can browse and apply for jobs.

---

# Features

## Recruiter Features

* Create Job Postings
* Edit Existing Jobs
* Delete Jobs
* View All Applications

## Candidate Features

* Browse Available Jobs
* Search Jobs
* Filter Jobs by Type
* View Job Details
* Apply for Jobs

## UI Features

* Responsive Design
* Dashboard-style Layout
* Modern Job Cards
* Professional Forms
* Search & Filter System

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
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── styles/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
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

Add the following:

```env
MONGO_URI=mongodb://127.0.0.1:27017/mini-job-portal
PORT=5000
```

## Start Backend Server

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

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

Frontend runs on:

```bash
http://localhost:5173
```

---

# API Endpoints

## Jobs APIs

### Get All Jobs

```http
GET /api/jobs
```

### Get Single Job

```http
GET /api/jobs/:id
```

### Create Job

```http
POST /api/jobs
```

### Update Job

```http
PUT /api/jobs/:id
```

### Delete Job

```http
DELETE /api/jobs/:id
```

---

## Applications APIs

### Apply for Job

```http
POST /api/jobs/:id/apply
```

### Get Applications for a Job

```http
GET /api/jobs/:id/applications
```

---

# License

This project is developed for educational and assignment purposes.

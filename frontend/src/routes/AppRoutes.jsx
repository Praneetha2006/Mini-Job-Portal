import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import CreateJob from "../pages/CreateJob/CreateJob";
import JobDetails from "../pages/JobDetails/JobDetails";
import EditJob from "../pages/EditJob/EditJob";
import Applications from "../pages/Applications/Applications";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/job/:id" element={<JobDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Shared Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={["recruiter", "candidate"]}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={["recruiter", "candidate"]}>
            <Profile />
          </ProtectedRoute>
        } 
      />

      {/* Recruiter-Only Protected Routes */}
      <Route 
        path="/create-job" 
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CreateJob />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/edit-job/:id" 
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <EditJob />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applications" 
        element={
          <ProtectedRoute allowedRoles={["recruiter", "candidate"]}>
            <Applications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applications/:id" 
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <Applications />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default AppRoutes;
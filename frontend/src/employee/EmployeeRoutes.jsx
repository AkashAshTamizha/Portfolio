import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeLayout from "./components/EmployeeLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import SkillsPage from "./pages/SkillsPage";
import EducationPage from "./pages/EducationPage";
import CertificationsPage from "./pages/CertificationsPage";
import ContactInfoPage from "./pages/ContactInfoPage";
import TasksPage from "./pages/TasksPage";
import AttendancePage from "./pages/AttendancePage";
import LeavePage from "./pages/LeavePage";
import MyProjectsPage from "./pages/MyProjectsPage";

export default function EmployeeRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/employee/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/employee" element={<Dashboard />} />
          <Route path="/employee/dashboard" element={<Dashboard />} />
          <Route path="/employee/profile" element={<ProfilePage />} />
          <Route path="/employee/skills" element={<SkillsPage />} />
          <Route path="/employee/education" element={<EducationPage />} />
          <Route path="/employee/certifications" element={<CertificationsPage />} />
          <Route path="/employee/contact-info" element={<ContactInfoPage />} />
          <Route path="/employee/tasks" element={<TasksPage />} />
          <Route path="/employee/attendance" element={<AttendancePage />} />
          <Route path="/employee/leave" element={<LeavePage />} />
          <Route path="/employee/projects" element={<MyProjectsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

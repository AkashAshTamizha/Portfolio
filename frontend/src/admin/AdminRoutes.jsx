import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardHome from "./pages/DashboardHome";
import ProfilePage from "./pages/ProfilePage";
import SkillsPage from "./pages/SkillsPage";
import ServicesPage from "./pages/ServicesPage";
import ExperiencePage from "./pages/ExperiencePage";
import EducationPage from "./pages/EducationPage";
import CertificationsPage from "./pages/CertificationsPage";
import ContactInfoPage from "./pages/ContactInfoPage";
import ProjectsPage from "./pages/ProjectsPage";
import EmployeesPage from "./pages/EmployeesPage";
import TasksPage from "./pages/TasksPage";
import AttendancePage from "./pages/AttendancePage";
import LeavesPage from "./pages/LeavesPage";
import ReviewsPage from "./pages/ReviewsPage";
import SettingsPage from "./pages/SettingsPage";

export default function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/setup" element={<Setup />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password/:token" element={<ResetPassword />} />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<DashboardHome />} />
          <Route path="/admin/dashboard" element={<DashboardHome />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
          <Route path="/admin/skills" element={<SkillsPage />} />
          <Route path="/admin/services" element={<ServicesPage />} />
          <Route path="/admin/experience" element={<ExperiencePage />} />
          <Route path="/admin/education" element={<EducationPage />} />
          <Route path="/admin/certifications" element={<CertificationsPage />} />
          <Route path="/admin/contact-info" element={<ContactInfoPage />} />
          <Route path="/admin/projects" element={<ProjectsPage />} />
          <Route path="/admin/employees" element={<EmployeesPage />} />
          <Route path="/admin/tasks" element={<TasksPage />} />
          <Route path="/admin/attendance" element={<AttendancePage />} />
          <Route path="/admin/leaves" element={<LeavesPage />} />
          <Route path="/admin/reviews" element={<ReviewsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

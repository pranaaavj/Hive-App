import { Routes, Route } from "react-router-dom";
import { RegisterPage } from "./pages/user/RegisterPage";
import { LoginPage } from "./pages/user/LoginPage";
import { HomePage } from "./pages/user/HomePage";
import { ResetPasswordPage } from "./pages/user/ResetPassword";
import { ForgetPasswordPage } from "./pages/user/ForgetPassword";
import { MainLayout } from "./components/layouts/MainLayout";
import { ProfilePage } from "./pages/user/ProfilePage";
import { ProfileEditPage } from "./pages/user/ProfielEditPage";
import MessagesPage from "./pages/user/MessagesPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { setupPostSocketListeners } from "./lib/socketListeners";
import { useSocketAuth } from "./hooks/useSocketAuth";
import { useEffect } from "react";
import { UserProtectedRoute, AdminProtectedRoute } from "./utils/ProtectedRoute";

function App() {
  useSocketAuth();

  useEffect(() => {
    setupPostSocketListeners();
  }, []);

  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forget-password" element={<ForgetPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/adminlogin" element={<AdminLoginPage />} />

      <Route element={<UserProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/profile/edit/:userId" element={<ProfileEditPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:userId" element={<MessagesPage />} />
        </Route>
      </Route>

      <Route element={<AdminProtectedRoute />}>
  
        <Route path="/adminhome" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;

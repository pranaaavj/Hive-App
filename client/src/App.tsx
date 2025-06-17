import './App.css'
import { Route, Routes } from "react-router-dom"
import { RegisterPage } from './pages/user/RegisterPage'
import { LoginPage } from './pages/user/LoginPage'
import { HomePage } from './pages/user/HomePage'
import { ResetPasswordPage } from './pages/user/ResetPassword'
import { ForgetPasswordPage } from './pages/user/ForgetPassword'
import { MainLayout } from './components/layouts/MainLayout'
import { ProfilePage } from './pages/user/ProfilePage'
import { ProtectedRoute } from './utils/ProtectedRoute'
import {ProfileEditPage} from './pages/user/ProfielEditPage'
import { setupPostSocketListeners } from './lib/socketListeners'
import { useEffect } from 'react'
import MessagesPage from './pages/user/MessagesPage'
import { useSocketAuth } from './hooks/useSocketAuth'

function App() {
  useSocketAuth();
   useEffect(() => {
    setupPostSocketListeners(); // ✅ Setup global socket event handlers ONCE
  }, []);
  return (
    <Routes>
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/forget-password' element={<ForgetPasswordPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      
     
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path='/profile/edit/:userId' element={<ProfileEditPage />} />
        <Route path='/messages' element={<MessagesPage />} />
      </Route>
    </Routes>
  )
}

export default App
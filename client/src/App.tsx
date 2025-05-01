import './App.css'
import {Route, Routes} from "react-router-dom"
import { RegisterPage } from './pages/user/RegisterPage'
import { LoginPage } from './pages/user/LoginPage'
import { HomePage } from './pages/user/HomePage'

function App() {

  return (
    <Routes>
      <Route path='/register' element={<RegisterPage/>} />
      <Route path='/login' element={<LoginPage/>} />
      <Route path='/home' element={<HomePage/>} />
    </Routes>
  )
}

export default App
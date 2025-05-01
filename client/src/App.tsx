import './App.css'
import {Route, Routes} from "react-router-dom"
import { RegisterPage } from './pages/user/RegisterPage'
import { LoginPage } from './pages/user/LoginPage'

function App() {

  return (
    <Routes>
      <Route path='/register' element={<RegisterPage/>} />
      <Route path='/login' element={<LoginPage/>} />
          
    </Routes>
  )
}

export default App
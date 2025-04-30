import './App.css'
import {Route, Routes} from "react-router-dom"
import { RegisterPage } from './pages/user/RegisterPage'

function App() {

  return (
    <Routes>
      <Route path='/register' element={<RegisterPage/>} />
          
    </Routes>
  )
}

export default App
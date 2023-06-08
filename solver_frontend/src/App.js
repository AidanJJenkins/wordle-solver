import './App.css';
import { Routes, Route } from 'react-router-dom';
import Solver from './components/Solver'
import Register from './components/Register'
import Login from './components/Login'

function App() {
  return (
    <Routes>
      <Route path="/solver" element={<Solver />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;

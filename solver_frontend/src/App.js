import "./App.css";
import { Routes, Route } from "react-router-dom";
import Solver from "./components/Solver";
import Register from "./components/Register";
import Login from "./components/Login";
import Settings from "./components/Settings";

function App() {
  return (
    <Routes>
      // <Route path="/solver" element={<Solver />} />
      <Route path="/" element={<Solver />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;

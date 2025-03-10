import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";

const App: React.FC = () => {
  return (
    <div>
      <nav>
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/signup">Sign Up</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<VerifyEmail />} />
      </Routes>
    </div>
  );
};

export default App;

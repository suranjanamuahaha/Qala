import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import UserProfile from './components/UserProfile';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<UserProfile />} />
      </Routes>
    </div>
  )
}

export default App;

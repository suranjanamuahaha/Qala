import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
// import UserProfile from './components/UserProfile';
import RequireRole from "./components/RequireRole";
import CustomerDashboard from './components/CustomerDashboard';
import CustomerProfile from './components/CustomerProfile';
import ArtistProfile from "./components/ArtistProfile";
import ArtistDashboard from "./components/ArtistDashboard";
import ArtistPublicProfile from "./components/ArtistPublicProfile";
import FloatingChatbot from "./components/FloatingChatbot";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<CustomerProfile />} />
        <Route path="/user/customer" element={<RequireRole allowed={["customer"]}><CustomerProfile /></RequireRole>} />
        <Route path="/user/artist" element={<RequireRole allowed={["artist"]}><ArtistProfile /></RequireRole>} />
        <Route path="/dashboard/customer" element={<RequireRole allowed={["customer"]}><CustomerDashboard /></RequireRole>} />
        <Route path="/dashboard/artist" element={<RequireRole allowed={["artist"]}><ArtistDashboard /></RequireRole>} />
        <Route path="/artist/:artistId" element={<ArtistPublicProfile />} />
      </Routes>
      <FloatingChatbot />
    </div>
  )
}

export default App;

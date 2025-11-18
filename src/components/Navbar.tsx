import { useState } from "react"
import LoginModal from "./LoginModal";
import { UserCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, setIsLoggedIn }: { isLoggedIn: boolean, setIsLoggedIn: (v: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const navigate = useNavigate();

  const handleNavigateToUser = () => {
    navigate('/user'); // Navigate to the '/about' path
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center text-2xl font-bold text-blue-800">
              Qala
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-blue-600">
                Home
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600">
                About
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600">
                Services
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600">
                Contact
              </a>
              {!isLoggedIn ? (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="py-3 px-3 text-white bg-blue-500 hover:bg-blue-600 transition rounded-lg shadow-lg"
                >
                  Login/Signup
                </button>
              ) : (
                <button onClick={handleNavigateToUser} className="rounded-full hover:ring-2 hover:ring-blue-500 p-1 transition">
                  <UserCircle size={36} className="text-blue-600" />
                </button>
              )}
            </div>


            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                {isOpen ? "✖" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
            >
              Home
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
            >
              About
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
            >
              Services
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
            >
              Contact
            </a>
          </div>
        )}
      </nav>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => {
          console.log("done");
          setIsLoginOpen(false);
          setIsLoggedIn(true); // 👈 This line is key
        }}
      />
    </>
  )
}

export default Navbar

import { useState, useEffect } from "react";
import LoginModal from "./LoginModal";
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "../lib/firebaseHelpers";
import type { Role } from "../lib/types";

const Navbar = ({
  isLoggedIn,
  setIsLoggedIn,
}: {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // profile dropdown
  const [userRole, setUserRole] = useState<Role | null>(null);

  const navigate = useNavigate();
  const auth = getAuth();

  // keep role in sync on refresh / auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        getUserProfile(user.uid).then((p) => {
          setUserRole(p?.role ?? null);
        });
      } else {
        setUserRole(null);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToProfile = () => {
    setIsProfileMenuOpen(false);

    if (userRole === "artist") {
      navigate("/user/artist");
    } else if (userRole === "customer") {
      navigate("/user/customer");
    } else {
      navigate("/user");
    }
  };

  const goToDashboard = () => {
    setIsProfileMenuOpen(false);

    if (userRole === "artist") {
      navigate("/dashboard/artist");
    } else if (userRole === "customer") {
      navigate("/dashboard/customer");
    } else {
      navigate("/dashboard");
    }
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
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
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
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="rounded-full hover:ring-2 hover:ring-blue-500 p-1 transition"
                  >
                    <UserCircle size={36} className="text-blue-600" />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm">
                      <button
                        onClick={goToProfile}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                      <button
                        onClick={goToDashboard}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Dashboard
                      </button>
                    </div>
                  )}
                </div>
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

            {!isLoggedIn ? (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="m-4 w-[calc(100%-2rem)] py-3 px-3 text-white bg-blue-500 hover:bg-blue-600 transition rounded-lg shadow-lg"
              >
                Login/Signup
              </button>
            ) : (
              <div className="border-t border-gray-200 mt-2">
                <button
                  onClick={goToProfile}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                >
                  Profile
                </button>
                <button
                  onClick={goToDashboard}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                >
                  Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => {
          console.log("done");
          setIsLoginOpen(false);
          setIsLoggedIn(true);

          // set role right after login
          const user = auth.currentUser;
          if (user) {
            getUserProfile(user.uid).then((p) => {
              setUserRole(p?.role ?? null);
            });
          }
        }}
      />
    </>
  );
};

export default Navbar;

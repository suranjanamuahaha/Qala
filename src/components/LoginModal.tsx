// src/components/LoginModal.tsx
import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase.js";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const auth = getAuth(app);

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createUser = () => {
    createUserWithEmailAndPassword(auth, email, password).then((_value) => alert("User Successfully Created")).catch((err) => {
      console.error("ERROR:", err);
      alert(err.message);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex justify-center align-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" required placeholder="Email" className="border rounded-lg px-3 py-2" />
          <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" required placeholder="Password" className="border rounded-lg px-3 py-2" />
          <button onClick={createUser} type="submit" className="bg-blue-600 text-white py-2 rounded-lg mt-2">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;

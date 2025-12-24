import React from "react";
import { motion } from "framer-motion";

const UserProfile: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-900/50 flex flex-col items-center py-10 px-5">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl w-full text-center"
      >
        <img
          src="/assets/artist-image.jpg"
          alt="Artist Profile"
          className="w-36 h-36 rounded-full mx-auto object-cover shadow-md"
        />

        <h1 className="mt-4 text-3xl font-semibold text-gray-800">Aiden Gray</h1>
        <p className="text-gray-500 text-sm">Digital Artist | Concept Designer</p>

        <p className="mt-4 text-gray-700 text-base leading-relaxed">
          Aiden is a passionate digital artist who blends realism with fantasy.
          His works often explore human emotions, surrealism, and nature-inspired
          visual storytelling.
        </p>3

        <div className="mt-5 flex justify-center gap-4">
          <a
            href="#"
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            Instagram
          </a>
          <a
            href="#"
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            ArtStation
          </a>
          <a
            href="#"
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            Portfolio
          </a>
        </div>
      </motion.div>

      {/* Works Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10 max-w-5xl w-full"
      >
        {[
          "/assets/art1.jpg",
          "/assets/art2.jpg",
          "/assets/art3.jpg",
          "/assets/art4.jpg",
          "/assets/art5.jpg",
          "/assets/art6.jpg",
        ].map((img, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <img
              src={img}
              alt={`Art ${i + 1}`}
              className="w-full h-64 object-cover"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default UserProfile;

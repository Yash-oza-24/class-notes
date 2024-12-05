import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full z-30 w-64 bg-gray-800 text-white transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="flex justify-between items-center p-4">
        <h2 className="text-2xl font-bold">Menu</h2>
        <button onClick={onClose} className="text-gray-300 hover:text-white">
          X
        </button>
      </div>
      <nav className="mt-8">
        <Link to="/home" className="block px-4 py-2 hover:bg-gray-700">
          Home
        </Link>
        <Link to="/profile" className="block px-4 py-2 hover:bg-gray-700">
          Profile
        </Link>
        <Link to="/settings" className="block px-4 py-2 hover:bg-gray-700">
          Settings
        </Link>
      
      </nav>
    </div>
  );
};

export default Sidebar;

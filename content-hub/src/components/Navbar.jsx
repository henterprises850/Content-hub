import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from "react-icons/fi";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ContentHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary transition"
            >
              Home
            </Link>
            <Link
              to="/competitions"
              className="text-gray-700 hover:text-primary transition"
            >
              Competitions
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary transition"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>{user.name}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FiUser className="mr-2" />
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiSettings className="mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <Link
              to="/"
              className="block py-2 text-gray-700 hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/competitions"
              className="block py-2 text-gray-700 hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Competitions
            </Link>
            <Link
              to="/profile"
              className="block py-2 text-gray-700 hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 text-gray-700 hover:text-primary transition"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block py-2 text-gray-700 hover:text-primary transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left py-2 text-gray-700 hover:text-primary transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 hover:text-primary transition"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-gray-700 hover:text-primary transition"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

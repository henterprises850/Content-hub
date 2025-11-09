import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-quill/dist/quill.snow.css";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContentDetail from "./pages/ContentDetail";
import AdminPanel from "./pages/AdminPanel";
import Competitions from "./pages/Competitions";
import Profile from "./pages/Profile";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/content/:id" element={<ContentDetail />} />
              <Route path="/competitions" element={<Competitions />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminPanel />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

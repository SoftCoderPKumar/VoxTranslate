import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TranslatorPage from "./pages/TranslatorPage";
import SettingsPage from "./pages/SettingsPage";
import AboutPage from "./pages/AboutPage";
import TermsPage from "./pages/TermsPage";
import HistoryPage from "./pages/HistoryPage";
import NotFoundPage from "./pages/NotFoundPage";
import SpeechTranslatorPage from "./pages/SpeechTranslatorPage";
import ChatbotPage from "./pages/ChatbotPage";

// Components
import Navbar from "./components/Navbar";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-orange mx-auto mb-3" />
          <p className="text-muted-dark">Loading...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/" replace />;
};

// Public route (redirect to translator if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/translate" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Auth pages */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* Protected pages */}
        <Route
          path="/translate"
          element={
            <ProtectedRoute>
              <TranslatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/speech-translate"
          element={
            <ProtectedRoute>
              <SpeechTranslatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#161B22",
              color: "#E6EDF3",
              border: "1px solid #30363D",
              borderRadius: "12px",
              fontFamily: "Space Grotesk, sans-serif",
            },
            success: {
              iconTheme: { primary: "#2D7D46", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#FF6B1A", secondary: "#fff" },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
};

export default App;

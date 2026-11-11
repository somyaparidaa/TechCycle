import React from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";

// Import your pages and components
import LandingPage from "./pages/LandingPage";
import Login from "./components/auth/login/index";
import Register from "./components/auth/register/index";
import UserProfile from "./pages/UserProfile";
import InnerDash from "./components/InnerDash";
import Profile from "./components/Profile";
import RecyclingMap from "./components/RecyclingMap";
import Awareness from "./components/Awareness";
import FeedbackInterface from "./components/feedback";
import InstitutionalPortal from "./components/institution";

// Import your separate CSS file
import "./App.css";

function AppRoutes() {
  const routesArray = [
    { path: "/", element: <LandingPage /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    {
      path: "/profile",
      element: <UserProfile />,
      children: [
        { path: "dashboard", element: <InnerDash /> },
        { path: "info", element: <Profile /> },
        { path: "map", element: <RecyclingMap /> },
        { path: "awareness", element: <Awareness /> },
        { path: "feedback", element: <FeedbackInterface /> },
        { path: "institution", element: <InstitutionalPortal /> },
        { path: "", element: <InnerDash /> }, // Default child route
      ],
    },
    { path: "*", element: <Login /> },
  ];

  return useRoutes(routesArray);
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-containerss">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TitleBar } from "@/components/TitleBar";

import Welcome from "./pages/Welcome";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ManageProfiles from "./pages/ManageProfiles";

const queryClient = new QueryClient();

export interface ActiveProfile {
  _id: string;
  username: string;
  email: string;
  photo_url?: string | null;
}

const AppContent = () => {
  const [profiles, setProfiles] = useState<ActiveProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<ActiveProfile | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("profiles");
    if (stored) {
      const parsed = JSON.parse(stored);
      setProfiles(parsed);
      const lastActive = localStorage.getItem("activeProfile");
      if (lastActive) {
        const found = parsed.find((p: ActiveProfile) => p._id === lastActive);
        if (found) setActiveProfile(found);
      }
    }
  }, []);

  useEffect(() => {
    if (activeProfile) localStorage.setItem("activeProfile", activeProfile._id);
  }, [activeProfile]);

  const handleProfileSelected = (profile: ActiveProfile) => {
    const updated = [...profiles.filter((p) => p._id !== profile._id), profile];
    setProfiles(updated);
    localStorage.setItem("profiles", JSON.stringify(updated));
    setActiveProfile(profile);
    navigate("/");
  };

  const handleProfileSwitch = (id: string) => {
    const profile = profiles.find((p) => p._id === id);
    if (profile) setActiveProfile(profile);
  };

  // prevent redirecting away when on manage-profiles
  const isManagePage = location.pathname === "/manage-profiles";

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={
              !isManagePage && activeProfile ? (
                <Index
                  profile={activeProfile}
                  allProfiles={profiles}
                  onProfileSwitch={(p) => handleProfileSwitch(p._id)}
                />
              ) : (
                !isManagePage && <Welcome onProfileSelected={handleProfileSelected} />
              )
            }
          />
          <Route path="/signup" element={<Signup onProfileSelected={handleProfileSelected} />} />
          <Route path="/login" element={<Login onProfileSelected={handleProfileSelected} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/manage-profiles" element={<ManageProfiles />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

export interface ActiveProfile {
  _id: string;
  username: string;
  email: string;
  photo_url?: string | null;
}

const App = () => {
  
  const [profiles, setProfiles] = useState<ActiveProfile[]>([]);
 
  const [activeProfile, setActiveProfile] = useState<ActiveProfile | null>(null);

  
  const handleProfileSelected = (profile: ActiveProfile) => {
    if (!profiles.find((p) => p._id === profile._id)) {
      setProfiles((prev) => [...prev, profile]);
    }
    setActiveProfile(profile);
  };

  const handleProfileSwitch = (id: string) => {
    const profile = profiles.find((p) => p._id === id);
    if (profile) setActiveProfile(profile);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="flex flex-col h-screen overflow-hidden">
            <BrowserRouter>
              <TitleBar />
              <div className="flex-1 overflow-auto">
                <Routes>
                  <Route
                    path="/"
                    element={
                      activeProfile ? (
                        <Index
                          profile={activeProfile}
                          allProfiles={profiles}
                          onProfileSwitch={(id) => handleProfileSwitch(id)}
                        />
                      ) : (
                        <Welcome onProfileSelected={handleProfileSelected} />
                      )
                    }
                  />
                  <Route
                    path="/signup"
                    element={<Signup onProfileSelected={handleProfileSelected} />}
                  />
                  <Route
                    path="/login"
                    element={<Login onProfileSelected={handleProfileSelected} />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, LogIn } from "lucide-react";
import { ProfileCard } from "@/components/ProfileCard";
import { useNavigate } from "react-router-dom";

export interface ActiveProfile {
  _id: string;
  username: string;
  email: string;
  photo_url: string | null;
  created_at?: string;
}

interface WelcomeProps {
  onProfileSelected: (profile: ActiveProfile) => void;
}

export default function Welcome({ onProfileSelected }: WelcomeProps) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ActiveProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedProfiles = JSON.parse(localStorage.getItem("profiles") || "[]");
    setProfiles(savedProfiles);
    setLoading(false);
  }, []);

  const handleProfileSelect = (profile: ActiveProfile) => {
    localStorage.setItem("activeProfile", JSON.stringify(profile));
    onProfileSelected(profile);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white/90">Who's using Pingcat?</h1>
        <p className="text-sm text-white/60">Select a profile to continue</p>
      </div>

      <div className="bg-black/20 p-6 rounded-2xl flex flex-wrap justify-center gap-6 max-w-fit w-full">
        {loading ? (
          <div className="text-white/60">Loading profiles...</div>
        ) : profiles.length > 0 ? (
          profiles.map((profile) => (
            <ProfileCard
              key={profile._id}
              username={profile.username}
              email={profile.email}
              photoUrl={profile.photo_url}
              onClick={() => handleProfileSelect(profile)}
            />
          ))
        ) : (
          <div className="text-center text-white/60 py-12">
            No profiles found. Create your first account to get started!
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          onClick={() => navigate("/signup")}
          className="bg-gradient-primary hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          {profiles.length > 0 ? "Add Account" : "Create Account"}
        </Button>

        {profiles.length > 0 && (
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login")}
            className="border-primary/20 hover:bg-primary/5 flex items-center gap-2"
          >
            <LogIn className="h-5 w-5" />
            Login to Existing Account
          </Button>
        )}
      </div>
    </div>
  );
}

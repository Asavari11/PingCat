import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ActiveProfile } from "./Welcome";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onProfileSelected: (profile: ActiveProfile) => void;
}

export default function Login({ onProfileSelected }: LoginProps) {
  const navigate=useNavigate();
  const [formData, setFormData] = useState({ emailOrUsername: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("activeProfile", JSON.stringify(data.profile));
      onProfileSelected(data.profile);
      navigate("/");
      toast({ title: "Welcome back!", description: `Logged in as ${data.profile.username}` });
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" onClick={() => window.location.href = "/"} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profiles
        </Button>

        <Card className="shadow-card-hover border border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Welcome Back</CardTitle>
            <CardDescription>Login to your Pingcat account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">Username or Email</Label>
                <Input
                  id="emailOrUsername" name="emailOrUsername" value={formData.emailOrUsername}
                  onChange={handleChange} required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password" name="password" type="password" value={formData.password}
                  onChange={handleChange} required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

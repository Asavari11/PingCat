import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
import { ActiveProfile } from "./Welcome";
import { useNavigate } from "react-router-dom";

const signupSchema = z
  .object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface SignupProps {
  onProfileSelected: (profile: ActiveProfile) => void;
}

export default function Signup({ onProfileSelected }: SignupProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create account");

      // Save active profile
      localStorage.setItem("activeProfile", JSON.stringify(data.profile));

      // Add to local profiles array
      const existing = JSON.parse(localStorage.getItem("profiles") || "[]");
      const updated = [...existing.filter((p: ActiveProfile) => p._id !== data.profile._id), data.profile];
      localStorage.setItem("profiles", JSON.stringify(updated));

      onProfileSelected(data.profile);
      navigate("/");
      toast({ title: "Account created!", description: `Welcome ${data.profile.username}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription>Join Pingcat</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {["username", "email", "password", "confirmPassword"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {field === "confirmPassword" ? "Confirm Password" : field}
                  </Label>
                  <Input
                    id={field}
                    name={field}
                    type={field.includes("password") ? "password" : "text"}
                    value={(formData as any)[field]}
                    onChange={handleChange}
                    required
                  />
                  {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                </div>
              ))}
              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

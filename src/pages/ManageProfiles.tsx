import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Edit,
  Trash,
  PlusCircle,
  LogIn,
  Check,
  X,
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

const ManageProfiles = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState("");
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("profiles");
    if (stored) setProfiles(JSON.parse(stored));
  }, []);

  const saveProfiles = (updated: Profile[]) => {
    setProfiles(updated);
    localStorage.setItem("profiles", JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    saveProfiles(updated);
    fetch(`http://localhost:5000/api/users/${id}`, { method: "DELETE" }).catch(() => {});
    setShowDeleteConfirm(false);
    setSelectedProfile(null);
  };

  const handleEdit = (id: string, field: string) => {
    const updatedProfiles = profiles.map((p) => {
      if (p.id === id) {
        if (field === "password") {
          fetch(`http://localhost:5000/api/users/${id}/password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(passwordData),
          }).catch(() => {});
        } else {
          const updated = { ...p, [field]: editedValue };
          fetch(`http://localhost:5000/api/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
          }).catch(() => {});
          return updated;
        }
      }
      return p;
    });
    saveProfiles(updatedProfiles);
    setEditMode(null);
    setEditedValue("");
  };

  const openNewWindow = (path: string) => {
    window.open(path, "_blank", "width=600,height=700");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold">Manage Profiles</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="relative">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatarUrl || ""} />
                  <AvatarFallback>{profile.name && profile.name.length > 0 ? profile.name.charAt(0).toUpperCase() : "?"}</AvatarFallback>
                </Avatar>
                {profile.name}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Edit className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setEditMode("avatarUrl")} className="cursor-pointer">
                    Edit profile picture
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditMode("name")} className="cursor-pointer">
                    Edit username
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditMode("email")} className="cursor-pointer">
                    Edit email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditMode("password")} className="cursor-pointer">
                    Change password
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedProfile(profile);
                      setShowDeleteConfirm(true);
                    }}
                    className="cursor-pointer text-red-500"
                  >
                    <Trash className="h-4 w-4 mr-2" /> Delete profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            {editMode && (
              <CardContent className="space-y-3">
                {editMode === "password" ? (
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Old password"
                      className="border px-2 py-1 rounded w-full"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className="border px-2 py-1 rounded w-full"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={`Enter new ${editMode}`}
                    className="border px-2 py-1 rounded w-full"
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                  />
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(profile.id, editMode!)}>
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(null)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      <div className="flex gap-4 pt-4">
        <Button onClick={() => openNewWindow("/login")} className="flex items-center gap-2">
          <LogIn className="h-4 w-4" /> Login to another account
        </Button>
        <Button onClick={() => openNewWindow("/signup")} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> Create new account
        </Button>
      </div>
      {showDeleteConfirm && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-xl space-y-4 w-80">
            <h2 className="text-lg font-semibold">Delete {selectedProfile.name}?</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this profile? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(selectedProfile.id)}>
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProfiles;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { BrowserSettings } from '@/services/settingsService';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  _id: string;
  username: string;
  email: string;
  photo_url?: string | null;
}

interface ProfileSettingsProps {
  settings: BrowserSettings;
  onChange: <K extends keyof BrowserSettings>(key: K, value: BrowserSettings[K]) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ settings, onChange }) => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    photo_url: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('profiles');
    if (stored) {
      setProfiles(JSON.parse(stored));
    }
  }, []);

  const handleSaveProfiles = (updatedProfiles: Profile[]) => {
    setProfiles(updatedProfiles);
    localStorage.setItem('profiles', JSON.stringify(updatedProfiles));
  };

  const handleAddProfile = () => {
    setEditingProfile(null);
    setFormData({ username: '', email: '', photo_url: '' });
    setIsDialogOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      username: profile.username,
      email: profile.email,
      photo_url: profile.photo_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProfile = (profileId: string) => {
    const updatedProfiles = profiles.filter(p => p._id !== profileId);
    handleSaveProfiles(updatedProfiles);
    toast({
      title: "Profile deleted",
      description: "The profile has been removed successfully.",
    });
  };

  const handleSaveProfile = () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "Username and email are required.",
        variant: "destructive",
      });
      return;
    }

    const profileData: Profile = {
      _id: editingProfile?._id || Date.now().toString(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      photo_url: formData.photo_url.trim() || null,
    };

    let updatedProfiles: Profile[];
    if (editingProfile) {
      updatedProfiles = profiles.map(p =>
        p._id === editingProfile._id ? profileData : p
      );
    } else {
      updatedProfiles = [...profiles, profileData];
    }

    handleSaveProfiles(updatedProfiles);
    setIsDialogOpen(false);
    toast({
      title: editingProfile ? "Profile updated" : "Profile added",
      description: `Profile "${profileData.username}" has been ${editingProfile ? 'updated' : 'added'} successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profiles & Accounts</CardTitle>
          <CardDescription>
            Manage your browser profiles and account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base">Browser Profiles</Label>
              <Button onClick={handleAddProfile} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            </div>

            <div className="space-y-3">
              {profiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No profiles found</p>
                  <p className="text-sm">Create your first profile to get started</p>
                </div>
              ) : (
                profiles.map((profile) => (
                  <div
                    key={profile._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile.photo_url || ''} alt={profile.username} />
                        <AvatarFallback>
                          {profile.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.username}</p>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProfile(profile)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProfile(profile._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? 'Edit Profile' : 'Add New Profile'}
            </DialogTitle>
            <DialogDescription>
              {editingProfile
                ? 'Update the profile information below.'
                : 'Create a new browser profile with the details below.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo-url">Profile Picture URL (Optional)</Label>
              <Input
                id="photo-url"
                value={formData.photo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              {editingProfile ? 'Update Profile' : 'Add Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

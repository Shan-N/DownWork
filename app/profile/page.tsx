'use client';

import Navbar from "@/components/ui/navbar";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SkillCombobox } from "@/components/ui/skill-box";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

const Role = [
  { value: "client", label: "Client" },
  { value: "freelancer", label: "Freelancer" },
];

interface ProfileInfo {
  role: string;
  fullName: string;
  bio: string;
  skills: string[];
  location: string;
  username: string;
  avtarUrl?: string;
}

const ProfilePage = () => {
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({
    role: '',
    fullName: '',
    bio: '',
    skills: [],
    location: '',
    username: '',
    avtarUrl: ''
  });
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/user/profile');
        if (response.status === 200) {
          const data = response.data;
          setProfileInfo(prev => ({
            ...prev,
            role: data.role ?? '',
            fullName: data.full_name ?? '',
            bio: data.bio ?? '',
            skills: Array.isArray(data.skills) ? data.skills : [],
            location: data.location ?? '',
            username: data.username ?? '',
            avtarUrl: data.avtarUrl ?? prev.avtarUrl,
          }));
        } else {
          toast.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Error fetching profile");
      }
    };

    const fetchSkills = async () => {
      try {
        const response = await axios.get('/api/user/skills');
        if (response.status === 200) {
          const rawSkills = response.data || [];
          const skillNames = rawSkills.map((s: { name: string }) => s.name);
          setAvailableSkills(skillNames);
        } else {
          toast.error("Failed to fetch skills");
        }
      } catch (error) {
        console.error("Error fetching skills data:", error);
        toast.error("Error fetching skills");
      }
    };

    fetchProfile();
    fetchSkills();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    setProfileInfo(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/user/profile', profileInfo);
      if (response.status === 200) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          toast.error("Username already exists. Please choose a different username.");
        } else {
          toast.error(`Error: ${error.response.data.error || "An error occurred"}`);
        }
      } else {
      toast.error("An error occurred while updating the profile.");
      }
    }
  };

  return (
    <div className={cn("dark text-white", inter.className)}>
      <Navbar />
      <div className="flex flex-col h-screen">
        <div className="flex flex-col rounded-lg px-4 py-4">
          <h1 className="text-2xl font-bold mb-4 text-white">Profile</h1>
          <Card className="rounded-lg">
            <CardContent className="dark">
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-3">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" value={profileInfo.username} onChange={handleChange} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" value={profileInfo.fullName} onChange={handleChange} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={profileInfo.role}
                    onValueChange={(value) =>
                      setProfileInfo(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger className="w-full" id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {Role.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" name="bio" value={profileInfo.bio} onChange={handleChange} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="skills">Skills</Label>
                  <div className="flex flex-col gap-2">
                    {profileInfo.skills.map((skill, index) => (
                      <SkillCombobox
                        key={index}
                        skills={availableSkills}
                        value={skill}
                        onChange={(newSkill) => {
                          const updated = [...profileInfo.skills];
                          updated[index] = newSkill;
                          setProfileInfo(prev => ({ ...prev, skills: updated }));
                        }}
                      />
                    ))}
                    <Button
                      variant="outline"
                      type="button"
                      className="text-blue-500 flex items-center gap-2"
                      onClick={handleAddSkill}
                    >
                      <PlusCircle /><span>Add Skill</span>
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" value={profileInfo.location} onChange={handleChange} />
                </div>
                <Button type="submit" className="w-full mt-4">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Role } from "../signup/components/signup-form";

const OnboardingPage = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/user/onboard', { role: selectedRole });

      if (response.status === 200) {
        toast.success("Role selected successfully");
        router.push('/profile');
      } else {
        toast.error(response.data?.error || "Failed to select role");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "An unexpected error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex dark text-white flex-col h-screen justify-center items-center">
      <Select onValueChange={setSelectedRole} value={selectedRole}>
        <SelectTrigger className="dark max-w-xl w-[300px]">
          <SelectValue placeholder="Select your role" />
        </SelectTrigger>
        <SelectContent className="dark">
          {Role.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Select Role"}
        </Button>
      </div>
    </main>
  );
};

export default OnboardingPage;

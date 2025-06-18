"use client"

import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { supabase } from "@/app/utils/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


const inter = Inter({ subsets: ["latin"] });

interface Project {
  id: string
  title: string
  description?: string
  created_at: string
  client_name?: string
  budget?: number
  category?: string
}

interface ProjectClientProps {
  id: string
}



export function ProjectClient({ id }: ProjectClientProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [freelancerId, setFreelancerId] = useState<string>("");
  const [isApplied, setIsApplied] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const router = useRouter();


    useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/projects/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }

        const projectData = await response.json()
        setProject(projectData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    const fetchUserDetails = async () => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error || !user) {
            toast.error("User not authenticated.");
            router.push("/login");
            return;
          }
          setFreelancerId(user.id);
          setRole(user.user_metadata.role);
        } catch (error) {
          if (error instanceof Error) {
            toast.error(`Failed to fetch user info: ${error.message}`);
          }
        }
  };

    fetchUserDetails();
    fetchProject();

    const checkIfApplied = async () => {
      if (!freelancerId) {
        return; // If freelancerId is not set, skip the check
      }
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("project_id", id)
          .eq("freelancer_id", freelancerId);

        if (error) {
          throw new Error(`Failed to check application status: ${error.message}`);
        }

        setIsApplied(data.length > 0);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to check application status: ${error.message}`);
        }
      }
    };

    checkIfApplied();
  }, [id, freelancerId, router]);


  const handleApplyProject = async () => {
    if (isApplied) {
      toast.error("You have already applied for this project.");
      return;
    }
    try {
      if (!coverLetter.trim()) {
        toast.error("Please enter a cover letter.");
        return;
      }
      const response = await axios.post(`/api/projects/${id}`, {
        proposal: coverLetter,
        freelancerId: freelancerId
      });
      if (response.status === 200) {
        toast.success("Application submitted successfully!");
        setCoverLetter(""); 
        router.push('/dashboard');
      } else {
        toast.error("Failed to submit application");
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`Failed to submit application: ${err.message}`);
      }
    }
  }

  const handleEditProject = () => {
    router.push(`/projects/${id}/edit`);
  }



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Project not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="text-white dark">
      <Navbar />
    <div className={cn("dark mx-auto px-4 py-8 ", inter.className)}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl text-white font-bold mb-4">{project.title}</h1>
        {project.description && <p className="text-gray-600 mb-6">{project.description} | {project.budget && <>Budget: ${project.budget}/Hour</>}</p>}
        <div className="border 2border-gray-300 rounded-lg px-4 py-2">
          <span className="">{project.category}</span>
        </div>
        <div className="bg-black text-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Project Details</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-gray-500">Created</dt>
              <dd className="mt-1">{new Date(project.created_at).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Client Name</dt>
              <dd className="mt-1">{project.client_name}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
    {role === "freelancer" && (
    <div className="dark flex justify-center mt-8">
    <Drawer >
      <DrawerTrigger className="dark border border-gray-300 rounded-lg px-6 flex items-center py-2 bg-white text-black" disabled={isApplied}>{isApplied ? "Applied" : "Apply"}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Apply for Project</DrawerTitle>
          <DrawerDescription>Please fill out the form below to apply for this project.</DrawerDescription>
        </DrawerHeader>
        <form className="space-y-4 p-4">
          <Label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">Cover Letter</Label>
          <Textarea id="coverLetter" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
        </form>
          <DrawerFooter>
            <Button variant="default" onClick={handleApplyProject} className="w-full">Submit Application</Button>
            <DrawerClose>
              <Button variant="destructive" className="w-full mt-2">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
      </DrawerContent>
    </Drawer>
    </div>
    )}
    { role !== "freelancer" && (
      <div className="dark flex justify-center mt-8">
        <Button variant="default" onClick={handleEditProject} className="w-full">Edit Project</Button>
      </div>
    )}
    </div>
  )
}

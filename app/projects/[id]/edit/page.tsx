'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/ui/navbar";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types/project";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  params: {
    id: string;
  };
};

export default function ProjectEditPage({ params }: Props) {
  const { id } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/projects/${id}`);
        setProject(response.data);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setProject((prev) =>
      prev ? { ...prev, [name]: value } : prev
    );
  };

  const handleUpdateProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!project) return;

    const { id, ...projectData } = project;

    try {
      await axios.put('/api/projects/edit', {
        id,
        ...projectData,
      });
      toast.success("Project updated successfully!");
    } catch (error) {
      toast.error("Failed to update project");
    }
  };

  return (
    <section className="flex flex-col items-center min-h-screen p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Edit Project</h1>

      {loading ? (
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded" />
        </div>
      ) : (
        <form
          onSubmit={handleUpdateProject}
          className="space-y-4 w-full max-w-md"
        >
          <Label>Title</Label>
          <Input name="title" value={project?.title ?? ''} onChange={handleInputChange} />

          <Label>Description</Label>
          <Textarea name="description" value={project?.description ?? ''} onChange={handleInputChange} />

          <Label>Budget</Label>
          <Input type="number" name="budget" value={project?.budget ?? ''} onChange={handleInputChange} />

          <Label>Category</Label>
          <Input name="category" value={project?.category ?? ''} onChange={handleInputChange} />

          <Button type="submit" className="w-full">
            Update Project
          </Button>
        </form>
      )}
    </section>
  );
}

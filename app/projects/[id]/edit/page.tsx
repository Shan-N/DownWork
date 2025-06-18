'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/ui/navbar";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types/project";
import axios from "axios";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProjectEditPage = () => {
    const [id, setId] = useState<string | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const url = new URL(window.location.href);
        const projectId = url.pathname.split('/')[2];
        if (projectId) {
            setId(projectId);
            
        } else {
            console.error("Project ID not found in the URL");
        }

        const fetchProject = async () => {
            try {
                const response = await axios.get(`/api/projects/${projectId}`);
                if (response.status === 200) {
                    setProject(response.data);
                    setLoading(false);
                } else {
                    toast.error(`Error fetching project: ${response.statusText}`);
                }
            } catch (error) {
                if (error instanceof Error) {
                toast.error(`Error fetching project: ${error.message}`);
                }
            }
        }

        fetchProject();
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        if (project) {
            setProject({ ...project, [name]: value });
        }
    }

    const handleUpdateProject = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!project || !id) {
            toast.error("Project data is incomplete.");
            return;
        }
        try {
            const response = await axios.put('/api/projects/edit', {
                id: id,
                title: project.title,
                description: project.description,
                budget: project.budget,
                category: project.category
            });
            if (response.status === 200) {
                toast.success("Project updated successfully!");
                // Optionally redirect or update state
            } else {
                toast.error(`Error updating project: ${response.statusText}`);
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Error updating project: ${error.message}`);
            } else {
                toast.error("An unexpected error occurred while updating the project.");
            }
            
        }
    }


    return (
        <section className="flex flex-col items-center justify-center min-h-screen p-4 text-white dark">
            <Navbar />
            <h1 className="text-2xl font-bold mb-4">Edit Project</h1>
            {loading ? (
                <Suspense fallback={<div>Loading...</div>}>
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-full"></div>
                    </div>
                </Suspense>
            ) : (
                <form className="space-y-4 w-full max-w-md" onSubmit={handleUpdateProject}>
                    <div className="grid grid-cols-1 gap-4">
                    <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                    </Label>
                    <Input
                        id="title"
                        name="title"
                        type="text"
                        value={project?.title || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full"
                        required
                    />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={project?.description || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full h-32 p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <Label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                            Budget
                        </Label>
                        <Input
                            id="budget"
                            name="budget"
                            type="number"
                            value={project?.budget || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <Label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Category
                        </Label>
                        <Input
                            id="category"
                            name="category"
                            type="text"
                            value={project?.category || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-4 py-2"
                    >
                        Update Project
                    </Button>
                </form>
            )}
        </section>
    );
}

export default ProjectEditPage;
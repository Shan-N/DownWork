'use client';
import Navbar from "@/components/ui/navbar";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Project } from "../dashboard/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";




const ProjectPage = () => {

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
               const response = await axios.get('/api/projects');
                if (response.status === 200) {
                    setProjects(response.data);
                } else {
                    toast.error('Failed to fetch projects: ' + response.statusText);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    toast.error(`Error: ${error.response?.data?.message || error.message}`);
                }
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, [])

  
    return (
    <div className="flex dark flex-col min-h-screen text-white">
        <Navbar />
        <main className="flex-grow">
            {loading ? (
                <p className="text-center flex">Loading projects...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {projects.map((project) => 
                        <Card key={project.id} className="">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">
                                    {project.title}
                                </CardTitle>
                                <p className="text-sm text-gray-400">
                                    {project.description}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <span className="text-sm text-gray-500">
                                    {new Date(project.created_at).toLocaleDateString()}
                                </span>
                                <span>
                                    <span className="text-sm text-gray-500"> | </span>
                                    <span className="text-sm text-gray-500">{project.budget}/Hour</span>
                                </span>
                                <div className="mt-2">
                                    <Button className="w-full" variant="outline" onClick={() => window.location.href = `/projects/${project.id}`}>
                                        View Project
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </main>
    </div>
  );
};

export default ProjectPage;
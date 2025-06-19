'use client';
import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/navbar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"]
})

interface Contract {
    id: string;
    proposal_id: string;
    client_id: string;
    freelancer_id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    
}

interface Application {
    id: string;
    project_id: string;
    title: string;
    freelancer_id: string;
    proposal: string;
    expected_budget: number;
    status: string;
    created_at: string;

}

export interface Project {
    id : string;
    client_id: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    status: string;
    created_at: string;
}

const DashboardPage = () => {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [time, setTime] = useState<string | null>(null);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.error("Error fetching user:", error);
                return;
            }
            if (!data.user) {
                router.push('/login'); 
                return;
            }
            const userId = data.user.id;
            const { data : userData } = await supabase.from('profiles').select('role').eq('id', userId).single();
            if (userData) { 
                setRole(userData.role);
            } 
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const user = session.user;
                setName(user.user_metadata?.full_name || null);
            } else {
                router.push('/login'); 
            }
        };
        const fetchTime = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                setTime("Good morning");
            } else if (hour >= 12 && hour < 18) {
                setTime("Good afternoon");
            } else {
                setTime("Good evening");
            }
        }

        const fetchContracts = async () => {
            const response = await axios.get('/api/contracts');
            if (response.status === 200) {
                setContracts(response.data);

            } else {
                toast.error("Failed to fetch contracts");

            }
        }

        const fetchApplications = async () => {
            try {
                const response = await axios.get('/api/applications');
                if (response.status !== 200) {
                    toast.error("Failed to fetch applications");
                    return;
                }

                const apps: Application[] = response.data;

                const updatedApplications = await Promise.all(apps.map(async (application) => {
                    if (!application.project_id) {
                        toast.error("Application has no project associated");
                        return { ...application, title: "Untitled Project" };
                    }

                    try {
                        const { data: projectData, error } = await supabase
                            .from('projects')
                            .select('title')
                            .eq('id', application.project_id)
                            .single();

                        if (error || !projectData) {
                            toast.error(`Error fetching project title for application ${application.id}`);
                            return { ...application, title: "Untitled Project" };
                        }

                        return { ...application, title: projectData.title || "Untitled Project" };
                    } catch (err) {
                        toast.error(`Unexpected ${err} for project ${application.project_id}`);
                        return { ...application, title: "Untitled Project" };
                    }
                }));

                setApplications(updatedApplications);
            } catch (err) {
                toast.error("An error occurred while fetching applications");
                console.error(err);
            }
        };

        const fetchAvailableProjects = async () => {
            const response = await axios.get('/api/projects');
            if (response.status === 200) {
                const parsedRes = response.data.slice(0, 5); // Limit to 5 projects
                setAvailableProjects(parsedRes);

            } else {
                toast.error("Failed to fetch available projects");
            }
        }

        fetchUserRole();
        fetchTime();
        fetchContracts();
        fetchApplications();
        fetchAvailableProjects();
    }, [router]);

    const handleViewApplication = (applicationId: string) => {
        router.push(`/applications/${applicationId}`);
    };
    const handleViewContract = (contractId: string) => {
        router.push(`/contracts/${contractId}`);
    };

    const handleViewProject = (projectId: string) => {
        router.push(`/projects/${projectId}/edit`);
    };

    if (role === 'client') {
    return (
        <div className={cn("dark text-white", inter.className)}>
            <Navbar />
            <div className="flex flex-col px-4 py-4 min-h-screen">
                <h2 className="text-xl font-semibold" >{time}, {name}</h2>
                <span className="font-light text-sm text-gray-400">Find everything you need</span>

                    <div className="grid grid-cols-1 gap-4 py-4">
                        <div className="flex flex-col border border-gray-700 rounded-lg p-4 hover:border-white hover:border-2 transition-colors">
                            <span className="text-lg font-semibold">Profile</span>
                            <span className="text-sm text-gray-400">Manage your profile and settings</span>
                            <div className="flex flex-col mt-2 gap-1">
                            <span className="text-sm">You are a {role[0].toLocaleUpperCase() === 'F' ? "Freelancer" : "Client" }</span>
                            <Button variant="outline" className="mt-2" onClick={() => router.push('/profile')}>Edit Profile</Button>
                            </div>
                        </div>
                        <div className="flex flex-col border border-gray-700 rounded-lg p-4 hover:border-white hover:border-2 transition-colors">
                            <span className="text-lg font-semibold">Projects</span>
                            <span className="text-sm text-gray-400">View and Manage your projects</span>
                            <Tabs defaultValue="contracts" className="dark w-full pt-4">
                                <TabsList>
                                    <TabsTrigger value="contracts">Contracts</TabsTrigger>
                                    <TabsTrigger value="applications">Applications</TabsTrigger>
                                    <TabsTrigger value="projects">Projects</TabsTrigger>
                                </TabsList>
                                <TabsContent value="contracts">
                                    <Card className="dark w-full rounded-xl">
                                        <CardHeader>
                                            <CardTitle>Contracts</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {contracts && contracts.length > 0 ? (
                                                <ul>
                                                    {contracts.map((contract, idx) => (
                                                        <li key={contract.id || idx} className="flex flex-row justify-between mt-2 gap-2">
                                                            {contract.title || "Untitled Contract"}
                                                            <Button variant="outline" onClick={() => handleViewContract(contract.id)}>Manage</Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400">No active contracts.</span>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="applications">
                                    <Card className="dark w-full rounded-xl">
                                        <CardHeader>
                                            <CardTitle>Applications</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {applications && applications.length > 0 ? (
                                                <ul>
                                                    {applications.map((application, idx) => (
                                                        <li key={application.id || idx} className="flex flex-row justify-between mt-2 gap-2">
                                                            {application.title || "Untitled Contract"}
                                                            <Button variant="outline" onClick={() => handleViewApplication(application.id)}>View</Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400">You&#39;ve not recieved any applicants yet!</span>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="projects">
                                    <Card className="dark w-full rounded-xl">
                                        <CardHeader>
                                            <CardTitle>Created Projects</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {availableProjects && availableProjects.length > 0 ? (
                                                <ul>
                                                    {availableProjects.map((project, idx) => (
                                                        <li key={project.id || idx} className="flex flex-row justify-between mt-2 gap-2">
                                                            {project.title || "Untitled Project"}
                                                            <Button variant="outline" onClick={() => handleViewProject(project.id)}>Edit</Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <>
                                                <span className="text-gray-400">No projects created at the moment.</span>
                                                <Button variant="outline" className=" flex flex-row items-center justify-center mt-2" onClick={() => router.push('/projects/create')}><PlusCircle /> Create Projects</Button>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                            <div>

                            </div>
                        </div>
                        <div>Settings</div>
                    </div>

            </div>

        </div>
    )
    }
    else if (role === 'freelancer') {
        return (
            <div className={cn("dark text-white", inter.className)}>
                <Navbar />
                <div className="flex flex-col px-4 py-4 min-h-screen">
                    <h2 className="text-xl font-semibold" >{time}, {name}!</h2>
                    <span className="font-light text-sm text-gray-400">Find everything you need</span>

                    <div className="grid grid-cols-1 gap-4 py-4">
                        <div className="flex flex-col border border-gray-700 rounded-lg p-4 hover:border-white hover:border-2 transition-colors">
                            <span className="text-lg font-semibold">Profile</span>
                            <span className="text-sm text-gray-400">Manage your profile and settings</span>
                            <div className="flex flex-col mt-2 gap-1">
                            <span className="text-sm">You are a {role[0].toLocaleUpperCase() === 'F' ? "Freelancer" : "Client" }</span>
                            <Button variant="outline" className="mt-2" onClick={() => router.push('/profile')}>Edit Profile</Button>
                            </div>
                        </div>
                        <div className="flex flex-col border border-gray-700 rounded-lg p-4 hover:border-white hover:border-2 transition-colors">
                            <span className="text-lg font-semibold">Projects</span>
                            <span className="text-sm text-gray-400">View and Manage your projects</span>
                            <Tabs defaultValue="contracts" className="dark w-full pt-4">
                                <TabsList>
                                    <TabsTrigger value="contracts">Contracts</TabsTrigger>
                                    <TabsTrigger value="applications">Applications</TabsTrigger>
                                    <TabsTrigger value="projects">Projects</TabsTrigger>
                                </TabsList>
                                <TabsContent value="contracts">
                                    <Card className="dark w-full rounded-xl">
                                        <CardHeader>
                                            <CardTitle>Contracts</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {contracts && contracts.length > 0 ? (
                                                <ul>
                                                    {contracts.map((contract, idx) => (
                                                        <li key={contract.id || idx} className="flex flex-row justify-between mt-2 gap-2">
                                                            {contract.title || "Untitled Contract"}
                                                            <Button variant="outline" onClick={() => handleViewContract(contract.id)}>View</Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400">Nothing to show here.</span>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="applications">
                                    <Card className="dark w-full rounded-xl">
                                        <CardHeader>
                                            <CardTitle>Applications</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {applications && applications.length > 0 ? (
                                                <ul>
                                                    {applications.map((application, idx) => (
                                                        <li key={application.id || idx} className="flex flex-row justify-between mt-2 gap-2">
                                                            {application.title || "Untitled Contract"}
                                                            <Button variant="outline" onClick={() => handleViewApplication(application.id)}>View</Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400">You&#39;ve not applied yet!</span>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="projects">
                                    <Card className="dark w-full rounded-xl">
                                        <CardHeader>
                                            <CardTitle>Available Projects</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {availableProjects && availableProjects.length > 0 ? (
                                                <ul key={"available-projects-list"}>
                                                    {availableProjects.map((project, idx) => (
                                                        <li key={project.id || idx} className="flex flex-row justify-between mt-2 gap-2">
                                                            {project.title || "Untitled Project"}
                                                            <Button key={idx} variant="outline" onClick={() => router.push(`/projects/${project.id}`)}>View Project</Button>
                                                        </li>
                                                    ))}
                                                     <Button className="mt-2 w-full" onClick={() => router.push(`/projects`)}>View All</Button>
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400">No projects available at the moment.</span>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                            <div>

                            </div>
                        </div>
                        <div className="flex flex-col border border-gray-700 rounded-lg p-4 hover:border-white hover:border-2 transition-colors">
                            <span className="text-lg font-semibold">Settings</span>
                            <span className="text-sm text-gray-400">View and Manage your settings</span>
                            
                            <div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}

export default DashboardPage;

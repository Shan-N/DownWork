'use client';
import { supabase } from "@/app/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/ui/navbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


interface Application {
    id: string;
    project_id: string;
    project_title: string;
    freelancer_id: string;
    freelancer_name: string;
    proposal: string;
    expected_budget: number;
    status: string;
    created_at: string;

}

interface ApplicationClientProps {
    applicationId: string;
}

const ApplicationClient = ({ applicationId }: ApplicationClientProps) => {
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                setRole(data?.user?.user_metadata?.role || null);
            } catch (error) {
                if (error instanceof Error) {
                    toast.error("Error fetching user role: " + error.message);
                } else {
                    toast.error("An unexpected error occurred while fetching user role.");
                }
            }
        }
        const fetchApplication = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/applications/${applicationId}`);
                if (response.status === 200) {
                    setApplication(response.data);
                }
                setLoading(false);

            } catch (error) {
                setLoading(false);
                if (error instanceof Error) {
                    toast.error("Error fetching application: " + error.message);
                } else {
                    toast.error("An unexpected error occurred while fetching application.");
                }
            }
        }
        
        fetchRole();
        fetchApplication();
    }, [applicationId]);

    const handleDeleteApplication = async () => {
        try {
            const response = await axios.delete(`/api/applications/${applicationId}`);
            if (response.status === 200) {
                toast.success("Application deleted successfully.");
                router.push("/applications");
            }
            else {
                toast.error("Failed to delete application: " + response.statusText);
            }

        } catch (error) {
            if (error instanceof Error) {
                toast.error("Error deleting application: " + error.message);
            } else {
                toast.error("An unexpected error occurred while deleting application.");
            }
        }
    }

    if (loading) {
        return <div>
            <Navbar />
            <span className="">Loading...</span>
        </div>;
    }
    if (!application) {
        return <div>
            <Navbar />
            <span className="">Application not found</span>
        </div>;
    }
    return (
        <div className="dark text-white">
            <Navbar />
            <Card className="max-w-2xl mx-auto my-8 p-6 shadow-lg">
                <CardHeader className="text-2xl font-bold">
                    <CardTitle>{application.project_title}</CardTitle>
                    <span className="text-sm font-light text-gray-400">{application.status === "accepted" ? "Accepted" : "Pending"}</span>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Badge variant='secondary' className="dark px-4">
                           <Tooltip>
                            <TooltipTrigger className="cursor-pointer">
                                <span><Link href={`/profiles/${application.freelancer_id}`}>{application.freelancer_name}</Link></span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span>Visit Profile</span>
                            </TooltipContent>
                           </Tooltip>
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span>Applied on : {new Date(application.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span>{application.proposal}</span>
                    </div>
                    {
                        role === 'freelancer' ? (
                        <div className="flex justify-center items-center space-x-4">
                            <Button variant="destructive" onClick={handleDeleteApplication} className="m-0">Withdraw Application</Button>
                        </div>
                        ) : (
                        <div className="flex justify-center items-center space-x-4">
                            <Button variant="secondary" className="m-0">Accept</Button>
                            <Button variant="destructive" className="m-0">Reject</Button>
                        </div>
                        )
                    }
                </CardContent>
            </Card>
        </div>
    );


}

export default ApplicationClient;
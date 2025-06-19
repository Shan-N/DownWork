'use client';
import Navbar from "@/components/ui/navbar";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


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

interface ApplicationClientProps {
    applicationId: string;
}

const ApplicationClient = ({ applicationId }: ApplicationClientProps) => {
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
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
        fetchApplication();
    }, [applicationId]);

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
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Application Details</h1>
                <div className="shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">{application.title}</h2>
                    <p><strong>Proposal:</strong> {application.proposal}</p>
                    <p><strong>Expected Budget:</strong> ${application.expected_budget}</p>
                    <p><strong>Status:</strong> {application.status}</p>
                    <p><strong>Created At:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );


}

export default ApplicationClient;
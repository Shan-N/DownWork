'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/ui/navbar";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface Project {
    title: string;
    description: string;
    budget: number;
    category: string;
}

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})


const CreateProjectPage = () => {
    const [project, setProject] = useState<Project>({
        title: '',
        description: '',
        budget: 0,
        category: '',
    });
    const [currency, setCurrency] = useState<string>("USD");
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProject(prev => ({
            ...prev,
            [name]: name === 'budget' ? parseFloat(value) || 0 : value
        }));
    };


    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/projects/create', project, {
            headers: {
                'Content-Type': 'application/json'
            }
            })
            if (response.status === 201) {
                toast.success(`Project created successfully: ${response.data.title}`);
                router.push('/dashboard');
            } else {
                toast.error("Failed to create project");
            }
        } catch (error) {
            toast.error(`Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    return (
        <div className={cn("dark text-white",inter.className)}>
            <Navbar />
            <Card className="w-full  flex flex-col justify-start rounded-lg">
                <CardHeader className="text-center">
                    <CardTitle>Create New Project</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="projectName" className="font-semibold">
                                    Project Title
                                </Label>
                                <Input value={project.title} onChange={handleInputChange} name="title" id="projectName" placeholder="Enter project title" />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="projectDescription" className="font-semibold">
                                    Project Description
                                </Label>
                                <Textarea value={project.description} onChange={handleInputChange} name="description" id="projectDescription" placeholder="Enter project description" />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="projectBudget" className="font-semibold">
                                    Project Budget
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input value={project.budget} onChange={handleInputChange} name="budget" id="projectBudget" type="number" placeholder="Enter Your Budget /Hour" />
                                    <Select value={currency} onValueChange={setCurrency} name="currency">
                                        <SelectTrigger>
                                            {currency}
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                            <SelectItem value="INR">INR</SelectItem>
                                            <SelectItem value="JPY">JPY</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="projectType" className="font-semibold">
                                    Category
                                </Label>
                                <Input value={project.category} onChange={handleInputChange} name="category" id="projectType" placeholder="Enter Project Category" />
                            </div>

                            <Button type="submit"  variant='outline' className="w-full dark text-white">
                                Create Project 
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}


export default CreateProjectPage;
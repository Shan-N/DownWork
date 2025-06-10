'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FieldError, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2Icon } from "lucide-react";

const Role = [
  { value: "client", label: "Client" },
  { value: "freelancer", label: "Freelancer" },
];

const formSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(1, "Full name is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    role: z.enum(["client", "freelancer"], {
      required_error: "Please select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormData = z.infer<typeof formSchema>;

const SignupForm = ({ className }: React.ComponentProps<"div">) => {
  const {
    register,
    handleSubmit,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    const { email, username, password, role } = data;
    setLoading(true);
    const loadingToast = toast.loading("Creating your account...");

    try {
      const { data: signupData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username,
            role: role,
          },
        },
      });

      if (error) {
        toast.error(`Signup failed: ${error.message}`, { id: loadingToast });
        return;
      }

      const userId = signupData.user?.id;
      if (!userId) {
        toast.error("No user ID returned from Supabase", { id: loadingToast });
        return;
      }

      const { error: userInsertError } = await supabase.from("users").insert({
        id: userId,
        role: role,
        full_name: username,
      });

      const { error: profileInsertError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: username,
        role: role,
      })

      if (userInsertError || profileInsertError) {
        const errorMessage = userInsertError?.message || profileInsertError?.message || "Unknown error";
        toast.error(`Insert failed: ${errorMessage}`, { id: loadingToast });
        return;
      }

      toast.success("Account created successfully!", { id: loadingToast });
      router.push("/login");
    } catch (err : unknown) {
      if (err instanceof Error) {
        toast.error(`Unexpected error`, { id: loadingToast });
        console.error("Signup Error:", err.message);
      } else {
        toast.error("An unknown error occurred", { id: loadingToast });
      }
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors: Partial<Record<keyof FormData, FieldError>>) => {
  Object.values(errors).forEach((error) => {
    if (error?.message) {
      toast.error(error.message);
    }
  });
};



  return (
    <div className={cn("flex flex-col gap-6 w-full", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Join ↓ Work Today</CardTitle>
          <CardDescription className="font-light">
            Create an account to start collaborating with your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register("email")}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="username">Full Name</Label>
              <Input
                id="username"
                type="text"
                placeholder="John Doe"
                {...register("username")}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register("password")}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(val) =>
                  setValue("role", val as "client" | "freelancer")
                }
                required
              >
                <SelectTrigger className="w-full" id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {Role.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2Icon className="animate-spin" /> Signing up...
                    </div>
                    ) : (
                    "Sign Up"
                )}
            </Button>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;

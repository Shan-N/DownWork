"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Loader2Icon } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/app/utils/supabase/client";


const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();

useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        toast.success("You are already logged in");
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          action: "login",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Login failed");
        return;
      }

      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Unexpected error occurred");
      console.error("Login Error:", error);
    }
  };

  const loginWithOAuth = async (provider: "google" | "github") => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ action: `login-with-${provider}` }),
      });

        const result = await res.json();

        if (!res.ok) {
          toast.error(result.error || `Login with ${provider} failed`);
          return;
        }

        if (result.url) {
          window.location.href = result.url;
        }
      } catch (err) {
        toast.error("OAuth login error");
        console.error("OAuth Login Error:", err);
      }
    };


  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Login to your account</CardTitle>
          <CardDescription className="font-light">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/forgot"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 
                <>
                <Loader2Icon className="animate-spin h-4 w-4 mr-2" /> Logging in...</> :
                "Login"  
              }
              </Button>

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => loginWithOAuth("github")}
                >
                  <Github className="mr-2 h-4 w-4" /> Continue with GitHub
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  onClick={() => loginWithOAuth("google")}
                >
                  Continue with Google
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

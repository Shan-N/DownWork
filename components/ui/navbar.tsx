import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { MoveDown } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { supabase } from "@/app/utils/supabase/client";
import Link from "next/link";
import axios from "axios";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { Button } from "./button";
import { UserMetadata } from "@supabase/supabase-js";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"]
})


const Navbar = () => {

    const options = [
        {value: "dashboard", label: "Dashboard", onclick: () => {router.push("/dashboard")}},
        {value: "profile", label: "Profile", onclick: () => {router.push("/profile")}},
        {value: "settings", label: "Settings", onclick: () => {router.push("/settings")}},
        {value: "logout", label: "Logout", onclick: () => {handleSignout()}}
    ]


    const router = useRouter();
    const [user, setUser] = React.useState<UserMetadata | null>(null);

      React.useEffect(() => {
        const fetchUser = async () => {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error("Error fetching user:", error);
          } else {
            setUser(data?.session?.user.user_metadata || null);
          }
        }
        fetchUser();
      }, [])

      const handleSignout = async () => {
        try {
            await axios.post('/api/auth/signout')
            router.push('/'); // Redirect to home page after sign out

        }
        catch (error) {
            console.error("Sign out error:", error);
        }
    }

      if (user){
          return (
              <div className="sticky z-10 w-full bg-black/50 backdrop-blur-md">
                  <nav className={cn("flex flex-col py-6 border-b-1 border-white",inter.className)}>
                      <div className="flex flex-row justify-between px-8">
                          <span className="flex flex-row font-bold text-xl items-center tracking-wider"><Link href='/' className="flex flex-row items-center"><MoveDown className="size-5"/>Work</Link></span>
                          <div className="flex flex-row items-center">
                              {/* <span className="border border-white px-4 py-2 text-white rounded-lg cursor-pointer select-none" onClick={() => {
                                  router.push("/dashboard");
                              }}>{user.full_name}</span> */}
                              <DropdownMenu >
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">{user.full_name}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="dark">
                                    {options.map((option)=> (
                                        <DropdownMenuItem key={option.value} onClick={option.onclick} className="cursor-pointer">
                                            {option.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                          </div>
                      </div>
                  </nav>
              </div>
          )
      }
      else {
        return (
              <div className="sticky z-10 w-full bg-black/50 backdrop-blur-md">
                  <nav className={cn("flex flex-col py-6 border-b-1 border-white",inter.className)}>
                      <div className="flex flex-row justify-between px-8">
                          <span className="flex flex-row font-bold text-xl items-center tracking-wider"><MoveDown className="size-5"/>Work</span>
                          <div className="flex flex-row items-center">
                              <>
                              <span className="border border-white px-4 py-2 bg-gray-200 text-black rounded-lg cursor-pointer select-none" onClick={() => {
                                  router.push("/login");
                              }}>Login</span>
                              <span className="border hidden md:flex border-white px-4 py-2 bg-gray-200 text-black rounded-lg ml-2 cursor-pointer select-none" onClick={() => {
                                  router.push("/signup");
                              }}>Sign up</span>
                              </>
                          </div>
                      </div>
                  </nav>
              </div>
          )
      }
}

export default Navbar;
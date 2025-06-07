import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { MoveDown } from "lucide-react";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"]
})

const Navbar = () => {
    return (
        <div className="sticky z-10 w-full">
            <nav className={cn("flex flex-col py-6 border-b-1 border-white",inter.className)}>
                <div className="flex flex-row justify-between px-8 ">
                    <span className="flex flex-row font-bold text-xl items-center tracking-wider"><MoveDown className="size-5"/>Work</span>
                    <div className="flex flex-row items-center">
                    <span className="border border-white px-4 py-2 bg-gray-200 text-black rounded-lg">Login</span>
                    <span className="border hidden md:flex border-white px-4 py-2 bg-gray-200 text-black rounded-lg ml-2">Sign Up</span>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Navbar;
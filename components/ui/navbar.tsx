import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { MoveDown } from "lucide-react";
import { useRouter } from "next/navigation";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"]
})

const Navbar = () => {
    const router = useRouter();
    return (
        <div className="sticky z-10 w-full bg-black/50 backdrop-blur-md">
            <nav className={cn("flex flex-col py-6 border-b-1 border-white",inter.className)}>
                <div className="flex flex-row justify-between px-8 ">
                    <span className="flex flex-row font-bold text-xl items-center tracking-wider"><MoveDown className="size-5"/>Work</span>
                    <div className="flex flex-row items-center">
                    <span className="border border-white px-4 py-2 bg-gray-200 text-black rounded-lg cursor-pointer select-none" onClick={()=>{
                        router.push("/login");
                    }}>Login</span>
                    <span className="border hidden md:flex border-white px-4 py-2 bg-gray-200 text-black rounded-lg ml-2 cursor-pointer select-none" onClick={() => {
                        router.push("/signup");
                    }}>Sign up</span>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Navbar;
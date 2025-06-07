import { cn } from "@/lib/utils";
import React from "react";
import { Inter } from "next/font/google";
import { MoveDown } from "lucide-react";
import Navbar from "./ui/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export function GridBackground() {
  return (
    <div className="relative flex flex-col h-screen w-full bg-white dark:bg-black">
      <div
        className={cn(
          "absolute inset-0 opacity-50",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      <Navbar />
      <div className={cn("z-10",inter.className)}>
        <main className="flex flex-col items-center justify-center h-full text-center pt-24">
            <span className="flex flex-row items-center font-bold text-4xl md:text-7xl select-none tracking-wider text-white px-4">
                YOUR NEXT HIRING PARTNER
            </span>
            <span className="text-gray-400 md:text-xl mt-8 px-4 max-w-3xl">
                Transform your hiring process, create a standout candidate experience and manage your team with our simple and easy-to-use products.
            </span>
        </main>
      </div>
    </div>
  );
}

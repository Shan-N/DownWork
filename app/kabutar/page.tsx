'use client';

import Image from "next/image";




const KabutarPage = () => {
    return (
        <div className="dark text-white">
            <div className="flex flex-col px-4 py-4 min-h-screen">
                <h2 className="text-xl font-semibold">Kabutar Page</h2>
                <span className="font-light text-sm text-gray-400">This is the Kabutar page.</span>
                <div className="grid grid-cols-1 gap-4 py-4">
                    <Image src="/kabutar.png" alt="Kabutar" loading="lazy" className="mx-auto" />
                </div>
            </div>
        </div>
    );
}

export default KabutarPage;
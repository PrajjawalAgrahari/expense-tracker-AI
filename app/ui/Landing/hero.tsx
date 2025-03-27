import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
    return (
        <section className="flex flex-col justify-center items-center px-[150px] py-[50px] gap-5">
            <h1 className="text-[78px] font-[800] text-center text-[#2563EB] leading-24">Manage Your Finances with Intelligence</h1>
            <p className="max-w-[650px] text-center text-[1.2rem] mb-6 text-gray-600 font-[500]">An AI-powered financial management platform that helps you track, analyze, and optimize your spending with real-time insights.</p>
            <Link href='/dashboard'><Button className="h-11 w-30 font-semibold text-[0.95rem] cursor-pointer">Get Started</Button></Link>
        </section>
    )
}
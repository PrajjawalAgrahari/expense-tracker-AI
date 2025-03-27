import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Concluding() {
    return (
        <section className="flex flex-col items-center gap-2 py-15 bg-[#2563EB]">
            <h1 className="text-[31px] text-white font-bold">Ready to Take Control of Your Finances?</h1>
            <p className="text-white">Join thousands of users who are already managing their finances smarter with Welth</p>
            <Link href='/dashboard'><Button variant='outline' className="text-blue-600 font-[600] mt-6 hover:text-blue-500 cursor-pointer">Start Free Trial</Button></Link>
        </section>
    )
}
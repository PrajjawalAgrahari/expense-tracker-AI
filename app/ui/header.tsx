import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/expensify-seeklogo.png";
import { PenBox, LayoutDashboard } from "lucide-react";

export default function Header() {
    return (
        <header className="flex items-center h-20 bg-white border-b border-gray-200">
            <nav className="flex justify-between w-full items-center px-6">
                <Link href="/">
                    <Image src={Logo} alt="expensify logo" className="h-12 w-40"></Image>
                </Link>
                <div className="flex gap-4 items-center">
                    <SignedOut>
                        <SignInButton forceRedirectUrl="/dashboard">
                            <Button variant={"outline"} className="cursor-pointer">
                                Login
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard">
                            <Button variant={"outline"}>
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Button>
                        </Link>
                        <Link href="/transaction/create">
                            <Button>
                                <PenBox size={18} />
                                <span>Add Transaction</span>
                            </Button>
                        </Link>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: 'w-15 h-15'
                                }
                            }}
                        />
                    </SignedIn>
                </div>
            </nav>
        </header>
    );
}

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export default function Header() {
    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16 fixed top-0">
            <SignedOut>
                <SignInButton />
                <SignUpButton /> 
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </header>
    )
}
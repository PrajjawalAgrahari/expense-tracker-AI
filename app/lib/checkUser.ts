import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@/generated/prisma";
import { prisma } from "@/app/lib/prisma";

export async function checkUser() {
    const user = await currentUser();
    if (!user) {
        return null;
    }
    // console.log(user);
    try {
        const loggedInUser = await prisma.user.findUnique({
            where: {
                clerkUserId: user.id,
            },
        })
        if (loggedInUser) {
            return loggedInUser;
        }
        const name = `${user.firstName} ${user.lastName}`;
        const newUser = await prisma.user.create({
            data: {
                clerkUserId: user.id,
                email: user.emailAddresses[0].emailAddress,
                name,
                imageUrl: user.imageUrl,
            },
        })

        return newUser;
    } catch (error) {
        // error may not always have a message property, especially in TypeScript if error is not an instance of Error.
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("An unknown error occurred:", error);
        }
        // console.log(error)
    }
}

export async function getUserId(clerkUserId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: clerkUserId,
            },
            select: {
                id: true
            }
        });
        
        // if (!user) {
        //     return null;
        // }

        return user?.id;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error getting userId:', error.message);
        } else {
            console.error('Unknown error getting userId:', error);
        }
        return null;
    }
}

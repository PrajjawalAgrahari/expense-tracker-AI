import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export default async function storeTokens(
    accessToken: string,
    refreshToken: string
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("User not authenticated");
        }

        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });
        if (!user) {
            throw new Error("User not found");
        }
        // Store tokens in the database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                accessToken,
                refreshToken,
            }
        });
    } catch (error) {
        console.error("Failed to store tokens:", error);
        throw new Error("Token storage failed");
    }
}
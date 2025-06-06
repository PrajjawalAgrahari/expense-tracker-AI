import { NextResponse } from "next/server";

// This would be in your environment variables in a real app
const BANK_AUTH_URL = "http://localhost:3001/auth/login";
const CLIENT_ID = "1234567890";
const REDIRECT_URI = "http://localhost:3000/api/bank/callback";

export async function GET() {
    try {
        // Generate a random state to prevent CSRF attacks
        const state = Math.random().toString(36).substring(7);

        // Construct the bank authorization URL with proper encoding
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            state: state, // to protect against
            response_type: "code"
        });

        const authUrl = `${BANK_AUTH_URL}?${params.toString()}`;
        console.log("Generated auth URL:", authUrl);

        // In a real app, you would store the state in a session or database
        // to verify it when the user returns

        return NextResponse.json({ url: authUrl });
    } catch (error) {
        console.error("Failed to initiate bank connection:", error);
        return NextResponse.json(
            { error: "Failed to initiate bank connection" },
            { status: 500 }
        );
    }
}
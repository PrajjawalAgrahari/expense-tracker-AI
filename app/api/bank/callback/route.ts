import insertaccountandtransactions from "@/app/lib/bank-integration";
import storeTokens from "@/app/lib/token";
import { NextResponse } from "next/server";

// This would be in your environment variables in a real app
const BANK_TOKEN_URL = "http://localhost:3001/auth/token";
const CLIENT_ID = "1234567890";
const CLIENT_SECRET = "your-client-secret";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        console.log("Received request for bank callback with search params:", searchParams.toString());
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
            console.error("No authorization code received");
            return NextResponse.redirect(new URL("/dashboard?bank_linked=error", request.url));
        }

        // In a real app, verify the state parameter matches what was stored
        // to prevent CSRF attacks

        // Exchange the authorization code for an access token
        const tokenResponse = await fetch(BANK_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                redirect_uri: "http://localhost:3000/api/bank/callback",
            }),
        });

        if (!tokenResponse.ok) {
            console.error("Failed to exchange code for token");
            return NextResponse.redirect(new URL("/dashboard?bank_linked=error", request.url));
        } const tokenData = await tokenResponse.json();
        const { access_token, refresh_token } = tokenData;
        await storeTokens(access_token, refresh_token);
        console.log("Received token data:", tokenData);

        // Pass the access token to the integration function
        await insertaccountandtransactions(access_token);

        // Redirect back to the dashboard with a success message
        return NextResponse.redirect(new URL("/dashboard?bank_linked=success", request.url));
    } catch (error) {
        console.error("Failed to handle bank callback:", error);
        return NextResponse.redirect(new URL("/dashboard?bank_linked=error", request.url));
    }
}
import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client";

export const dynamic = "force-dynamic"

export async function GET() {
    await inngest.send({
        name: "test/hello.world",
        data: {
            email: "test@example.com"
        }
    })

    return NextResponse.json({
        message: "Event sent!"
    })
}
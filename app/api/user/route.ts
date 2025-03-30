import { NextResponse } from 'next/server';
import { checkUser } from '@/app/lib/checkUser';

export async function GET() {
    const user = await checkUser();
    return NextResponse.json(user);
}
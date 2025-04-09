import { NextResponse } from 'next/server';
import { getAccountById, getDataForChart } from '@/app/lib/account';

export async function GET() {
    const data = await getDataForChart("07b1014f-8149-4b7a-b117-ffea41c87d71");
    return NextResponse.json(data);
}
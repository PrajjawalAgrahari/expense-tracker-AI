import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// cookies in a browser which are httpOnly cannot be accessed via JavaScript, so prevention against XSS attacks
// at the client side, one can make requests without including the cookies, and the server will still have access to them
// but at the server side, we can access cookies using the `cookies()` function from `next/headers` 

// Bank server configuration
const BANK_API_BASE_URL = "http://localhost:3001";
const BANK_TRANSACTIONS_URL = `${BANK_API_BASE_URL}/api/transactions`;

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        // Get the bank authentication cookies
        const accessToken = cookieStore.get("access_token")?.value;
        const refreshToken = cookieStore.get("refresh_token")?.value;

        console.log(accessToken, refreshToken);

        if (!accessToken) {
            return NextResponse.json(
                { error: "No bank authentication found. Please link your bank account first." },
                { status: 401 }
            );
        }

        // Build query parameters for the bank API
        const bankParams = new URLSearchParams();

        // Forward common query parameters
        // const limit = searchParams.get("limit");
        // const offset = searchParams.get("offset");
        // const startDate = searchParams.get("start_date");
        // const endDate = searchParams.get("end_date");
        // const accountId = searchParams.get("account_id");

        // if (limit) bankParams.set("limit", limit);
        // if (offset) bankParams.set("offset", offset);
        // if (startDate) bankParams.set("start_date", startDate);
        // if (endDate) bankParams.set("end_date", endDate);
        // if (accountId) bankParams.set("account_id", accountId);

        // Make request to bank server with authentication cookies
        const bankResponse = await fetch(`${BANK_TRANSACTIONS_URL}?${bankParams.toString()}`, {
            method: "GET",

            headers: {
                "Content-Type": "application/json",
                "Cookie": `access_token=${accessToken}; refresh_token=${refreshToken}`,
                "User-Agent": "ExpenseTracker/1.0"
            },
            credentials: "include"
        });

        // console.log("Bank API response status:", bankResponse.status);

        if (!bankResponse.ok) {
            // Handle specific error cases
            if (bankResponse.status === 401) {
                return NextResponse.json(
                    { error: "Bank authentication expired. Please re-link your bank account." },
                    { status: 401 }
                );
            } else if (bankResponse.status === 403) {
                return NextResponse.json(
                    { error: "Access denied by bank server." },
                    { status: 403 }
                );
            } else {
                console.error("Bank API error:", bankResponse.status, bankResponse.statusText);
                return NextResponse.json(
                    { error: "Failed to fetch transactions from bank server." },
                    { status: bankResponse.status }
                );
            }
        }

        const response = await bankResponse.json();
        const transactionsData = response.data.transactions;
        console.log("Successfully fetched transactions from bank:", transactionsData);

        // Transform the data if needed to match your app's format
        const transformedTransactions = transactionsData.transactions?.map((transaction: any) => ({
            id: transaction.id,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date,
            category: transaction.category || 'Uncategorized',
            type: transaction.type || (transaction.amount < 0 ? 'expense' : 'income'),
            accountId: transaction.accountId,
            bankTransactionId: transaction.id,
            balance: transaction.balance
        }));

        return NextResponse.json({
            success: true,
            transactions: transformedTransactions || transactionsData.transactions,
            totalCount: transactionsData.totalCount,
            hasMore: transactionsData.hasMore,
            pagination: transactionsData.pagination
        });

    } catch (error) {
        console.error("Error fetching bank transactions:", error);
        return NextResponse.json(
            { error: "Internal server error while fetching bank transactions." },
            { status: 500 }
        );
    }
}
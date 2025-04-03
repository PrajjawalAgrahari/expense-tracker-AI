'use client'

import { getAccountById } from "@/app/lib/account";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react"
import React from "react";

export default function AccountPage({params}: { params: Promise<{ id: string }>}) {
    const [account, setAccount] = useState<any>({});
    const {id} = React.use(params);
    
    useEffect(() => {
        async function fetchAccount() {
            const account = await getAccountById(id);
            setAccount(account);
        }
        fetchAccount();
    }
    , [])

    if(!account) {
        notFound()
    }

    return (
        <main>
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h1>{account.name}</h1>
                    <span>{account.type[0] + account.type.slice(1).toLowerCase()} Account</span>
                </div>
                <div className="flex flex-col">
                    <span>{account.balance}</span>
                    <span>{account._count.transactions} Transactions</span>
                </div>
            </div>
        </main>
    )
}
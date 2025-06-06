"use client";

import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";

async function handleLinkBank() {
  try {
    // Use absolute URL for the API endpoint
    const response = await fetch(`${window.location.origin}/api/bank/initiate`);
    const data = await response.json();

    if (data.url) {
      // Redirect to the bank's authentication page
      window.location.href = data.url;
    } else {
      throw new Error("Failed to get bank auth URL");
    }
  } catch (error) {
    console.error("Error initiating bank link:", error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to initiate bank connection. Please try again.",
    //     variant: "destructive",
    //   });
  }
}

export function LinkBankButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={handleLinkBank}
    >
      <LinkIcon className="h-4 w-4" />
      Link Bank
    </Button>
  );
}

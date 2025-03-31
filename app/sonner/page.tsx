"use client";

import { Toaster, toast } from "sonner";

export default function Page() {
  return (
    <>
      <Toaster />
      <button
        className="toast-button"
        onClick={() => {
          toast.error("This is a toast");
        }}
      >
        Render toast
      </button>
    </>
  );
}

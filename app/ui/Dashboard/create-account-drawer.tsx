"use client";

import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accountSchema } from "@/app/lib/formSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountData } from "@/app/lib/type";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { createAccount } from "@/app/lib/dashboard";
import { useEffect, useState } from "react";
import { postSubmission } from "@/app/lib/data-submission";
import { Loader2 } from "lucide-react";

export default function CreateAccountDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AccountData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    data: newAccount,
    loading: isAccountLoading,
    error,
    fn: submitAccount,
  } = postSubmission(createAccount);

  const onSubmit = async (data: AccountData) => {
    await submitAccount(data).then(() => {
      if (error !== "") {
        toast.error(error);
      } else {
        toast.success("Account created successfully");
      }
      setOpen(false);
      reset();
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Toaster />
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerPortal>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-[1rem]">
              Create New Account
            </DrawerTitle>
            {/* <DrawerDescription>This action cannot be undone.</DrawerDescription> */}
          </DrawerHeader>

          <div className="text-[0.875rem]">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 p-4"
            >
              <div className="flex flex-col gap-1">
                <label className="font-[500]" htmlFor="name">
                  Account Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Main Checking"
                  id="name"
                  {...register("name")}
                ></Input>
                {errors?.name && (
                  <p className="text-red-500">{errors.name?.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-[500]" htmlFor="type">
                  Account Type
                </label>
                <Select
                  onValueChange={(value: "CURRENT" | "SAVINGS") =>
                    setValue("type", value)
                  }
                  {...register("type")}
                  defaultValue="CURRENT"
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Current" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CURRENT">Current</SelectItem>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                  </SelectContent>
                </Select>
                {errors?.type && (
                  <p className="text-red-500">{errors.type?.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-[500]" htmlFor="balance">
                  Initial Balance
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step={0.01}
                  id="balance"
                  {...register("balance")}
                ></Input>
                {errors?.balance && (
                  <p className="text-red-500">{errors.balance?.message}</p>
                )}
              </div>

              <div className="flex justify-between items-center border-1 border-gray-300 py-4 px-3 rounded-md">
                <div className="flex flex-col gap-[1px]">
                  <label htmlFor="isDefault">
                    <span className="font-[500] text-[1rem] cursor-pointer">
                      Set as Default
                    </span>
                  </label>
                  <p className="text-sm text-muted-foreground">
                    This account will be selected by default for transactions
                  </p>
                </div>
                <Switch
                  id="isDefault"
                  onCheckedChange={(checked: Boolean) =>
                    setValue("isDefault", checked)
                  }
                ></Switch>
              </div>

              {errors?.isDefault && (
                <p className="text-red-500">{errors.isDefault?.message}</p>
              )}

              <div className="flex gap-6">
                <DrawerClose className="w-[50%]">
                  <Button className="w-full cursor-pointer" variant="outline">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  className="w-[50%] cursor-pointer"
                  type="submit"
                  disabled={isAccountLoading}
                >
                  {isAccountLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Creating...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}

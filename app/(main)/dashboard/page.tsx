import CreateAccountDrawer from "@/app/ui/Dashboard/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function Dashboard() {
    return (
        <CreateAccountDrawer>
            <Card className="py-12 px-24 hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Plus className="h-10 w-10" />
                    <span className="text-[14px] font-[500]">Add new Account</span>
                </CardContent>
            </Card>
        </CreateAccountDrawer>
    )
}
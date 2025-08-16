import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

type Props = {
    children: React.ReactNode
};

const DashboardLayout = ({ children }: Props) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                {children}
            </main>
        </SidebarProvider>
    )
}
export default DashboardLayout
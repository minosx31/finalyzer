import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RecurringProcessor } from "@/components/recurring-processor";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <RecurringProcessor />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
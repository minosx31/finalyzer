import { DataCharts } from "@/components/data-charts";
import { DataGrid } from "@/components/data-grid";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";

export default function DashboardPage() {
  return (
    <div className="max-w-screen-2xl mx-auto w-full p-2">
      <SidebarInset>
      <header className="flex items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-baseline gap-x-2">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                An overview of your financial status.
              </p>
            </div>
          </div>
        </header>
        <DataGrid />
        <DataCharts />
      </SidebarInset>
    </div>
  );
}

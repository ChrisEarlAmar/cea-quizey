import React, { type ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
// import { ChartAreaInteractive } from "@/components/chart-area-interactive"
// import { DataTable } from "@/components/data-table"
// import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAtom } from "jotai";
import { sidebarOpenAtom } from "@/store/sidebarAtom";


// import data from "./data.json"

interface LayoutProps {
  children?: ReactNode; 
}


const Layout: React.FC<LayoutProps> = ({ children }) => {  
  
  const [isSidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  // useEffect(() => {
  //   console.log(`Sidebar open: ${isSidebarOpen}`);

  // }, [isSidebarOpen]);

  return (
    <SidebarProvider
      // defaultOpen={false} 
      open={isSidebarOpen}
      onOpenChange={setSidebarOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main>
                  {children}
                </main>
            </div>
          </div>
        </div>
        <Toaster position="top-center" />
      </SidebarInset>
    </SidebarProvider>
  )
};


export default Layout;

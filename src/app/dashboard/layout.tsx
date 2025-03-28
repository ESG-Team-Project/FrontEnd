import DashboardSidebar from '@/components/dashboard-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row w-full h-full">
      <SidebarProvider className="h-full">
        <DashboardSidebar />
      </SidebarProvider>
      <section className="w-full">{children}</section>
    </div>
  );
}

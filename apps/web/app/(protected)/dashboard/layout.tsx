import { DashboardHeader } from "@/features/dashboard/components/header";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 w-full min-h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

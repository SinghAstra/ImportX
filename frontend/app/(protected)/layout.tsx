import { authOptions } from "@/lib/auth-options";
import { ROUTES } from "@/lib/routes";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AppSidebar } from "./components/app-sidebar";
import ProtectedNavbar from "./components/protected-navbar";

interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout = async ({ children }: ProtectedLayoutProps) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.AUTH.SIGN_IN);
  }

  return (
    <div className="flex h-dvh overflow-hidden w-full">
      <AppSidebar />
      <div className="flex flex-col w-full h-full overflow-hidden">
        <ProtectedNavbar user={session.user} />
        <div className="w-full h-full overflow-hidden p-2 pt-0 lg:pl-0">
          <div className="rounded bg-muted/40 w-full h-full overflow-hidden border">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedLayout;

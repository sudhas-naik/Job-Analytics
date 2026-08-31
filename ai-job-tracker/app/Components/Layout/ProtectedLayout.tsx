import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "./DashboardLayout";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/Auth/Login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

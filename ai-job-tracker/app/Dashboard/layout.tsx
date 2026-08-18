import DashboardLayout from "@/app/Components/Layout/DashboardLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
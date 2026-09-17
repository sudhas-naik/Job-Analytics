import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthShell from "@/app/Components/Auth/AuthShell";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user) {
    redirect("/Dashboard");
  }

  return <AuthShell>{children}</AuthShell>;
}

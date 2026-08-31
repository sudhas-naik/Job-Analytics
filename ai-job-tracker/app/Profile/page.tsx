import { auth } from "@/lib/auth";
import { isDatabaseUnavailable } from "@/lib/db-error";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id && !session?.user?.email) {
    redirect("/Auth/Login");
  }

  try {
    const user = await prisma.user.findFirst({
      where: session.user.id
        ? { id: session.user.id }
        : { email: session.user.email ?? "" },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true,
        _count: {
          select: {
            applications: true,
            interviews: true,
            resumes: true,
          },
        },
      },
    });

    if (!user) {
      redirect("/Auth/Login");
    }

    return (
      <ProfileForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt.toISOString(),
        }}
        stats={{
          applications: user._count.applications,
          interviews: user._count.interviews,
          resumes: user._count.resumes,
        }}
      />
    );
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-amber-950">
            Database is not running
          </h1>
          <p className="mt-2 text-sm text-amber-800">
            Start the local Prisma Postgres server, then reload this page:
          </p>
          <pre className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-800">
            npx prisma dev
          </pre>
        </div>
      );
    }

    throw error;
  }
}

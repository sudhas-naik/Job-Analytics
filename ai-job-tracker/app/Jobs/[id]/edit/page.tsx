import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import JobForm from "@/app/Components/Jobs/JobForm";
import BackButton from "@/app/Components/Layout/BackButton";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/Auth/Login");
  }

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <BackButton href={`/Jobs/${job.id}`} label="Back to job" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Edit job
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Update the details for {job.title} at {job.company}.
        </p>
      </div>

      <JobForm
        key={`edit-${job.id}`}
        cancelHref={`/Jobs/${job.id}`}
        job={{
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          jobType: job.jobType,
          salary: job.salary,
          experience: job.experience,
          jobUrl: job.jobUrl,
          source: job.source,
          description: job.description,
        }}
      />
    </div>
  );
}

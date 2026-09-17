export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="auth-orbs pointer-events-none absolute inset-0" />
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div className="hidden text-white lg:block">
          <div className="logo-pulse inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-sm font-bold">
            AJ
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            Land the next role with a clearer pipeline.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-indigo-100">
            Track jobs, applications, and interviews in one place. Stay ready
            for every follow-up.
          </p>
        </div>
        <div data-page>{children}</div>
      </div>
    </div>
  );
}

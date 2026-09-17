"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setMessage("Invalid email or password");
      return;
    }

    router.push("/Dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
        Welcome back
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        Login
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Continue tracking your job search.
      </p>

      <label className="mt-6 block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">
          Email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">
          Password
        </span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        />
      </label>

      {message ? <p className="mt-3 text-sm text-rose-600">{message}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Login"}
      </button>

      <p className="mt-4 text-center text-sm text-slate-500">
        Need an account?{" "}
        <Link href="/Auth/Register" className="font-medium text-indigo-600 hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}

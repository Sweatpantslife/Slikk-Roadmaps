import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser, safeNextPath } from "@/lib/auth";
import { SITE } from "@/lib/config";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h1 className="text-lg font-semibold text-stone-900">Create your account</h1>
        <p className="mt-1 text-sm text-stone-500">
          An account lets you post feedback, vote, comment, and get notified when ideas you follow move forward on
          the {SITE.name} roadmap.
        </p>
        <div className="mt-5">
          <AuthForm mode="register" next={next} />
        </div>
      </div>
    </div>
  );
}

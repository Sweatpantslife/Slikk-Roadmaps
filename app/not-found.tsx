import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">Page not found</h1>
      <p className="mt-2 text-[15px] text-stone-500">
        This post or page may have been moved or deleted.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
      >
        Back to the board
      </Link>
    </div>
  );
}

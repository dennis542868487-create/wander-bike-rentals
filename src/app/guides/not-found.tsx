import Link from "next/link";

export default function GuidesNotFound() {
  return (
    <main className="bg-white px-5 py-24 text-center sm:px-8">
      <p className="text-sm font-bold text-teal-700">Guide not found</p>
      <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold tracking-[-0.05em] text-slate-950 sm:text-5xl">
        This cycling guide is not published yet.
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">
        This release covers Richmond and the 21 Metro Vancouver destinations in
        the current guide master file.
      </p>
      <Link
        href="/guides"
        className="editorial-button editorial-button-primary mt-8"
      >
        Browse published guides
      </Link>
    </main>
  );
}

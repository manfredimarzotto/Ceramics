"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6 text-sm">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-clay-600 text-white rounded-md hover:bg-clay-700 transition-colors text-sm"
      >
        Try again
      </button>
    </div>
  );
}

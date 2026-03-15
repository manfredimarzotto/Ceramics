import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-clay-700 via-clay-800 to-kiln-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Handcrafted
            <br />
            <span className="text-clay-200">Ceramics</span>
          </h1>
          <p className="mt-6 text-lg text-clay-200 max-w-lg">
            Discover unique pottery pieces crafted by skilled artisans. From everyday tableware
            to decorative statement pieces, each item is made with care and intention.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="px-8 py-3 bg-white text-clay-800 font-semibold rounded-md hover:bg-clay-100 transition-colors"
            >
              Shop Collection
            </Link>
            <Link
              href="/products"
              className="px-8 py-3 border-2 border-clay-300 text-white font-semibold rounded-md hover:bg-clay-700 transition-colors"
            >
              Browse All
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full border-4 border-white" />
        <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full border-4 border-white" />
        <div className="absolute top-32 right-60 w-24 h-24 rounded-full border-4 border-white" />
      </div>
    </section>
  );
}

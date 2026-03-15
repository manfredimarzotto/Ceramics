import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-clay-800 text-clay-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Ceramics</h3>
            <p className="text-clay-300 text-sm">
              Handcrafted pottery and ceramics sourced from skilled artisans.
              Every piece tells a story.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-clay-300 hover:text-white transition-colors">Shop All</Link></li>
              <li><Link href="/cart" className="text-clay-300 hover:text-white transition-colors">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <p className="text-clay-300 text-sm">
              Questions about our ceramics?<br />
              Email: hello@ceramics.store
            </p>
          </div>
        </div>
        <div className="border-t border-clay-700 mt-8 pt-8 text-center text-clay-400 text-sm">
          &copy; {new Date().getFullYear()} Ceramics. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

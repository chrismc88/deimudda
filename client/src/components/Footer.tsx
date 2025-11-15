import { Link } from "wouter";

/**
 * Global Footer Component
 * Used on all main pages for consistent navigation and legal links
 */
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Rechtliches */}
          <div>
            <h3 className="text-white font-semibold mb-4">Rechtliches</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms">
                  <span className="hover:text-white cursor-pointer">Nutzungsbedingungen</span>
                </Link>
              </li>
              <li>
                <Link href="/datenschutz">
                  <span className="hover:text-white cursor-pointer">Datenschutz</span>
                </Link>
              </li>
              <li>
                <Link href="/impressum">
                  <span className="hover:text-white cursor-pointer">Impressum</span>
                </Link>
              </li>
              <li>
                <Link href="/widerruf">
                  <span className="hover:text-white cursor-pointer">Widerrufsbelehrung</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Über uns */}
          <div>
            <h3 className="text-white font-semibold mb-4">Über uns</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <span className="hover:text-white cursor-pointer">Über deimudda</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="hover:text-white cursor-pointer">Kontakt</span>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <span className="hover:text-white cursor-pointer">FAQ</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Verkäufer */}
          <div>
            <h3 className="text-white font-semibold mb-4">Verkäufer</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/seller-guidelines">
                  <span className="hover:text-white cursor-pointer">Verkäufer-Richtlinien</span>
                </Link>
              </li>
              <li>
                <Link href="/fee-structure">
                  <span className="hover:text-white cursor-pointer">Gebührenstruktur</span>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <span className="hover:text-white cursor-pointer">Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.instagram.com/kalidad420/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@deimudda.de"
                  className="hover:text-white"
                >
                  E-Mail
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 deimudda – Cannabis-Stecklingsbörse. Alle Rechte vorbehalten.</p>
          <p className="mt-2 text-gray-400">
            Nur für Personen ab 18 Jahren. Verkauf und Konsum von Cannabis gemäß geltender Gesetzgebung.
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Construction, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 p-6 rounded-full">
            <Construction className="w-16 h-16 text-orange-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Wartungsarbeiten
        </h1>
        
        <p className="text-xl text-gray-600 mb-6">
          Wir führen gerade wichtige Wartungsarbeiten durch, um deimudda für Sie zu verbessern.
        </p>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <p className="text-gray-700 leading-relaxed">
            Die Plattform ist vorübergehend nicht verfügbar. Wir arbeiten daran, 
            so schnell wie möglich wieder online zu sein.
          </p>
        </div>
        
        <div className="space-y-3 text-sm text-gray-500">
          <p>
            <strong>Geschätzte Dauer:</strong> Die Wartungsarbeiten sollten in Kürze abgeschlossen sein.
          </p>
          <p>
            Bei Fragen kontaktieren Sie uns unter:{" "}
            <a 
              href="mailto:support@deimudda.de" 
              className="text-green-600 hover:text-green-700 underline"
            >
              support@deimudda.de
            </a>
          </p>
        </div>
        
        {/* Admin login link */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/admin-login">
            <span className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
              <Shield className="h-4 w-4" />
              Administrator-Zugang
            </span>
          </Link>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            © 2025 deimudda – Cannabis-Stecklingsbörse
          </p>
        </div>
      </div>
    </div>
  );
}


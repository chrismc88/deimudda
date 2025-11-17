import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/declined cookies
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 shadow-2xl border-t-2 border-green-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">🍪 Cookie-Hinweis</h3>
            <p className="text-sm text-gray-300">
              Wir verwenden nur technisch notwendige Cookies, um die Funktionalität dieser Website zu gewährleisten. 
              Diese Cookies sind für den Betrieb der Seite erforderlich und können nicht deaktiviert werden. 
              Weitere Informationen finden Sie in unserer{" "}
              <a href="/datenschutz" className="text-green-400 hover:text-green-300 underline">
                Datenschutzerklärung
              </a>.
            </p>
          </div>
          
          <div className="flex gap-3 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={declineCookies}
              className="bg-transparent border-gray-500 text-white hover:bg-gray-800"
            >
              Ablehnen
            </Button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Akzeptieren
            </Button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-gray-400 hover:text-white ml-2"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


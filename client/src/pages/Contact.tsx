import BackButton from "@/components/BackButton";
import { Mail, Phone, MapPin, Instagram, MessageCircle } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" label="Zurück zur Startseite" />
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Kontakt</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-8">
              Hast du Fragen, Anregungen oder Feedback? Wir freuen uns auf deine Nachricht!
            </p>

            {/* Kontakt-Karten */}
            <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
              {/* deimudda / Vaperge */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="/vaperge-logo.png" 
                    alt="Vaperge Logo" 
                    className="h-12 w-auto"
                  />
                  <h2 className="text-xl font-bold text-gray-900">deimudda / Vaperge</h2>
                </div>
                
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Vaperge - Eau de Terpènes</p>
                      <p>Chris Rohleder</p>
                      <p>Lessingstraße 11</p>
                      <p>69254 Malsch</p>
                      <p>Deutschland</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <a href="mailto:info@deimudda.de" className="text-green-600 hover:underline font-semibold">
                      info@deimudda.de
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>[Telefonnummer einfügen]</span>
                  </div>
                </div>
              </div>

              {/* Kalidad */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="/kalidad-logo.png" 
                    alt="Kalidad Logo" 
                    className="h-12 w-auto bg-white p-2 rounded"
                  />
                  <h2 className="text-xl font-bold text-gray-900">Kalidad</h2>
                </div>
                
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Kalidad - Grow- & Headshop</p>
                      <p>Kahlbachring 16</p>
                      <p>69254 Malsch</p>
                      <p>Deutschland</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <a 
                      href="https://www.instagram.com/kalidad420/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-purple-600 hover:underline font-semibold"
                    >
                      @kalidad420
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Kontakt-Bereiche */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Wofür kannst du uns kontaktieren?</h2>
              
              <div className="grid md:grid-cols-2 gap-4 not-prose">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-blue-900">Allgemeine Fragen</h3>
                  </div>
                  <p className="text-sm text-blue-800">
                    Fragen zur Plattform, Registrierung, Nutzung oder Features
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    → <a href="mailto:info@deimudda.de" className="hover:underline">info@deimudda.de</a>
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-5 w-5 text-green-600" />
                    <h3 className="font-bold text-green-900">Technischer Support</h3>
                  </div>
                  <p className="text-sm text-green-800">
                    Probleme mit der Website, Bugs oder technische Fragen
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    → <a href="mailto:support@deimudda.de" className="hover:underline">support@deimudda.de</a>
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                    <h3 className="font-bold text-purple-900">Verkäufer-Support</h3>
                  </div>
                  <p className="text-sm text-purple-800">
                    Fragen zum Verkaufen, Listings, Gebühren oder Auszahlungen
                  </p>
                  <p className="text-sm text-purple-600 mt-2">
                    → <a href="mailto:seller@deimudda.de" className="hover:underline">seller@deimudda.de</a>
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-5 w-5 text-orange-600" />
                    <h3 className="font-bold text-orange-900">Datenschutz</h3>
                  </div>
                  <p className="text-sm text-orange-800">
                    Fragen zu deinen Daten, Löschung oder Auskunft
                  </p>
                  <p className="text-sm text-orange-600 mt-2">
                    → <a href="mailto:datenschutz@deimudda.de" className="hover:underline">datenschutz@deimudda.de</a>
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-5 w-5 text-red-600" />
                    <h3 className="font-bold text-red-900">Meldungen</h3>
                  </div>
                  <p className="text-sm text-red-800">
                    Rechtswidrige Inhalte, Verstöße gegen Nutzungsbedingungen
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    → <a href="mailto:report@deimudda.de" className="hover:underline">report@deimudda.de</a>
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-bold text-yellow-900">Presse & Kooperationen</h3>
                  </div>
                  <p className="text-sm text-yellow-800">
                    Presseanfragen, Partnerschaften oder Business-Anfragen
                  </p>
                  <p className="text-sm text-yellow-600 mt-2">
                    → <a href="mailto:business@deimudda.de" className="hover:underline">business@deimudda.de</a>
                  </p>
                </div>
              </div>
            </section>

            {/* Wichtiger Hinweis */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
              <h3 className="text-lg font-bold text-amber-900 mb-2">⚠️ Wichtiger Hinweis</h3>
              <p className="text-amber-800 text-sm">
                <strong>Bei Problemen mit einem Kauf oder Verkäufer:</strong> deimudda ist nur Vermittler. 
                Wende dich bitte zuerst direkt an den Verkäufer (Kontaktdaten auf der Produktseite). 
                Bei schwerwiegenden Problemen kannst du uns kontaktieren, und wir helfen bei der Vermittlung.
              </p>
            </div>

            {/* Öffnungszeiten / Antwortzeiten */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Antwortzeiten</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg not-prose">
                <p className="text-gray-700 mb-2">
                  Wir bemühen uns, alle Anfragen schnellstmöglich zu beantworten:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>Allgemeine Anfragen:</strong> Innerhalb von 24-48 Stunden</li>
                  <li><strong>Technischer Support:</strong> Innerhalb von 48 Stunden</li>
                  <li><strong>Dringende Meldungen:</strong> Innerhalb von 24 Stunden</li>
                </ul>
                <p className="text-sm text-gray-500 mt-3">
                  Bitte beachte: An Wochenenden und Feiertagen kann die Antwortzeit länger sein.
                </p>
              </div>
            </section>

            {/* FAQ-Hinweis */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Häufig gestellte Fragen</h2>
              
              <p className="text-gray-700 mb-4">
                Viele Fragen werden bereits in unseren <a href="/faq" className="text-green-600 hover:underline font-semibold">FAQ</a> beantwortet. 
                Schau dort gerne zuerst nach, bevor du uns kontaktierst!
              </p>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200 not-prose">
                <p className="text-green-800 text-sm">
                  💡 <strong>Tipp:</strong> Die meisten Fragen zu Registrierung, Verkaufen, Gebühren und 
                  rechtlichen Themen werden in den FAQ ausführlich erklärt.
                </p>
              </div>
            </section>

            {/* Social Media */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Folge uns</h2>
              
              <div className="flex items-center gap-4 not-prose">
                <a 
                  href="https://www.instagram.com/kalidad420/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
                >
                  <Instagram className="h-5 w-5" />
                  <span>@kalidad420</span>
                </a>
              </div>
              
              <p className="text-sm text-gray-600 mt-3">
                Bleib auf dem Laufenden über neue Stecklinge, Anbau-Tipps und Community-Events!
              </p>
            </section>

            {/* Besuch uns */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Besuch uns vor Ort</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg not-prose">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-gray-900">Kalidad - Grow- & Headshop</p>
                    <p className="text-gray-700">Kahlbachring 16, 69254 Malsch</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  Unser Partner Kalidad bietet vor Ort Beratung, Equipment und Fachwissen rund um den 
                  biologischen Cannabis-Anbau. Schau vorbei und lass dich beraten!
                </p>

                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Kahlbachring+16,+69254+Malsch" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm font-semibold"
                >
                  → Auf Google Maps öffnen
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


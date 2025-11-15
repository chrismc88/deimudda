import BackButton from "@/components/BackButton";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SellerGuidelines() {
  // Load dynamic fees from system settings
  const { data: platformFeeStr } = trpc.admin.getSystemSetting.useQuery('platform_fee_fixed', { staleTime: 300000 });
  const { data: paypalFeePercentageStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_percentage', { staleTime: 300000 });
  const { data: paypalFeeFixedStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_fixed', { staleTime: 300000 });
  
  const PLATFORM_FEE = parseFloat(platformFeeStr || "0.42");
  const PAYPAL_FEE_PERCENTAGE = parseFloat(paypalFeePercentageStr || "0.0249");
  const PAYPAL_FEE_FIXED = parseFloat(paypalFeeFixedStr || "0.49");
  const EXAMPLE_TOTAL_FEES_20 = (PLATFORM_FEE + 20 * PAYPAL_FEE_PERCENTAGE + PAYPAL_FEE_FIXED).toFixed(2);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" label="Zurück zur Startseite" />
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Verkäufer-Richtlinien</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-8">
              Als Verkäufer auf deimudda trägst du Verantwortung für deine Listings und die Abwicklung deiner Verkäufe. 
              Diese Richtlinien helfen dir, erfolgreich und rechtskonform zu verkaufen.
            </p>

            {/* Grundregeln */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Grundregeln für Verkäufer
              </h2>
              
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <h3 className="font-bold text-green-900 mb-2">✅ Erlaubt</h3>
                  <ul className="list-disc pl-6 space-y-1 text-green-800">
                    <li>Verkauf von <strong>Cannabis-Stecklingen</strong> (lebende Pflanzen)</li>
                    <li>Verkauf von <strong>Cannabis-Samen</strong></li>
                    <li>Verkauf von <strong>eigenem Vermehrungsmaterial</strong></li>
                    <li>Verkauf als <strong>Privatperson</strong> oder <strong>Gewerbetreibender</strong></li>
                    <li><strong>Preisvorschlag-Funktion</strong> nutzen</li>
                    <li><strong>Versand</strong> oder <strong>Abholung</strong> anbieten</li>
                  </ul>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <h3 className="font-bold text-red-900 mb-2">❌ Verboten</h3>
                  <ul className="list-disc pl-6 space-y-1 text-red-800">
                    <li>Verkauf von <strong>Cannabis-Blüten</strong> (Ernteprodukte)</li>
                    <li>Verkauf von <strong>Haschisch, Öl oder anderen Cannabisprodukten</strong></li>
                    <li>Verkauf an <strong>Minderjährige</strong> (unter 18 Jahren)</li>
                    <li><strong>Falsche oder irreführende Produktbeschreibungen</strong></li>
                    <li><strong>Gestohlene oder illegal erworbene Pflanzen</strong></li>
                    <li><strong>Kranke oder befallene Pflanzen</strong> ohne Hinweis</li>
                    <li><strong>Spam oder Werbung</strong> in Produktbeschreibungen</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Listing-Qualität */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">📸 Listing-Qualität</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Produktbilder</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Mindestens 1 Bild</strong> ist Pflicht</li>
                  <li>Bilder sollten <strong>klar und gut beleuchtet</strong> sein</li>
                  <li>Zeige die <strong>tatsächliche Pflanze</strong>, die verkauft wird</li>
                  <li>Keine <strong>Stock-Fotos</strong> oder fremde Bilder verwenden</li>
                  <li>Mehrere Bilder aus verschiedenen Winkeln sind empfohlen</li>
                </ul>

                <h3 className="text-xl font-semibold mt-4">Produktbeschreibung</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Strain-Name</strong> (Sorte) korrekt angeben</li>
                  <li><strong>Produkttyp</strong>: Steckling oder Samen</li>
                  <li><strong>Größe/Alter</strong> der Pflanze (bei Stecklingen)</li>
                  <li><strong>Gesundheitszustand</strong>: Sind die Pflanzen gesund?</li>
                  <li><strong>Besonderheiten</strong>: z.B. Terpenen-Profil, Wuchsform, etc.</li>
                  <li><strong>Versandbedingungen</strong>: Wie werden die Pflanzen verpackt?</li>
                </ul>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    <Info className="inline h-4 w-4 mr-1" />
                    <strong>Tipp:</strong> Je detaillierter deine Beschreibung, desto weniger Rückfragen und desto zufriedener die Käufer!
                  </p>
                </div>
              </div>
            </section>

            {/* Preisgestaltung */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">💰 Preisgestaltung</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Faire Preise</h3>
                <p className="text-gray-700">
                  Setze <strong>realistische Preise</strong>, die den Wert deiner Pflanzen widerspiegeln. 
                  Berücksichtige dabei:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Qualität und Gesundheit der Pflanzen</li>
                  <li>Seltenheit der Sorte</li>
                  <li>Größe/Alter der Stecklinge</li>
                  <li>Marktpreise für vergleichbare Angebote</li>
                </ul>

                <h3 className="text-xl font-semibold mt-4">Gebühren einkalkulieren</h3>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 mb-2">
                    <strong>Wichtig:</strong> Kalkuliere die Gebühren in deinen Preis ein!
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-yellow-800 text-sm">
                    <li><strong>Plattformgebühr:</strong> €{PLATFORM_FEE.toFixed(2).replace('.', ',')} pro Artikel</li>
                    <li><strong>PayPal-Gebühr (bei Online-Zahlung):</strong> ca. {(PAYPAL_FEE_PERCENTAGE * 100).toFixed(2)}% + €{PAYPAL_FEE_FIXED.toFixed(2).replace('.', ',')}</li>
                    <li><strong>Beispiel:</strong> Bei €20 Verkaufspreis → €{EXAMPLE_TOTAL_FEES_20.replace('.', ',')} Gebühren gesamt</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold mt-4">Preisvorschläge</h3>
                <p className="text-gray-700">
                  Du kannst die <strong>Preisvorschlag-Funktion</strong> aktivieren, um Verhandlungen zu ermöglichen. 
                  Das kann die Verkaufschancen erhöhen, besonders bei höherpreisigen Artikeln.
                </p>
              </div>
            </section>

            {/* Versand & Abholung */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">📦 Versand & Abholung</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Versand</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Sichere Verpackung:</strong> Pflanzen müssen sicher verpackt sein (Schutz vor Kälte, Hitze, Beschädigung)</li>
                  <li><strong>Schneller Versand:</strong> Stecklinge sollten innerhalb von 1-2 Tagen versandt werden</li>
                  <li><strong>Tracking:</strong> Nutze Versandmethoden mit Sendungsverfolgung (empfohlen)</li>
                  <li><strong>Versandkosten:</strong> Gib die Versandkosten klar an (oder biete kostenlosen Versand an)</li>
                </ul>

                <h3 className="text-xl font-semibold mt-4">Abholung</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Standort angeben:</strong> Gib deinen Standort im Verkäufer-Profil an</li>
                  <li><strong>Terminvereinbarung:</strong> Vereinbare einen konkreten Termin mit dem Käufer</li>
                  <li><strong>Barzahlung:</strong> Bei Abholung ist Barzahlung üblich</li>
                  <li><strong>Sicherheit:</strong> Treffe dich an einem öffentlichen Ort (z.B. Parkplatz)</li>
                </ul>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-amber-800 text-sm">
                    <AlertTriangle className="inline h-4 w-4 mr-1" />
                    <strong>Wichtig:</strong> Lebende Pflanzen sind empfindlich! Achte auf sorgfältige Verpackung und schnellen Versand.
                  </p>
                </div>
              </div>
            </section>

            {/* Kommunikation */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">💬 Kommunikation mit Käufern</h2>
              
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Schnelle Antworten:</strong> Antworte auf Anfragen innerhalb von 24 Stunden</li>
                <li><strong>Höflich und professionell:</strong> Auch bei schwierigen Käufern</li>
                <li><strong>Transparenz:</strong> Informiere über Versandstatus und Lieferzeiten</li>
                <li><strong>Probleme lösen:</strong> Bei Problemen (z.B. beschädigte Pflanzen) biete Lösungen an</li>
                <li><strong>Kontaktdaten bereitstellen:</strong> Stelle sicher, dass Käufer dich erreichen können</li>
              </ul>
            </section>

            {/* Rechtliche Pflichten */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">⚖️ Rechtliche Pflichten</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Für alle Verkäufer</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Widerrufsrecht:</strong> Du bist verantwortlich für die Abwicklung von Widerrufen (nicht deimudda)</li>
                  <li><strong>Gewährleistung:</strong> Du haftest für Mängel an deinen Produkten (§ 437 BGB)</li>
                  <li><strong>Keine Blüten verkaufen:</strong> Nur Stecklinge und Samen sind erlaubt</li>
                  <li><strong>Keine Verkäufe an Minderjährige:</strong> Nur an Personen ab 18 Jahren</li>
                </ul>

                <h3 className="text-xl font-semibold mt-4">Für gewerbliche Verkäufer</h3>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-800 mb-2">
                    <strong>Zusätzliche Pflichten:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-red-800 text-sm">
                    <li><strong>Impressumspflicht:</strong> Du musst ein eigenes Impressum bereitstellen (§ 5 TMG)</li>
                    <li><strong>Datenschutzerklärung:</strong> Du musst eine eigene Datenschutzerklärung bereitstellen (DSGVO)</li>
                    <li><strong>Widerrufsbelehrung:</strong> Du musst eine Widerrufsbelehrung bereitstellen</li>
                    <li><strong>Gewerbeanmeldung:</strong> Du musst ein Gewerbe angemeldet haben</li>
                    <li><strong>Steuerpflicht:</strong> Du musst Einnahmen versteuern</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-600 mt-3">
                  <strong>Wann bin ich gewerblich?</strong> Wenn du regelmäßig und mit Gewinnabsicht verkaufst. 
                  Bei Unsicherheit konsultiere einen Steuerberater oder Rechtsanwalt.
                </p>
              </div>
            </section>

            {/* Bewertungen */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">⭐ Bewertungen</h2>
              
              <p className="text-gray-700 mb-4">
                Bewertungen sind das Herzstück deines Erfolgs auf deimudda. Gute Bewertungen führen zu mehr Verkäufen!
              </p>

              <h3 className="text-xl font-semibold mb-2">Wie bekomme ich gute Bewertungen?</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Qualität:</strong> Verkaufe nur gesunde, hochwertige Pflanzen</li>
                <li><strong>Ehrlichkeit:</strong> Beschreibe deine Produkte wahrheitsgemäß</li>
                <li><strong>Schnelligkeit:</strong> Versende schnell und kommuniziere proaktiv</li>
                <li><strong>Service:</strong> Sei hilfsbereit und lösungsorientiert bei Problemen</li>
                <li><strong>Verpackung:</strong> Verpacke sorgfältig, damit die Pflanzen heil ankommen</li>
              </ul>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                <p className="text-green-800 text-sm">
                  <CheckCircle className="inline h-4 w-4 mr-1" />
                  <strong>Tipp:</strong> Bitte zufriedene Käufer um eine Bewertung! Das erhöht deine Sichtbarkeit.
                </p>
              </div>
            </section>

            {/* Verstöße */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-600" />
                Verstöße und Konsequenzen
              </h2>
              
              <p className="text-gray-700 mb-4">
                Verstöße gegen diese Richtlinien oder unsere Nutzungsbedingungen können zu folgenden Maßnahmen führen:
              </p>

              <div className="space-y-3">
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="font-semibold text-yellow-900">⚠️ Verwarnung</p>
                  <p className="text-sm text-yellow-800">Bei leichten Verstößen (z.B. unvollständige Produktbeschreibung)</p>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <p className="font-semibold text-orange-900">🚫 Listing-Löschung</p>
                  <p className="text-sm text-orange-800">Bei Verstößen gegen Listing-Richtlinien (z.B. falsche Bilder)</p>
                </div>

                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="font-semibold text-red-900">❌ Account-Sperrung</p>
                  <p className="text-sm text-red-800">Bei schwerwiegenden Verstößen (z.B. Verkauf von Blüten, Betrug)</p>
                </div>

                <div className="bg-gray-900 text-white p-3 rounded-lg">
                  <p className="font-semibold">🚨 Strafanzeige</p>
                  <p className="text-sm">Bei illegalen Aktivitäten (z.B. Verkauf an Minderjährige, illegale Produkte)</p>
                </div>
              </div>
            </section>

            {/* Best Practices */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">✨ Best Practices</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-2">📸 Professionelle Fotos</h3>
                  <p className="text-sm text-blue-800">
                    Nutze natürliches Licht und einen neutralen Hintergrund. Zeige die Pflanze aus mehreren Winkeln.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-900 mb-2">💬 Schnelle Kommunikation</h3>
                  <p className="text-sm text-green-800">
                    Antworte innerhalb von 24 Stunden auf Anfragen. Das zeigt Professionalität und erhöht das Vertrauen.
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-2">📦 Sichere Verpackung</h3>
                  <p className="text-sm text-purple-800">
                    Investiere in gute Verpackungsmaterialien. Beschädigte Pflanzen führen zu schlechten Bewertungen.
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-bold text-orange-900 mb-2">⭐ Exzellenter Service</h3>
                  <p className="text-sm text-orange-800">
                    Gehe die Extra-Meile: Lege Pflegehinweise bei, biete Hilfe an, sei freundlich. Das zahlt sich aus!
                  </p>
                </div>
              </div>
            </section>

            {/* Support */}
            <section>
              <h2 className="text-2xl font-bold mb-4">❓ Fragen?</h2>
              
              <p className="text-gray-700 mb-4">
                Bei Fragen zu den Verkäufer-Richtlinien oder Problemen beim Verkaufen kontaktiere uns:
              </p>

              <div className="flex gap-4">
                <a
                  href="/contact"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Kontakt aufnehmen
                </a>
                <a
                  href="/faq"
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  FAQ lesen
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


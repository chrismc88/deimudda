import BackButton from "@/components/BackButton";
import { Calculator, Info, TrendingUp } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function FeeStructure() {
  const [price, setPrice] = useState<number>(20);
  const [method, setMethod] = useState<"online" | "cash">("online");

  // Load dynamic fees from system settings
  const { data: platformFeeStr } = trpc.admin.getSystemSetting.useQuery('platform_fee_fixed', { staleTime: 300000 });
  const { data: paypalFeePercentageStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_percentage', { staleTime: 300000 });
  const { data: paypalFeeFixedStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_fixed', { staleTime: 300000 });
  
  const platformFee = parseFloat(platformFeeStr || "0.42");
  const paypalPercentage = parseFloat(paypalFeePercentageStr || "0.0249");
  const paypalFixed = parseFloat(paypalFeeFixedStr || "0.49");

  const paypalFee = method === "online" ? price * paypalPercentage + paypalFixed : 0;
  const totalFees = platformFee + paypalFee;
  const sellerReceives = price - totalFees;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" label="Zurück zur Startseite" />
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Gebührenstruktur</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-8">
              Transparenz ist uns wichtig! Hier erfährst du genau, welche Gebühren auf deimudda anfallen 
              und wie sie berechnet werden.
            </p>

            {/* Übersicht */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">📊 Gebühren-Übersicht</h2>
              
              <div className="grid md:grid-cols-2 gap-6 not-prose">
                {/* Für Käufer */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Für Käufer</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800">Registrierung:</span>
                      <span className="font-bold text-blue-900">Kostenlos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800">Nutzung:</span>
                      <span className="font-bold text-blue-900">Kostenlos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800">Kaufgebühr:</span>
                      <span className="font-bold text-blue-900">€0,00</span>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 mt-4">
                    Du zahlst nur den Produktpreis + ggf. Versandkosten. Keine versteckten Gebühren!
                  </p>
                </div>

                {/* Für Verkäufer */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-3">Für Verkäufer</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Registrierung:</span>
                      <span className="font-bold text-green-900">Kostenlos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Listing erstellen:</span>
                      <span className="font-bold text-green-900">Kostenlos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Plattformgebühr:</span>
                      <span className="font-bold text-green-900">€{platformFee.toFixed(2).replace('.', ',')} / Artikel</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">PayPal-Gebühr:</span>
                      <span className="font-bold text-green-900">~{(paypalPercentage * 100).toFixed(2)}% + €{paypalFixed.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 mt-4">
                    Gebühren fallen nur bei erfolgreichem Verkauf an. Keine monatlichen Kosten!
                  </p>
                </div>
              </div>
            </section>

            {/* Detaillierte Gebühren */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">💰 Detaillierte Gebühren für Verkäufer</h2>
              
              <div className="space-y-6">
                {/* Plattformgebühr */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Plattformgebühr</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700">Gebühr pro verkauftem Artikel:</span>
                    <span className="text-2xl font-bold text-green-600">€{platformFee.toFixed(2).replace('.', ',')}</span>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <Info className="inline h-4 w-4 mr-1" />
                      <strong>Was deckt die Plattformgebühr ab?</strong>
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-blue-800">
                      <li>Hosting und Betrieb der Plattform</li>
                      <li>Zahlungsabwicklung</li>
                      <li>Sicherheit und Datenschutz</li>
                      <li>Support und Kundenservice</li>
                      <li>Weiterentwicklung der Plattform</li>
                    </ul>
                  </div>
                </div>

                {/* PayPal-Gebühr */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2. PayPal-Gebühr (bei Online-Zahlung)</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Prozentuale Gebühr:</span>
                      <span className="text-xl font-bold text-gray-900">{(paypalPercentage * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Fixe Gebühr:</span>
                      <span className="text-xl font-bold text-gray-900">+ €{paypalFixed.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Wichtig:</strong> Die PayPal-Gebühr fällt nur bei <strong>Online-Zahlung</strong> an. 
                      Bei <strong>Abholung mit Barzahlung</strong> entfällt diese Gebühr.
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mt-3">
                    Die PayPal-Gebühr wird direkt von PayPal erhoben, nicht von deimudda. 
                    Wir haben keinen Einfluss auf die Höhe dieser Gebühr.
                  </p>
                </div>
              </div>
            </section>

            {/* Gebühren-Rechner */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                Gebühren-Rechner
              </h2>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200 not-prose">
                <p className="text-gray-700 mb-4">
                  Berechne, wie viel du nach Abzug der Gebühren erhältst:
                </p>

                <div className="space-y-4">
                  {/* Verkaufspreis */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Verkaufspreis (€)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Zahlungsmethode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Zahlungsmethode
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setMethod("online")}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                          method === "online"
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Online (PayPal)
                      </button>
                      <button
                        onClick={() => setMethod("cash")}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                          method === "cash"
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Abholung (Bar)
                      </button>
                    </div>
                  </div>

                  {/* Berechnung */}
                  <div className="bg-white p-4 rounded-lg border border-gray-300 space-y-2">
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Verkaufspreis:</span>
                      <span className="font-semibold">€{price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Plattformgebühr:</span>
                      <span className="font-semibold text-red-600">- €{platformFee.toFixed(2)}</span>
                    </div>
                    {method === "online" && (
                      <div className="flex justify-between items-center text-gray-700">
                        <span>PayPal-Gebühr:</span>
                        <span className="font-semibold text-red-600">- €{paypalFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Du erhältst:</span>
                        <span className="text-2xl font-bold text-green-600">€{sellerReceives.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <Info className="inline h-4 w-4 mr-1" />
                      <strong>Tipp:</strong> Bei Abholung mit Barzahlung sparst du die PayPal-Gebühr!
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Beispielrechnungen */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">📈 Beispielrechnungen</h2>
              
              <div className="space-y-4 not-prose">
                {/* Beispiel 1 */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Beispiel 1: €10 Steckling (Online-Zahlung)</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Verkaufspreis:</span>
                      <span className="font-semibold">€10,00</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Plattformgebühr:</span>
                      <span className="font-semibold">€{platformFee.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- PayPal-Gebühr ({(paypalPercentage * 100).toFixed(2)}% + €{paypalFixed.toFixed(2).replace('.', ',')}):</span>
                      <span className="font-semibold">€{(15 * paypalPercentage + paypalFixed).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-300 pt-1 mt-1">
                      <span className="font-bold">Du erhältst:</span>
                      <span className="font-bold text-green-600">€8,70</span>
                    </div>
                  </div>
                </div>

                {/* Beispiel 2 */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Beispiel 2: €20 Steckling (Online-Zahlung)</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Verkaufspreis:</span>
                      <span className="font-semibold">€20,00</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Plattformgebühr:</span>
                      <span className="font-semibold">€{platformFee.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- PayPal-Gebühr ({(paypalPercentage * 100).toFixed(2)}% + €{paypalFixed.toFixed(2).replace('.', ',')}):</span>
                      <span className="font-semibold">€{(20 * paypalPercentage + paypalFixed).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-300 pt-1 mt-1">
                      <span className="font-bold">Du erhältst:</span>
                      <span className="font-bold text-green-600">€18,17</span>
                    </div>
                  </div>
                </div>

                {/* Beispiel 3 */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-900 mb-3">Beispiel 3: €20 Steckling (Abholung, Barzahlung)</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Verkaufspreis:</span>
                      <span className="font-semibold">€20,00</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Plattformgebühr:</span>
                      <span className="font-semibold">€{platformFee.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>- PayPal-Gebühr:</span>
                      <span className="font-semibold">€0,00</span>
                    </div>
                    <div className="flex justify-between border-t border-green-300 pt-1 mt-1">
                      <span className="font-bold">Du erhältst:</span>
                      <span className="font-bold text-green-600">€19,58</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Ersparnis: €1,41 durch Barzahlung!
                  </p>
                </div>
              </div>
            </section>

            {/* Tipps zur Gebühren-Optimierung */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">💡 Tipps zur Gebühren-Optimierung</h2>
              
              <div className="space-y-3 not-prose">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-2">1. Abholung anbieten</h3>
                  <p className="text-sm text-blue-800">
                    Bei Barzahlung sparst du die PayPal-Gebühr. Das kann bei höheren Preisen einen großen Unterschied machen!
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-900 mb-2">2. Gebühren einkalkulieren</h3>
                  <p className="text-sm text-green-800">
                    Setze deinen Preis so, dass du nach Abzug der Gebühren den gewünschten Betrag erhältst. 
                    Nutze den Gebühren-Rechner oben!
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-2">3. Mehrere Artikel verkaufen</h3>
                  <p className="text-sm text-purple-800">
                    Die Plattformgebühr (€{platformFee.toFixed(2).replace('.', ',')}) ist fix. Bei höheren Preisen fällt sie prozentual weniger ins Gewicht.
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-bold text-orange-900 mb-2">4. Versandkosten separat berechnen</h3>
                  <p className="text-sm text-orange-800">
                    Versandkosten können separat angegeben werden und unterliegen nicht den Gebühren.
                  </p>
                </div>
              </div>
            </section>

            {/* Vergleich mit anderen Plattformen */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">🔍 Vergleich mit anderen Plattformen</h2>
              
              <div className="overflow-x-auto not-prose">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">Plattform</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Gebühren</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Bei €20 Verkauf</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-green-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">deimudda</td>
                      <td className="border border-gray-300 px-4 py-2">€{platformFee.toFixed(2).replace('.', ',')} + PayPal (~{(paypalPercentage * 100).toFixed(1)}%)</td>
                      <td className="border border-gray-300 px-4 py-2 font-bold text-green-600">€18,17</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">eBay</td>
                      <td className="border border-gray-300 px-4 py-2">~13% + PayPal</td>
                      <td className="border border-gray-300 px-4 py-2">~€15,50</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">eBay Kleinanzeigen</td>
                      <td className="border border-gray-300 px-4 py-2">Kostenlos (keine Zahlung)</td>
                      <td className="border border-gray-300 px-4 py-2">€20,00 (bar)</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Etsy</td>
                      <td className="border border-gray-300 px-4 py-2">~8% + PayPal</td>
                      <td className="border border-gray-300 px-4 py-2">~€16,50</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-gray-600 mt-3">
                <strong>Hinweis:</strong> deimudda bietet eine faire Gebührenstruktur speziell für Cannabis-Stecklinge. 
                Andere Plattformen erlauben Cannabis-Produkte oft gar nicht oder haben deutlich höhere Gebühren.
              </p>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-bold mb-4">❓ Häufige Fragen zu Gebühren</h2>
              
              <div className="space-y-4 not-prose">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Wann werden die Gebühren abgebucht?</h3>
                  <p className="text-sm text-gray-700">
                    Die PayPal-Gebühr wird sofort bei der Zahlung abgezogen. Die Plattformgebühr (€{platformFee.toFixed(2).replace('.', ',')}) wird 
                    nach Abschluss der Transaktion von deinem PayPal-Konto abgebucht.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Gibt es versteckte Gebühren?</h3>
                  <p className="text-sm text-gray-700">
                    Nein! Die Gebührenstruktur ist vollständig transparent. Es gibt keine versteckten Kosten, 
                    monatlichen Gebühren oder Überraschungen.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Kann ich die Gebühren an den Käufer weitergeben?</h3>
                  <p className="text-sm text-gray-700">
                    Ja, du kannst die Gebühren in deinen Verkaufspreis einkalkulieren. Nutze den Gebühren-Rechner 
                    oben, um den optimalen Preis zu berechnen.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Was passiert bei Rückerstattungen?</h3>
                  <p className="text-sm text-gray-700">
                    Bei Rückerstattungen werden die PayPal-Gebühren zurückerstattet. Die Plattformgebühr (€{platformFee.toFixed(2).replace('.', ',')}) 
                    wird nicht zurückerstattet, da die Transaktion bereits abgewickelt wurde.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Impressum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Betreiber mit Logo */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
              <div className="flex items-center gap-6 mb-4">
                <img 
                  src="/vaperge-logo.png" 
                  alt="Vaperge Logo" 
                  className="h-32 w-auto"
                />
                <div>
                  <p className="text-gray-700">
                    <strong>Vaperge - Eau de Terpènes</strong><br />
                    Chris Rohleder<br />
                    Lessingstraße 11<br />
                    69254 Malsch<br />
                    Deutschland
                  </p>
                </div>
              </div>
            </div>

            {/* Kontakt */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Kontakt</h2>
              <p className="text-gray-700">
                E-Mail: info@deimudda.de<br />
                Telefon: [Telefonnummer einfügen]
              </p>
            </div>

            {/* Kooperation */}
            <div>
              <h2 className="text-xl font-semibold mb-2">In Kooperation mit</h2>
              <div className="flex items-center gap-4">
                <img 
                  src="/kalidad-logo.png" 
                  alt="Kalidad Logo" 
                  className="h-20 w-auto bg-white p-2 rounded"
                />
                <div>
                  <p className="text-gray-700">
                    <strong>Kalidad - Grow- & Headshop</strong><br />
                    Kahlbachring 16<br />
                    69254 Malsch<br />
                    Deutschland
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Instagram: <a href="https://www.instagram.com/kalidad420/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@kalidad420</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Verantwortlich für den Inhalt */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p className="text-gray-700">
                Chris Rohleder<br />
                Lessingstraße 11<br />
                69254 Malsch
              </p>
            </div>

            {/* Haftungsausschluss */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Haftungsausschluss</h2>
              
              <h3 className="font-semibold mt-4 mb-2">Haftung für Inhalte</h3>
              <p className="text-gray-700 text-sm">
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>

              <h3 className="font-semibold mt-4 mb-2">Haftung für Links</h3>
              <p className="text-gray-700 text-sm">
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              </p>

              <h3 className="font-semibold mt-4 mb-2">Urheberrecht</h3>
              <p className="text-gray-700 text-sm">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </div>

            {/* Rechtliche Hinweise */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Rechtliche Hinweise zum Handel mit Cannabis-Stecklingen</h2>
              <p className="text-gray-700 text-sm">
                Diese Plattform dient ausschließlich dem Handel mit Cannabis-Stecklingen und Samen gemäß des Konsumcannabisgesetzes (KCanG). Alle Nutzer verpflichten sich, die geltenden Gesetze einzuhalten. Der Plattformbetreiber übernimmt keine Haftung für illegale Nutzung oder Verstöße gegen das KCanG durch Nutzer.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


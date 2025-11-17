import BackButton from "@/components/BackButton";

export default function Widerruf() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <BackButton href="/" label="Zurück zur Startseite" />
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Widerrufsbelehrung</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-8">Stand: 24. Oktober 2025</p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Wichtiger Hinweis</h3>
              <p className="text-blue-800">
                <strong>deimudda ist ein Marktplatz.</strong> Wir vermitteln nur zwischen Käufern und Verkäufern. 
                Der Kaufvertrag kommt direkt zwischen Ihnen und dem jeweiligen Verkäufer zustande. 
                <strong> Der Verkäufer ist Ihr Vertragspartner</strong>, nicht deimudda.
              </p>
              <p className="text-blue-800 mt-2">
                Für Widerrufe, Rücksendungen und Reklamationen wenden Sie sich bitte direkt an den Verkäufer. 
                Die Kontaktdaten des Verkäufers finden Sie auf der Produktseite und in Ihrer Bestellbestätigung.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Widerrufsrecht bei Fernabsatzverträgen</h2>
              
              <p className="mb-4">
                Als Verbraucher haben Sie bei Käufen im Fernabsatz (Online-Kauf) grundsätzlich ein gesetzliches 
                Widerrufsrecht gemäß § 312g BGB.
              </p>

              <h3 className="text-xl font-semibold mb-3">Widerrufsfrist</h3>
              <p className="mb-4">
                Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen den Vertrag mit dem Verkäufer zu widerrufen.
              </p>

              <p className="mb-4">
                Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, 
                der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
              </p>

              <h3 className="text-xl font-semibold mb-3">Ausübung des Widerrufsrechts</h3>
              <p className="mb-4">
                Um Ihr Widerrufsrecht auszuüben, müssen Sie <strong>den Verkäufer</strong> (nicht deimudda) mittels 
                einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, 
                den Vertrag zu widerrufen, informieren.
              </p>

              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">Die Kontaktdaten des Verkäufers finden Sie:</p>
                <ul className="list-disc pl-6">
                  <li>Auf der Produktseite unter "Verkäufer-Informationen"</li>
                  <li>In Ihrer Bestellbestätigung</li>
                  <li>Im Verkäufer-Profil (klicken Sie auf den Verkäufer-Namen)</li>
                </ul>
              </div>

              <p className="mb-4">
                Sie können dafür das unten stehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
              </p>

              <p className="mb-4">
                Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des 
                Widerrufsrechts vor Ablauf der Widerrufsfrist an den Verkäufer absenden.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Folgen des Widerrufs</h2>
              
              <p className="mb-4">
                Wenn Sie den Vertrag widerrufen, hat der Verkäufer Ihnen alle Zahlungen, die er von Ihnen erhalten hat, 
                einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass 
                Sie eine andere Art der Lieferung als die vom Verkäufer angebotene, günstigste Standardlieferung gewählt haben), 
                unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über 
                Ihren Widerruf beim Verkäufer eingegangen ist.
              </p>

              <p className="mb-4">
                Für diese Rückzahlung verwendet der Verkäufer dasselbe Zahlungsmittel, das Sie bei der ursprünglichen 
                Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in 
                keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
              </p>

              <p className="mb-4">
                Der Verkäufer kann die Rückzahlung verweigern, bis er die Waren wieder zurückerhalten hat oder bis Sie 
                den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.
              </p>

              <p className="mb-4">
                Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem 
                Sie den Verkäufer über den Widerruf unterrichten, an den Verkäufer zurückzusenden oder zu übergeben. 
                Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.
              </p>

              <p className="mb-4">
                <strong>Rücksendekosten:</strong> Sie tragen die unmittelbaren Kosten der Rücksendung der Waren, sofern 
                der Verkäufer nicht zugesagt hat, diese Kosten zu übernehmen.
              </p>

              <p className="mb-4">
                Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen 
                zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang 
                mit ihnen zurückzuführen ist.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Besonderheit bei Cannabis-Stecklingen</h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800">
                  <strong>Wichtiger Hinweis:</strong> Das Widerrufsrecht kann bei lebenden Pflanzen unter bestimmten 
                  Umständen ausgeschlossen sein.
                </p>
              </div>

              <p className="mb-4">
                Gemäß § 312g Abs. 2 Nr. 2 BGB besteht kein Widerrufsrecht bei Verträgen zur Lieferung von Waren, die 
                schnell verderben können oder deren Verfallsdatum schnell überschritten würde.
              </p>

              <p className="mb-4">
                Da Cannabis-Stecklinge <strong>lebende Pflanzen</strong> sind, die besonderer Pflege bedürfen und schnell 
                verderben können, kann das Widerrufsrecht in bestimmten Fällen ausgeschlossen sein. Dies gilt insbesondere, wenn:
              </p>

              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Die Stecklinge bereits in Empfang genommen und die Verpackung geöffnet wurde</li>
                <li className="mb-2">Die Stecklinge sichtbare Schäden aufweisen, die auf unsachgemäße Behandlung durch den Käufer zurückzuführen sind</li>
                <li className="mb-2">Der Verkäufer in seiner Produktbeschreibung ausdrücklich auf den Ausschluss des Widerrufsrechts hingewiesen hat</li>
              </ul>

              <p className="mb-4">
                <strong>Mängelrechte bleiben unberührt:</strong> Auch wenn das Widerrufsrecht ausgeschlossen ist, haben 
                Sie bei mangelhaften Stecklingen (z.B. kranke Pflanzen, falsche Sorte) weiterhin Anspruch auf Gewährleistung 
                gegenüber dem Verkäufer (§ 437 BGB).
              </p>

              <p className="mb-4">
                Bitte beachten Sie, dass Sie bei Erhalt der Ware diese unverzüglich auf Mängel überprüfen sollten. 
                Sollten Sie Mängel feststellen, kontaktieren Sie bitte umgehend den Verkäufer und dokumentieren Sie 
                die Mängel mit Fotos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Muster-Widerrufsformular</h2>
              
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="mb-4 text-sm">
                  (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es 
                  an den Verkäufer zurück. Die Kontaktdaten des Verkäufers finden Sie auf der Produktseite oder in Ihrer Bestellbestätigung.)
                </p>

                <div className="space-y-4 text-sm">
                  <p className="font-semibold">An den Verkäufer:</p>
                  <div className="bg-white p-4 rounded space-y-2">
                    <p>[Name des Verkäufers]</p>
                    <p>[Anschrift des Verkäufers]</p>
                    <p>[E-Mail-Adresse des Verkäufers]</p>
                    <p className="text-xs text-gray-500 mt-2">
                      (Diese Informationen finden Sie auf der Produktseite unter "Verkäufer-Informationen")
                    </p>
                  </div>

                  <p className="font-semibold mt-4">Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*):</p>
                  
                  <div className="bg-white p-4 rounded space-y-2">
                    <p>_____________________________________________</p>
                    <p className="text-xs text-gray-500">(Bezeichnung der Ware, z.B. "Purple Kush Steckling")</p>
                  </div>

                  <div className="bg-white p-4 rounded space-y-2">
                    <p>Bestellt am (*) / erhalten am (*): _____________________________________________</p>
                  </div>

                  <div className="bg-white p-4 rounded space-y-2">
                    <p>Bestellnummer / Transaktions-ID: _____________________________________________</p>
                  </div>

                  <div className="bg-white p-4 rounded space-y-2">
                    <p>Name des/der Verbraucher(s): _____________________________________________</p>
                  </div>

                  <div className="bg-white p-4 rounded space-y-2">
                    <p>Anschrift des/der Verbraucher(s): _____________________________________________</p>
                  </div>

                  <div className="bg-white p-4 rounded space-y-2">
                    <p>E-Mail-Adresse: _____________________________________________</p>
                  </div>

                  <div className="bg-white p-4 rounded space-y-2">
                    <p>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): _____________________________________________</p>
                  </div>

                  <div className="bg-white p-4 rounded space-y-2">
                    <p>Datum: _____________________________________________</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">(*) Unzutreffendes streichen.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Ausschluss des Widerrufsrechts</h2>
              
              <p className="mb-4">
                Das Widerrufsrecht besteht gemäß § 312g Abs. 2 BGB nicht bei folgenden Verträgen:
              </p>

              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">
                  Verträge zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine 
                  individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf 
                  die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind
                </li>
                <li className="mb-2">
                  <strong>Verträge zur Lieferung von Waren, die schnell verderben können oder deren Verfallsdatum schnell 
                  überschritten würde</strong> (betrifft lebende Pflanzen wie Cannabis-Stecklinge)
                </li>
                <li className="mb-2">
                  Verträge zur Lieferung versiegelter Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene 
                  nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde
                </li>
              </ul>

              <p className="mb-4">
                Bitte beachten Sie die Produktbeschreibung des jeweiligen Verkäufers, ob das Widerrufsrecht für das 
                konkrete Produkt ausgeschlossen ist.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Rolle von deimudda</h2>
              
              <p className="mb-4">
                <strong>deimudda ist ausschließlich Vermittler</strong> und nicht Vertragspartner des Kaufvertrags. 
                Wir stellen lediglich die Plattform bereit, auf der Käufer und Verkäufer zusammenfinden können.
              </p>

              <p className="mb-4">
                <strong>Für Widerrufe, Rücksendungen, Reklamationen und Gewährleistungsansprüche ist ausschließlich 
                der Verkäufer zuständig.</strong> deimudda haftet nicht für die Abwicklung von Widerrufen oder die 
                Qualität der verkauften Waren.
              </p>

              <p className="mb-4">
                Bei Problemen mit einem Verkäufer können Sie sich jedoch gerne an unseren Support wenden. Wir helfen 
                Ihnen bei der Vermittlung und können bei schwerwiegenden Verstößen gegen unsere Nutzungsbedingungen 
                Maßnahmen gegen den Verkäufer ergreifen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Kontakt bei Fragen</h2>
              
              <p className="mb-4">
                <strong>Bei Fragen zum Widerruf eines konkreten Kaufs:</strong><br />
                Wenden Sie sich bitte direkt an den Verkäufer (Kontaktdaten auf der Produktseite).
              </p>

              <p className="mb-4">
                <strong>Bei allgemeinen Fragen zur Plattform oder Problemen mit einem Verkäufer:</strong><br />
                Kontaktieren Sie den deimudda-Support über das Kontaktformular oder per E-Mail.
              </p>
            </section>

            <p className="text-sm text-gray-600 mt-8">
              Quelle: Erstellt unter Berücksichtigung von § 312g BGB (Widerrufsrecht bei Fernabsatzverträgen) 
              und angepasst für das Marktplatz-Modell von deimudda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


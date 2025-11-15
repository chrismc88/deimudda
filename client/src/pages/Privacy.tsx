import { trpc } from "@/lib/trpc";

export default function Privacy() {
  // Load dynamic platform fee from system settings
  const { data: platformFeeStr } = trpc.admin.getSystemSetting.useQuery('platform_fee_fixed', { staleTime: 300000 });
  const PLATFORM_FEE = parseFloat(platformFeeStr || "0.42");
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Datenschutzerklärung</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-8">Stand: 24. Oktober 2025</p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-2">deimudda ist ein Marktplatz</h3>
              <p className="text-blue-800">
                <strong>Wichtig:</strong> deimudda vermittelt nur zwischen Käufern und Verkäufern. Wir sind kein Händler. 
                Der Kaufvertrag kommt direkt zwischen Ihnen und dem jeweiligen Verkäufer zustande.
              </p>
              <p className="text-blue-800 mt-2">
                Diese Datenschutzerklärung gilt für die Datenverarbeitung durch <strong>deimudda als Plattformbetreiber</strong>. 
                Für die Datenverarbeitung im Rahmen der Kaufabwicklung (Versand, Rechnungsstellung) ist der jeweilige 
                <strong> Verkäufer eigenständig verantwortlich</strong>. Bitte beachten Sie auch die Datenschutzerklärung 
                des Verkäufers.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Datenschutz auf einen Blick</h2>
              
              <h3 className="text-xl font-semibold mb-3">Allgemeine Hinweise</h3>
              <p className="mb-4">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
                passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
                persönlich identifiziert werden können.
              </p>

              <h3 className="text-xl font-semibold mb-3">Wer ist verantwortlich für die Datenverarbeitung?</h3>
              <p className="mb-4">
                <strong>Für die Plattform deimudda:</strong> Der Betreiber von deimudda (siehe Impressum) ist verantwortlich 
                für die Verarbeitung Ihrer Daten im Zusammenhang mit der Nutzung der Plattform (Registrierung, Profil, 
                Bewertungen, etc.).
              </p>
              <p className="mb-4">
                <strong>Für die Kaufabwicklung:</strong> Der jeweilige Verkäufer ist verantwortlich für die Verarbeitung 
                Ihrer Daten im Zusammenhang mit dem Kaufvertrag (Versand, Rechnungsstellung, Gewährleistung, etc.).
              </p>

              <h3 className="text-xl font-semibold mb-3">Welche Daten erheben wir?</h3>
              <p className="mb-4">
                <strong>deimudda erhebt folgende Daten:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Bei Registrierung: Open ID (eindeutige Nutzer-ID vom OAuth-Provider), optional Name und E-Mail</li>
                <li>Bei Profil-Erstellung: Nickname, Standort (optional), Profilbild (optional)</li>
                <li>Bei Verkäufer-Aktivierung: Shop-Name, Beschreibung, Standort</li>
                <li>Bei Listing-Erstellung: Produktdaten (Strain, Beschreibung, Preis, Bilder)</li>
                <li>Bei Transaktionen: PayPal-Transaktions-ID, Kaufbetrag, Gebühren</li>
                <li>Bei Bewertungen: Rating, Kommentar, Zeitstempel</li>
                <li>Bei Preisvorschlägen: Angebotspreis, Nachricht, Status</li>
                <li>Technische Daten: IP-Adresse, Browser-Typ, Zugriffszeiten (Server-Logs)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Wofür nutzen wir Ihre Daten?</h3>
              <p className="mb-4">
                Wir nutzen Ihre Daten ausschließlich zur Bereitstellung und Verbesserung der Plattform deimudda:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Bereitstellung der Plattform-Funktionen (Registrierung, Profil, Listings, Transaktionen)</li>
                <li>Vermittlung zwischen Käufern und Verkäufern</li>
                <li>Abwicklung von Zahlungen über PayPal</li>
                <li>Bewertungs- und Reputationssystem</li>
                <li>Technische Sicherheit und Fehleranalyse</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Welche Rechte haben Sie?</h3>
              <p className="mb-4">
                Sie haben jederzeit das Recht auf:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Auskunft über Ihre gespeicherten Daten</li>
                <li>Berichtigung unrichtiger Daten</li>
                <li>Löschung Ihrer Daten (soweit keine Aufbewahrungspflichten bestehen)</li>
                <li>Einschränkung der Verarbeitung</li>
                <li>Datenübertragbarkeit</li>
                <li>Widerruf Ihrer Einwilligung</li>
                <li>Beschwerde bei einer Aufsichtsbehörde</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Verantwortliche Stellen</h2>
              
              <h3 className="text-xl font-semibold mb-3">deimudda als Plattformbetreiber</h3>
              <p className="mb-4">
                Verantwortlich für die Datenverarbeitung auf der Plattform deimudda:
              </p>
              <p className="mb-4 font-mono text-sm bg-gray-100 p-4 rounded">
                [Betreibername]<br />
                [Straße und Hausnummer]<br />
                [PLZ und Ort]<br />
                <br />
                E-Mail: [E-Mail-Adresse]<br />
                Telefon: [Telefonnummer]
              </p>

              <h3 className="text-xl font-semibold mb-3">Verkäufer als eigenständige Verantwortliche</h3>
              <p className="mb-4">
                Wenn Sie einen Kauf tätigen, werden Ihre Daten (Name, Adresse, Kontaktdaten) an den Verkäufer übermittelt, 
                damit dieser den Kaufvertrag erfüllen kann. <strong>Der Verkäufer ist eigenständiger Datenverantwortlicher</strong> 
                für diese Daten und muss Ihnen eine eigene Datenschutzerklärung bereitstellen.
              </p>
              <p className="mb-4">
                Die Kontaktdaten des Verkäufers finden Sie auf der Produktseite und in Ihrer Bestellbestätigung.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Datenerfassung auf deimudda</h2>
              
              <h3 className="text-xl font-semibold mb-3">3.1 Registrierung und Authentifizierung (OAuth)</h3>
              <p className="mb-4">
                Zur Nutzung von deimudda ist eine Registrierung erforderlich. Wir nutzen <strong>OAuth</strong> für die 
                Authentifizierung. Bei der Anmeldung über OAuth werden Sie zu einem externen Authentifizierungsdienst 
                weitergeleitet.
              </p>
              <p className="mb-4">
                <strong>Erhobene Daten:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Open ID (eindeutige Nutzer-ID)</li>
                <li>Optional: Name, E-Mail-Adresse (falls vom OAuth-Provider bereitgestellt und von Ihnen freigegeben)</li>
              </ul>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Bis zur Löschung Ihres Accounts
              </p>

              <h3 className="text-xl font-semibold mb-3">3.2 Profil-Daten</h3>
              <p className="mb-4">
                Sie können Ihr Profil mit folgenden Daten anreichern:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Nickname / Anzeigename (Pflicht)</li>
                <li>Standort (optional)</li>
                <li>Profilbild (optional, wird auf S3 gespeichert)</li>
              </ul>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Bis zur Löschung durch Sie oder Löschung Ihres Accounts
              </p>

              <h3 className="text-xl font-semibold mb-3">3.3 Verkäufer-Daten</h3>
              <p className="mb-4">
                Wenn Sie als Verkäufer aktiv werden, erheben wir zusätzlich:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Shop-Name</li>
                <li>Shop-Beschreibung</li>
                <li>Standort</li>
                <li>Shop-Logo (optional, wird auf S3 gespeichert)</li>
              </ul>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Bis zur Deaktivierung des Verkäufer-Status oder Löschung des Accounts
              </p>

              <h3 className="text-xl font-semibold mb-3">3.4 Listings (Produktangebote)</h3>
              <p className="mb-4">
                Verkäufer können Listings erstellen mit folgenden Daten:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Strain-Name (Sorte)</li>
                <li>Produkttyp (Steckling oder Samen)</li>
                <li>Beschreibung</li>
                <li>Preis (Festpreis oder Preisvorschlag)</li>
                <li>Menge</li>
                <li>Bilder (werden auf S3 gespeichert)</li>
                <li>Versandoptionen (Versand, Abholung)</li>
              </ul>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Bis zur Löschung durch den Verkäufer
              </p>

              <h3 className="text-xl font-semibold mb-3">3.5 Transaktionen und Zahlungen</h3>
              <p className="mb-4">
                Bei Käufen über deimudda werden folgende Daten gespeichert:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Transaktions-ID</li>
                <li>Käufer-ID und Verkäufer-ID</li>
                <li>Listing-ID (Produkt)</li>
                <li>Kaufbetrag</li>
                <li>Plattformgebühr (€{PLATFORM_FEE.toFixed(2).replace('.', ',')} pro Artikel)</li>
                <li>PayPal-Gebühr (bei Online-Zahlung)</li>
                <li>PayPal-Transaktions-ID</li>
                <li>Zahlungsstatus</li>
                <li>Zeitstempel</li>
              </ul>
              <p className="mb-4">
                <strong>Zahlungsabwicklung über PayPal:</strong> Die Zahlung erfolgt über PayPal. Dabei werden Ihre 
                Zahlungsdaten direkt an PayPal übermittelt. deimudda erhält nur die Transaktions-ID und den Zahlungsstatus.
              </p>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> 10 Jahre (steuerrechtliche Aufbewahrungspflicht gemäß § 147 AO)
              </p>

              <h3 className="text-xl font-semibold mb-3">3.6 Bewertungen</h3>
              <p className="mb-4">
                Käufer können Verkäufer bewerten:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Rating (1-5 Sterne)</li>
                <li>Kommentar (optional)</li>
                <li>Zeitstempel</li>
                <li>Käufer-ID (wird nicht öffentlich angezeigt)</li>
              </ul>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Transparenz)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Bis zur Löschung durch Sie oder bei Account-Löschung
              </p>

              <h3 className="text-xl font-semibold mb-3">3.7 Preisvorschläge</h3>
              <p className="mb-4">
                Bei Listings mit Preisvorschlag-Option können Käufer Angebote abgeben:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Angebotspreis</li>
                <li>Nachricht (optional)</li>
                <li>Status (ausstehend, angenommen, abgelehnt)</li>
                <li>Zeitstempel</li>
              </ul>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> 2 Jahre nach letzter Aktivität
              </p>

              <h3 className="text-xl font-semibold mb-3">3.8 Cookies</h3>
              <p className="mb-4">
                Wir verwenden nur <strong>technisch notwendige Cookies</strong>, um die Funktionalität der Website zu gewährleisten:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Session-Cookie (für Login-Status)</li>
                <li>Cookie-Consent-Cookie (speichert Ihre Cookie-Einstellung)</li>
              </ul>
              <p className="mb-4">
                Diese Cookies sind für den Betrieb der Seite erforderlich und können nicht deaktiviert werden.
              </p>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an technisch fehlerfreier Bereitstellung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Session-Cookies bis zum Schließen des Browsers, Cookie-Consent-Cookie 1 Jahr
              </p>

              <h3 className="text-xl font-semibold mb-3">3.9 Server-Log-Dateien</h3>
              <p className="mb-4">
                Unser Hosting-Provider erhebt automatisch folgende Daten:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>IP-Adresse</li>
                <li>Browsertyp und Browserversion</li>
                <li>Betriebssystem</li>
                <li>Referrer URL (vorherige Seite)</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
              </ul>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an technischer Sicherheit und Fehleranalyse)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> 7 Tage, dann automatische Löschung
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Weitergabe von Daten an Dritte</h2>
              
              <h3 className="text-xl font-semibold mb-3">4.1 Verkäufer</h3>
              <p className="mb-4">
                Wenn Sie einen Kauf tätigen, werden Ihre Kontaktdaten (Name, E-Mail, ggf. Adresse) an den Verkäufer 
                übermittelt, damit dieser den Kaufvertrag erfüllen kann (Versand, Rechnungsstellung).
              </p>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
              </p>

              <h3 className="text-xl font-semibold mb-3">4.2 PayPal (Zahlungsdienstleister)</h3>
              <p className="mb-4">
                Bei Zahlung über PayPal werden Ihre Zahlungsdaten direkt an PayPal (Europe) S.à.r.l. et Cie, S.C.A., 
                22-24 Boulevard Royal, L-2449 Luxembourg übermittelt.
              </p>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
              </p>
              <p className="mb-4">
                Weitere Informationen: <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank" className="text-blue-600 hover:underline">PayPal Datenschutzerklärung</a>
              </p>

              <h3 className="text-xl font-semibold mb-3">4.3 S3 / Cloud-Storage (Bild-Hosting)</h3>
              <p className="mb-4">
                Hochgeladene Bilder (Profilbilder, Produktbilder) werden auf einem S3-kompatiblen Cloud-Storage gespeichert.
              </p>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an effizienter Bereitstellung)
              </p>

              <h3 className="text-xl font-semibold mb-3">4.4 Hosting-Provider</h3>
              <p className="mb-4">
                Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, 
                werden auf den Servern des Hosters gespeichert.
              </p>
              <p className="mb-4">
                Das externe Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und 
                bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und 
                effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
              <p className="mb-4">
                Unser Hoster verarbeitet Ihre Daten nur insoweit, wie dies zur Erfüllung seiner Leistungspflichten 
                erforderlich ist und befolgt unsere Weisungen (Auftragsverarbeitung gemäß Art. 28 DSGVO).
              </p>

              <h3 className="text-xl font-semibold mb-3">4.5 Keine Weitergabe an sonstige Dritte</h3>
              <p className="mb-4">
                Eine Weitergabe Ihrer Daten an sonstige Dritte erfolgt nicht, es sei denn:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Sie haben ausdrücklich eingewilligt (Art. 6 Abs. 1 lit. a DSGVO)</li>
                <li>Die Weitergabe ist zur Erfüllung einer rechtlichen Verpflichtung erforderlich (Art. 6 Abs. 1 lit. c DSGVO)</li>
                <li>Die Weitergabe ist zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich (Art. 6 Abs. 1 lit. f DSGVO)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Ihre Rechte</h2>
              
              <p className="mb-4">
                Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
              </p>

              <h3 className="text-xl font-semibold mb-3">Recht auf Auskunft (Art. 15 DSGVO)</h3>
              <p className="mb-4">
                Sie können Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten verlangen.
              </p>

              <h3 className="text-xl font-semibold mb-3">Recht auf Berichtigung (Art. 16 DSGVO)</h3>
              <p className="mb-4">
                Sie können die Berichtigung unrichtiger oder die Vervollständigung Ihrer bei uns gespeicherten 
                personenbezogenen Daten verlangen. Dies können Sie direkt in Ihrem Profil vornehmen.
              </p>

              <h3 className="text-xl font-semibold mb-3">Recht auf Löschung (Art. 17 DSGVO)</h3>
              <p className="mb-4">
                Sie können die Löschung Ihrer bei uns gespeicherten personenbezogenen Daten verlangen, soweit nicht 
                die Verarbeitung zur Erfüllung einer rechtlichen Verpflichtung (z.B. steuerrechtliche Aufbewahrungsfristen) 
                erforderlich ist.
              </p>
              <p className="mb-4">
                <strong>Account löschen:</strong> Sie können Ihren Account jederzeit in den Profil-Einstellungen löschen. 
                Bitte beachten Sie, dass Transaktionsdaten aus steuerrechtlichen Gründen 10 Jahre aufbewahrt werden müssen 
                (anonymisiert nach Account-Löschung).
              </p>

              <h3 className="text-xl font-semibold mb-3">Recht auf Einschränkung (Art. 18 DSGVO)</h3>
              <p className="mb-4">
                Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
              </p>

              <h3 className="text-xl font-semibold mb-3">Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</h3>
              <p className="mb-4">
                Sie haben das Recht, Ihre personenbezogenen Daten in einem strukturierten, gängigen und maschinenlesbaren 
                Format zu erhalten.
              </p>
              <p className="mb-4">
                <strong>Daten exportieren:</strong> Sie können Ihre Daten jederzeit in den Profil-Einstellungen exportieren.
              </p>

              <h3 className="text-xl font-semibold mb-3">Widerspruchsrecht (Art. 21 DSGVO)</h3>
              <p className="mb-4">
                Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die 
                Verarbeitung Sie betreffender personenbezogener Daten Widerspruch einzulegen.
              </p>

              <h3 className="text-xl font-semibold mb-3">Beschwerderecht (Art. 77 DSGVO)</h3>
              <p className="mb-4">
                Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren, wenn Sie der Ansicht sind, dass die 
                Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Datensicherheit</h2>
              
              <p className="mb-4">
                Wir verwenden geeignete technische und organisatorische Sicherheitsmaßnahmen, um Ihre Daten gegen 
                zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder den Zugriff unberechtigter Personen zu schützen:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
                <li>Sichere Passwort-Speicherung (OAuth)</li>
                <li>Regelmäßige Sicherheits-Updates</li>
                <li>Zugriffsbeschränkungen auf Datenbanken</li>
                <li>Regelmäßige Backups</li>
              </ul>
              <p className="mb-4">
                Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) 
                Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Kontakt</h2>
              
              <p className="mb-4">
                Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte können Sie uns jederzeit kontaktieren:
              </p>

              <p className="mb-4 font-mono text-sm bg-gray-100 p-4 rounded">
                E-Mail: [Datenschutz-E-Mail]<br />
                Telefon: [Telefonnummer]<br />
                Post: [Adresse aus Impressum]
              </p>
            </section>

            <p className="text-sm text-gray-600 mt-8">
              Diese Datenschutzerklärung wurde speziell für das Marktplatz-Modell von deimudda erstellt und 
              berücksichtigt die DSGVO sowie das Konsumcannabisgesetz (KCanG).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


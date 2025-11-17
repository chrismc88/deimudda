import BackButton from "@/components/BackButton";
import { trpc } from "@/lib/trpc";

export default function Privacy() {
  // Load dynamic platform fee from system settings
  const { data: platformFeeStr } = trpc.admin.getSystemSetting.useQuery('platform_fee_fixed', { staleTime: 300000 });
  const PLATFORM_FEE = parseFloat(platformFeeStr || "0.42");
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <BackButton href="/" label="Zurück zur Startseite" />
          <h1 className="text-4xl font-bold mb-8 text-gray-900">DatenschutzerklÃ¤rung</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-8">Stand: 24. Oktober 2025</p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-2">deimudda ist ein Marktplatz</h3>
              <p className="text-blue-800">
                <strong>Wichtig:</strong> deimudda vermittelt nur zwischen KÃ¤ufern und VerkÃ¤ufern. Wir sind kein HÃ¤ndler. 
                Der Kaufvertrag kommt direkt zwischen Ihnen und dem jeweiligen VerkÃ¤ufer zustande.
              </p>
              <p className="text-blue-800 mt-2">
                Diese DatenschutzerklÃ¤rung gilt fÃ¼r die Datenverarbeitung durch <strong>deimudda als Plattformbetreiber</strong>. 
                FÃ¼r die Datenverarbeitung im Rahmen der Kaufabwicklung (Versand, Rechnungsstellung) ist der jeweilige 
                <strong> VerkÃ¤ufer eigenstÃ¤ndig verantwortlich</strong>. Bitte beachten Sie auch die DatenschutzerklÃ¤rung 
                des VerkÃ¤ufers.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Datenschutz auf einen Blick</h2>
              
              <h3 className="text-xl font-semibold mb-3">Allgemeine Hinweise</h3>
              <p className="mb-4">
                Die folgenden Hinweise geben einen einfachen Ãberblick darÃ¼ber, was mit Ihren personenbezogenen Daten 
                passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
                persÃ¶nlich identifiziert werden kÃ¶nnen.
              </p>

              <h3 className="text-xl font-semibold mb-3">Wer ist verantwortlich fÃ¼r die Datenverarbeitung?</h3>
              <p className="mb-4">
                <strong>FÃ¼r die Plattform deimudda:</strong> Der Betreiber von deimudda (siehe Impressum) ist verantwortlich 
                fÃ¼r die Verarbeitung Ihrer Daten im Zusammenhang mit der Nutzung der Plattform (Registrierung, Profil, 
                Bewertungen, etc.).
              </p>
              <p className="mb-4">
                <strong>FÃ¼r die Kaufabwicklung:</strong> Der jeweilige VerkÃ¤ufer ist verantwortlich fÃ¼r die Verarbeitung 
                Ihrer Daten im Zusammenhang mit dem Kaufvertrag (Versand, Rechnungsstellung, GewÃ¤hrleistung, etc.).
              </p>

              <h3 className="text-xl font-semibold mb-3">Welche Daten erheben wir?</h3>
              <p className="mb-4">
                <strong>deimudda erhebt folgende Daten:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Bei Registrierung: interne Nutzer-ID (Dev-Login), optional Name und E-Mail</li>
                <li>Bei Profil-Erstellung: Nickname, Standort (optional), Profilbild (optional)</li>
                <li>Bei VerkÃ¤ufer-Aktivierung: Shop-Name, Beschreibung, Standort</li>
                <li>Bei Listing-Erstellung: Produktdaten (Strain, Beschreibung, Preis, Bilder)</li>
                <li>Bei Transaktionen: PayPal-Transaktions-ID, Kaufbetrag, GebÃ¼hren</li>
                <li>Bei Bewertungen: Rating, Kommentar, Zeitstempel</li>
                <li>Bei PreisvorschlÃ¤gen: Angebotspreis, Nachricht, Status</li>
                <li>Technische Daten: IP-Adresse, Browser-Typ, Zugriffszeiten (Server-Logs)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">WofÃ¼r nutzen wir Ihre Daten?</h3>
              <p className="mb-4">
                Wir nutzen Ihre Daten ausschlieÃlich zur Bereitstellung und Verbesserung der Plattform deimudda:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Bereitstellung der Plattform-Funktionen (Registrierung, Profil, Listings, Transaktionen)</li>
                <li>Vermittlung zwischen KÃ¤ufern und VerkÃ¤ufern</li>
                <li>Abwicklung von Zahlungen Ã¼ber PayPal</li>
                <li>Bewertungs- und Reputationssystem</li>
                <li>Technische Sicherheit und Fehleranalyse</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Welche Rechte haben Sie?</h3>
              <p className="mb-4">
                Sie haben jederzeit das Recht auf:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Auskunft Ã¼ber Ihre gespeicherten Daten</li>
                <li>Berichtigung unrichtiger Daten</li>
                <li>LÃ¶schung Ihrer Daten (soweit keine Aufbewahrungspflichten bestehen)</li>
                <li>EinschrÃ¤nkung der Verarbeitung</li>
                <li>DatenÃ¼bertragbarkeit</li>
                <li>Widerruf Ihrer Einwilligung</li>
                <li>Beschwerde bei einer AufsichtsbehÃ¶rde</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Verantwortliche Stellen</h2>
              
              <h3 className="text-xl font-semibold mb-3">deimudda als Plattformbetreiber</h3>
              <p className="mb-4">
                Verantwortlich fÃ¼r die Datenverarbeitung auf der Plattform deimudda:
              </p>
              <p className="mb-4 font-mono text-sm bg-gray-100 p-4 rounded">
                [Betreibername]<br />
                [StraÃe und Hausnummer]<br />
                [PLZ und Ort]<br />
                <br />
                E-Mail: [E-Mail-Adresse]<br />
                Telefon: [Telefonnummer]
              </p>

              <h3 className="text-xl font-semibold mb-3">VerkÃ¤ufer als eigenstÃ¤ndige Verantwortliche</h3>
              <p className="mb-4">
                Wenn Sie einen Kauf tÃ¤tigen, werden Ihre Daten (Name, Adresse, Kontaktdaten) an den VerkÃ¤ufer Ã¼bermittelt, 
                damit dieser den Kaufvertrag erfÃ¼llen kann. <strong>Der VerkÃ¤ufer ist eigenstÃ¤ndiger Datenverantwortlicher</strong> 
                fÃ¼r diese Daten und muss Ihnen eine eigene DatenschutzerklÃ¤rung bereitstellen.
              </p>
              <p className="mb-4">
                Die Kontaktdaten des VerkÃ¤ufers finden Sie auf der Produktseite und in Ihrer BestellbestÃ¤tigung.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Datenerfassung auf deimudda</h2>
              
              <h3 className="text-xl font-semibold mb-3">3.1 Registrierung und Authentifizierung (Beta-Einladung)</h3>
              <p className="mb-4">
                Zur Nutzung von deimudda ist eine Registrierung erforderlich. In der aktuellen Beta-Phase vergeben wir Accounts manuell über Einladungen. Die Anmeldung erfolgt über unseren internen Dev-Login, der einen signierten Session-Token erstellt.
              </p>
              <p className="mb-4">
                <strong>Erhobene Daten:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Interne Nutzer-ID (Dev-Login)</li>
                <li>Optional: Name, E-Mail-Adresse (falls Sie diese freiwillig angeben)</li>
              </ul>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (VertragserfÃ¼llung) und Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Bis zur LÃ¶schung Ihres Accounts
              </p>

              <h3 className="text-xl font-semibold mb-3">3.2 Profil-Daten</h3>
              <p className="mb-4">
                Sie kÃ¶nnen Ihr Profil mit folgenden Daten anreichern:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Nickname / Anzeigename (Pflicht)</li>
                <li>Standort (optional)</li>
                <li>Profilbild (optional, wird auf S3 gespeichert)</li>
              </ul>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (VertragserfÃ¼llung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Bis zur LÃ¶schung durch Sie oder LÃ¶schung Ihres Accounts
              </p>

              <h3 className="text-xl font-semibold mb-3">3.3 VerkÃ¤ufer-Daten</h3>
              <p className="mb-4">
                Wenn Sie als VerkÃ¤ufer aktiv werden, erheben wir zusÃ¤tzlich:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Shop-Name</li>
                <li>Shop-Beschreibung</li>
                <li>Standort</li>
                <li>Shop-Logo (optional, wird auf S3 gespeichert)</li>
              </ul>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (VertragserfÃ¼llung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Bis zur Deaktivierung des VerkÃ¤ufer-Status oder LÃ¶schung des Accounts
              </p>

              <h3 className="text-xl font-semibold mb-3">3.4 Listings (Produktangebote)</h3>
              <p className="mb-4">
                VerkÃ¤ufer kÃ¶nnen Listings erstellen mit folgenden Daten:
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
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (VertragserfÃ¼llung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Bis zur LÃ¶schung durch den VerkÃ¤ufer
              </p>

              <h3 className="text-xl font-semibold mb-3">3.5 Transaktionen und Zahlungen</h3>
              <p className="mb-4">
                Bei KÃ¤ufen Ã¼ber deimudda werden folgende Daten gespeichert:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Transaktions-ID</li>
                <li>KÃ¤ufer-ID und VerkÃ¤ufer-ID</li>
                <li>Listing-ID (Produkt)</li>
                <li>Kaufbetrag</li>
                <li>PlattformgebÃ¼hr (â¬{PLATFORM_FEE.toFixed(2).replace('.', ',')} pro Artikel)</li>
                <li>PayPal-GebÃ¼hr (bei Online-Zahlung)</li>
                <li>PayPal-Transaktions-ID</li>
                <li>Zahlungsstatus</li>
                <li>Zeitstempel</li>
              </ul>
              <p className="mb-4">
                <strong>Zahlungsabwicklung Ã¼ber PayPal:</strong> Die Zahlung erfolgt Ã¼ber PayPal. Dabei werden Ihre 
                Zahlungsdaten direkt an PayPal Ã¼bermittelt. deimudda erhÃ¤lt nur die Transaktions-ID und den Zahlungsstatus.
              </p>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (VertragserfÃ¼llung) und Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> 10 Jahre (steuerrechtliche Aufbewahrungspflicht gemÃ¤Ã Â§ 147 AO)
              </p>

              <h3 className="text-xl font-semibold mb-3">3.6 Bewertungen</h3>
              <p className="mb-4">
                KÃ¤ufer kÃ¶nnen VerkÃ¤ufer bewerten:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Rating (1-5 Sterne)</li>
                <li>Kommentar (optional)</li>
                <li>Zeitstempel</li>
                <li>KÃ¤ufer-ID (wird nicht Ã¶ffentlich angezeigt)</li>
              </ul>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Transparenz)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Bis zur LÃ¶schung durch Sie oder bei Account-LÃ¶schung
              </p>

              <h3 className="text-xl font-semibold mb-3">3.7 PreisvorschlÃ¤ge</h3>
              <p className="mb-4">
                Bei Listings mit Preisvorschlag-Option kÃ¶nnen KÃ¤ufer Angebote abgeben:
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
                <strong>Speicherdauer:</strong> 2 Jahre nach letzter AktivitÃ¤t
              </p>

              <h3 className="text-xl font-semibold mb-3">3.8 Cookies</h3>
              <p className="mb-4">
                Wir verwenden nur <strong>technisch notwendige Cookies</strong>, um die FunktionalitÃ¤t der Website zu gewÃ¤hrleisten:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Session-Cookie (fÃ¼r Login-Status)</li>
                <li>Cookie-Consent-Cookie (speichert Ihre Cookie-Einstellung)</li>
              </ul>
              <p className="mb-4">
                Diese Cookies sind fÃ¼r den Betrieb der Seite erforderlich und kÃ¶nnen nicht deaktiviert werden.
              </p>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an technisch fehlerfreier Bereitstellung)
              </p>
              <p className="mb-4">
                <strong>Speicherdauer:</strong> Session-Cookies bis zum SchlieÃen des Browsers, Cookie-Consent-Cookie 1 Jahr
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
                <strong>Speicherdauer:</strong> 7 Tage, dann automatische LÃ¶schung
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Weitergabe von Daten an Dritte</h2>
              
              <h3 className="text-xl font-semibold mb-3">4.1 VerkÃ¤ufer</h3>
              <p className="mb-4">
                Wenn Sie einen Kauf tÃ¤tigen, werden Ihre Kontaktdaten (Name, E-Mail, ggf. Adresse) an den VerkÃ¤ufer 
                Ã¼bermittelt, damit dieser den Kaufvertrag erfÃ¼llen kann (Versand, Rechnungsstellung).
              </p>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (VertragserfÃ¼llung)
              </p>

              <h3 className="text-xl font-semibold mb-3">4.2 PayPal (Zahlungsdienstleister)</h3>
              <p className="mb-4">
                Bei Zahlung Ã¼ber PayPal werden Ihre Zahlungsdaten direkt an PayPal (Europe) S.Ã .r.l. et Cie, S.C.A., 
                22-24 Boulevard Royal, L-2449 Luxembourg Ã¼bermittelt.
              </p>
              <p className="mb-4">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (VertragserfÃ¼llung)
              </p>
              <p className="mb-4">
                Weitere Informationen: <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank" className="text-blue-600 hover:underline">PayPal DatenschutzerklÃ¤rung</a>
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
                Das externe Hosting erfolgt zum Zwecke der VertragserfÃ¼llung gegenÃ¼ber unseren potenziellen und 
                bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und 
                effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
              <p className="mb-4">
                Unser Hoster verarbeitet Ihre Daten nur insoweit, wie dies zur ErfÃ¼llung seiner Leistungspflichten 
                erforderlich ist und befolgt unsere Weisungen (Auftragsverarbeitung gemÃ¤Ã Art. 28 DSGVO).
              </p>

              <h3 className="text-xl font-semibold mb-3">4.5 Keine Weitergabe an sonstige Dritte</h3>
              <p className="mb-4">
                Eine Weitergabe Ihrer Daten an sonstige Dritte erfolgt nicht, es sei denn:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Sie haben ausdrÃ¼cklich eingewilligt (Art. 6 Abs. 1 lit. a DSGVO)</li>
                <li>Die Weitergabe ist zur ErfÃ¼llung einer rechtlichen Verpflichtung erforderlich (Art. 6 Abs. 1 lit. c DSGVO)</li>
                <li>Die Weitergabe ist zur Geltendmachung, AusÃ¼bung oder Verteidigung von RechtsansprÃ¼chen erforderlich (Art. 6 Abs. 1 lit. f DSGVO)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Ihre Rechte</h2>
              
              <p className="mb-4">
                Sie haben folgende Rechte bezÃ¼glich Ihrer personenbezogenen Daten:
              </p>

              <h3 className="text-xl font-semibold mb-3">Recht auf Auskunft (Art. 15 DSGVO)</h3>
              <p className="mb-4">
                Sie kÃ¶nnen Auskunft Ã¼ber Ihre von uns verarbeiteten personenbezogenen Daten verlangen.
              </p>

              <h3 className="text-xl font-semibold mb-3">Recht auf Berichtigung (Art. 16 DSGVO)</h3>
              <p className="mb-4">
                Sie kÃ¶nnen die Berichtigung unrichtiger oder die VervollstÃ¤ndigung Ihrer bei uns gespeicherten 
                personenbezogenen Daten verlangen. Dies kÃ¶nnen Sie direkt in Ihrem Profil vornehmen.
              </p>

              <h3 className="text-xl font-semibold mb-3">Recht auf LÃ¶schung (Art. 17 DSGVO)</h3>
              <p className="mb-4">
                Sie kÃ¶nnen die LÃ¶schung Ihrer bei uns gespeicherten personenbezogenen Daten verlangen, soweit nicht 
                die Verarbeitung zur ErfÃ¼llung einer rechtlichen Verpflichtung (z.B. steuerrechtliche Aufbewahrungsfristen) 
                erforderlich ist.
              </p>
              <p className="mb-4">
                <strong>Account lÃ¶schen:</strong> Sie kÃ¶nnen Ihren Account jederzeit in den Profil-Einstellungen lÃ¶schen. 
                Bitte beachten Sie, dass Transaktionsdaten aus steuerrechtlichen GrÃ¼nden 10 Jahre aufbewahrt werden mÃ¼ssen 
                (anonymisiert nach Account-LÃ¶schung).
              </p>

              <h3 className="text-xl font-semibold mb-3">Recht auf EinschrÃ¤nkung (Art. 18 DSGVO)</h3>
              <p className="mb-4">
                Sie haben das Recht, die EinschrÃ¤nkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
              </p>

              <h3 className="text-xl font-semibold mb-3">Recht auf DatenÃ¼bertragbarkeit (Art. 20 DSGVO)</h3>
              <p className="mb-4">
                Sie haben das Recht, Ihre personenbezogenen Daten in einem strukturierten, gÃ¤ngigen und maschinenlesbaren 
                Format zu erhalten.
              </p>
              <p className="mb-4">
                <strong>Daten exportieren:</strong> Sie kÃ¶nnen Ihre Daten jederzeit in den Profil-Einstellungen exportieren.
              </p>

              <h3 className="text-xl font-semibold mb-3">Widerspruchsrecht (Art. 21 DSGVO)</h3>
              <p className="mb-4">
                Sie haben das Recht, aus GrÃ¼nden, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die 
                Verarbeitung Sie betreffender personenbezogener Daten Widerspruch einzulegen.
              </p>

              <h3 className="text-xl font-semibold mb-3">Beschwerderecht (Art. 77 DSGVO)</h3>
              <p className="mb-4">
                Sie haben das Recht, sich bei einer AufsichtsbehÃ¶rde zu beschweren, wenn Sie der Ansicht sind, dass die 
                Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstÃ¶Ãt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Datensicherheit</h2>
              
              <p className="mb-4">
                Wir verwenden geeignete technische und organisatorische SicherheitsmaÃnahmen, um Ihre Daten gegen 
                zufÃ¤llige oder vorsÃ¤tzliche Manipulationen, Verlust, ZerstÃ¶rung oder den Zugriff unberechtigter Personen zu schÃ¼tzen:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>SSL/TLS-VerschlÃ¼sselung fÃ¼r alle DatenÃ¼bertragungen</li>
                <li>Signierte Session-Tokens (Dev-Login) und Zugriffsbeschränkungen</li>
                <li>RegelmÃ¤Ãige Sicherheits-Updates</li>
                <li>ZugriffsbeschrÃ¤nkungen auf Datenbanken</li>
                <li>RegelmÃ¤Ãige Backups</li>
              </ul>
              <p className="mb-4">
                Wir weisen darauf hin, dass die DatenÃ¼bertragung im Internet (z.B. bei der Kommunikation per E-Mail) 
                SicherheitslÃ¼cken aufweisen kann. Ein lÃ¼ckenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht mÃ¶glich.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Kontakt</h2>
              
              <p className="mb-4">
                Bei Fragen zum Datenschutz oder zur AusÃ¼bung Ihrer Rechte kÃ¶nnen Sie uns jederzeit kontaktieren:
              </p>

              <p className="mb-4 font-mono text-sm bg-gray-100 p-4 rounded">
                E-Mail: [Datenschutz-E-Mail]<br />
                Telefon: [Telefonnummer]<br />
                Post: [Adresse aus Impressum]
              </p>
            </section>

            <p className="text-sm text-gray-600 mt-8">
              Diese DatenschutzerklÃ¤rung wurde speziell fÃ¼r das Marktplatz-Modell von deimudda erstellt und 
              berÃ¼cksichtigt die DSGVO sowie das Konsumcannabisgesetz (KCanG).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

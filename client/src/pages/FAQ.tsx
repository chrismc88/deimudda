import BackButton from "@/components/BackButton";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
  category: string;
}

export default function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Load dynamic fees from system settings
  const { data: platformFeeStr } = trpc.admin.getSystemSetting.useQuery('platform_fee_fixed', { staleTime: 300000 });
  const { data: paypalFeePercentageStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_percentage', { staleTime: 300000 });
  const { data: paypalFeeFixedStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_fixed', { staleTime: 300000 });
  
  const PLATFORM_FEE = parseFloat(platformFeeStr || "0.42");
  const PAYPAL_FEE_PERCENTAGE = parseFloat(paypalFeePercentageStr || "0.0249");
  const PAYPAL_FEE_FIXED = parseFloat(paypalFeeFixedStr || "0.49");
  const EXAMPLE_PAYPAL_FEE_20 = (20 * PAYPAL_FEE_PERCENTAGE + PAYPAL_FEE_FIXED).toFixed(2);

  const faqData: FAQItem[] = [
  // Allgemeine Fragen
  {
    category: "Allgemein",
    question: "Was ist deimudda?",
    answer: (
      <div>
        <p className="mb-2">
          <strong>deimudda</strong> ist ein Online-Marktplatz für Cannabis-Stecklinge und Samen in Deutschland. 
          Wir vermitteln zwischen privaten und gewerblichen Verkäufern und Käufern.
        </p>
        <p>
          <strong>Wichtig:</strong> deimudda ist <strong>kein Händler</strong>, sondern nur Vermittler. 
          Der Kaufvertrag kommt direkt zwischen Käufer und Verkäufer zustande.
        </p>
      </div>
    )
  },
  {
    category: "Allgemein",
    question: "Ist deimudda legal?",
    answer: (
      <div>
        <p className="mb-2">
          Ja! Cannabis-Stecklinge und Samen sind seit dem <strong>Konsumcannabisgesetz (KCanG)</strong> vom 1. April 2024 
          in Deutschland legal.
        </p>
        <p className="mb-2">
          <strong>Wichtige Einschränkungen:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Nur für Personen ab 18 Jahren</li>
          <li>Maximal 3 Pflanzen gleichzeitig im privaten Besitz (§ 3 Abs. 1 KCanG)</li>
          <li>Nur für legale Zwecke (Eigenanbau nach KCanG)</li>
        </ul>
      </div>
    )
  },
  {
    category: "Allgemein",
    question: "Wie funktioniert deimudda?",
    answer: (
      <div>
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>Registrierung:</strong> Erstelle einen Account (kostenlos)</li>
          <li><strong>Stöbern:</strong> Durchsuche Listings von Verkäufern</li>
          <li><strong>Kaufen:</strong> Wähle ein Listing und schließe den Kauf ab (PayPal)</li>
          <li><strong>Kontakt:</strong> Der Verkäufer kontaktiert dich für Versand/Abholung</li>
          <li><strong>Bewerten:</strong> Nach Erhalt kannst du den Verkäufer bewerten</li>
        </ol>
      </div>
    )
  },
  {
    category: "Allgemein",
    question: "Was kostet die Nutzung von deimudda?",
    answer: (
      <div>
        <p className="mb-2">
          <strong>Für Käufer:</strong> Die Nutzung ist <strong>kostenlos</strong>. Du zahlst nur den Produktpreis + ggf. Versandkosten.
        </p>
        <p>
          <strong>Für Verkäufer:</strong> Pro verkauftem Artikel fällt eine <strong>Plattformgebühr von €{PLATFORM_FEE.toFixed(2).replace('.', ',')}</strong> an. 
          Bei Online-Zahlung über PayPal kommen zusätzlich PayPal-Gebühren hinzu (ca. {(PAYPAL_FEE_PERCENTAGE * 100).toFixed(2)}% + €{PAYPAL_FEE_FIXED.toFixed(2).replace('.', ',')}).
        </p>
      </div>
    )
  },

  // Registrierung & Account
  {
    category: "Registrierung & Account",
    question: "Wie registriere ich mich?",
    answer: (
      <div>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Klicke auf "Zum Dashboard" oder "Registrieren"</li>
          <li>Melde dich über OAuth an (z.B. Google, GitHub)</li>
          <li>Wähle einen Nickname</li>
          <li>Fertig! Du kannst jetzt kaufen und verkaufen</li>
        </ol>
        <p className="mt-3 text-sm text-gray-600">
          <strong>Hinweis:</strong> Wir verwenden OAuth für sichere Authentifizierung. Deine Zugangsdaten werden nicht bei uns gespeichert.
        </p>
      </div>
    )
  },
  {
    category: "Registrierung & Account",
    question: "Kann ich meinen Account löschen?",
    answer: (
      <div>
        <p className="mb-2">
          Ja, du kannst deinen Account jederzeit in den <strong>Profil-Einstellungen</strong> löschen.
        </p>
        <p className="text-sm text-gray-600">
          <strong>Wichtig:</strong> Transaktionsdaten werden aus steuerrechtlichen Gründen 10 Jahre aufbewahrt 
          (anonymisiert nach Account-Löschung).
        </p>
      </div>
    )
  },
  {
    category: "Registrierung & Account",
    question: "Wie ändere ich mein Profil?",
    answer: (
      <div>
        <p className="mb-2">
          Gehe zu <strong>Dashboard → Profil-Einstellungen</strong>. Dort kannst du ändern:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Nickname</li>
          <li>Standort</li>
          <li>Profilbild</li>
        </ul>
      </div>
    )
  },

  // Kaufen
  {
    category: "Kaufen",
    question: "Wie kaufe ich einen Steckling?",
    answer: (
      <div>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Suche ein Listing auf der <strong>Browse-Seite</strong></li>
          <li>Klicke auf "Details" für mehr Informationen</li>
          <li>Klicke auf "Kaufen" oder mache einen Preisvorschlag (falls aktiviert)</li>
          <li>Wähle Versand oder Abholung</li>
          <li>Zahle über PayPal</li>
          <li>Der Verkäufer wird dich kontaktieren</li>
        </ol>
      </div>
    )
  },
  {
    category: "Kaufen",
    question: "Welche Zahlungsmethoden gibt es?",
    answer: (
      <div>
        <p className="mb-2">
          Aktuell unterstützen wir nur <strong>PayPal</strong> für Online-Zahlungen.
        </p>
        <p className="mb-2">
          <strong>Bei Abholung:</strong> Barzahlung vor Ort möglich (Vereinbarung mit Verkäufer).
        </p>
        <p className="text-sm text-gray-600">
          <strong>Hinweis:</strong> Die Zahlung geht direkt an den Verkäufer, nicht an deimudda.
        </p>
      </div>
    )
  },
  {
    category: "Kaufen",
    question: "Was sind Preisvorschläge?",
    answer: (
      <div>
        <p className="mb-2">
          Verkäufer können bei ihren Listings die <strong>Preisvorschlag-Funktion</strong> aktivieren. 
          Als Käufer kannst du dann ein Angebot machen.
        </p>
        <p className="mb-2">
          <strong>Ablauf:</strong>
        </p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Du machst ein Angebot mit deinem Wunschpreis</li>
          <li>Der Verkäufer kann annehmen oder ablehnen</li>
          <li>Bei Annahme wird automatisch eine Transaktion erstellt</li>
          <li>Du wirst zur Zahlung weitergeleitet</li>
        </ol>
      </div>
    )
  },
  {
    category: "Kaufen",
    question: "Kann ich einen Kauf widerrufen?",
    answer: (
      <div>
        <p className="mb-2">
          <strong>Grundsätzlich ja</strong>, aber mit Einschränkungen bei lebenden Pflanzen.
        </p>
        <p className="mb-2">
          <strong>Wichtig:</strong> Der Widerruf erfolgt gegenüber dem <strong>Verkäufer</strong>, nicht gegenüber deimudda. 
          Kontaktdaten findest du auf der Produktseite.
        </p>
        <p className="mb-2">
          <strong>Ausschluss des Widerrufsrechts:</strong> Bei lebenden Pflanzen (Stecklinge) kann das Widerrufsrecht 
          ausgeschlossen sein (§ 312g Abs. 2 Nr. 2 BGB), besonders wenn die Verpackung bereits geöffnet wurde.
        </p>
        <p className="text-sm text-gray-600">
          Mehr Infos: <Link href="/widerruf" className="text-blue-600 hover:underline">Widerrufsbelehrung</Link>
        </p>
      </div>
    )
  },
  {
    category: "Kaufen",
    question: "Was mache ich bei Problemen mit einem Verkäufer?",
    answer: (
      <div>
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>Erst:</strong> Kontaktiere den Verkäufer direkt (Kontaktdaten auf Produktseite)</li>
          <li><strong>Dann:</strong> Falls keine Lösung, kontaktiere unseren Support: <a href="mailto:support@deimudda.de" className="text-blue-600 hover:underline">support@deimudda.de</a></li>
          <li><strong>Bei schwerwiegenden Verstößen:</strong> Wir können Maßnahmen gegen den Verkäufer ergreifen (z.B. Account-Sperrung)</li>
        </ol>
      </div>
    )
  },

  // Verkaufen
  {
    category: "Verkaufen",
    question: "Wie werde ich Verkäufer?",
    answer: (
      <div>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Registriere dich auf deimudda</li>
          <li>Gehe zu <strong>Dashboard → Verkäufer werden</strong></li>
          <li>Fülle das Verkäufer-Profil aus (Shop-Name, Beschreibung, Standort)</li>
          <li>Erstelle dein erstes Listing</li>
        </ol>
        <p className="mt-3 text-sm text-gray-600">
          <strong>Hinweis:</strong> Gewerbliche Verkäufer müssen ein eigenes Impressum und eine Datenschutzerklärung bereitstellen.
        </p>
      </div>
    )
  },
  {
    category: "Verkaufen",
    question: "Was kostet das Verkaufen?",
    answer: (
      <div>
        <p className="mb-2">
          Pro verkauftem Artikel fällt eine <strong>Plattformgebühr von €{PLATFORM_FEE.toFixed(2).replace('.', ',')}</strong> an.
        </p>
        <p className="mb-2">
          <strong>Bei Online-Zahlung (PayPal):</strong>
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>PayPal-Gebühr: ca. {(PAYPAL_FEE_PERCENTAGE * 100).toFixed(2)}% + €{PAYPAL_FEE_FIXED.toFixed(2).replace('.', ',')}</li>
          <li>Beispiel: Bei €20 Verkaufspreis → €{EXAMPLE_PAYPAL_FEE_20.replace('.', ',')} PayPal-Gebühr</li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
          <strong>Bei Abholung (Barzahlung):</strong> Nur die Plattformgebühr (€{PLATFORM_FEE.toFixed(2).replace('.', ',')}), keine PayPal-Gebühren.
        </p>
      </div>
    )
  },
  {
    category: "Verkaufen",
    question: "Wie erstelle ich ein Listing?",
    answer: (
      <div>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Gehe zu <strong>Verkäufer-Dashboard → Neues Listing</strong></li>
          <li>Fülle alle Pflichtfelder aus:
            <ul className="list-disc pl-6 mt-1">
              <li>Strain-Name (Sorte)</li>
              <li>Produkttyp (Steckling oder Samen)</li>
              <li>Preis</li>
              <li>Menge</li>
              <li>Beschreibung</li>
              <li>Bilder (mindestens 1)</li>
            </ul>
          </li>
          <li>Wähle Versandoptionen (Versand, Abholung oder beides)</li>
          <li>Optional: Aktiviere Preisvorschläge</li>
          <li>Klicke auf "Listing erstellen"</li>
        </ol>
      </div>
    )
  },
  {
    category: "Verkaufen",
    question: "Wie funktioniert die Auszahlung?",
    answer: (
      <div>
        <p className="mb-2">
          <strong>Bei Online-Zahlung (PayPal):</strong> Das Geld geht direkt auf dein PayPal-Konto (abzüglich Gebühren).
        </p>
        <p className="mb-2">
          <strong>Bei Abholung (Barzahlung):</strong> Du erhältst das Geld direkt vom Käufer. Die Plattformgebühr (€{PLATFORM_FEE.toFixed(2).replace('.', ',')}) 
          wird später von deinem PayPal-Konto abgebucht.
        </p>
        <p className="text-sm text-gray-600">
          <strong>Wichtig:</strong> Stelle sicher, dass dein PayPal-Konto ausreichend Guthaben für die Plattformgebühren hat.
        </p>
      </div>
    )
  },
  {
    category: "Verkaufen",
    question: "Muss ich als Verkäufer ein Impressum haben?",
    answer: (
      <div>
        <p className="mb-2">
          <strong>Gewerbliche Verkäufer: Ja!</strong> Du bist verpflichtet, ein eigenes Impressum und eine Datenschutzerklärung bereitzustellen.
        </p>
        <p className="mb-2">
          <strong>Private Verkäufer: Nein.</strong> Bei gelegentlichem Verkauf (z.B. Überschuss aus eigenem Anbau) ist kein Impressum erforderlich.
        </p>
        <p className="text-sm text-gray-600">
          <strong>Tipp:</strong> Bei Unsicherheit konsultiere einen Rechtsanwalt für IT-Recht.
        </p>
      </div>
    )
  },

  // Rechtliches
  {
    category: "Rechtliches",
    question: "Darf ich Cannabis-Blüten verkaufen?",
    answer: (
      <div>
        <p className="mb-2">
          <strong>Nein!</strong> Auf deimudda dürfen nur <strong>Stecklinge und Samen</strong> gehandelt werden.
        </p>
        <p className="mb-2">
          Der Verkauf von <strong>Blütenständen</strong> (Cannabis-Blüten, Ernteprodukte) ist <strong>nicht erlaubt</strong> 
          und verstößt gegen unsere Nutzungsbedingungen.
        </p>
        <p className="text-sm text-gray-600">
          <strong>Konsequenz:</strong> Verstöße führen zur sofortigen Account-Sperrung und ggf. Strafanzeige.
        </p>
      </div>
    )
  },
  {
    category: "Rechtliches",
    question: "Wie viele Pflanzen darf ich besitzen?",
    answer: (
      <div>
        <p className="mb-2">
          <strong>Private Nutzer:</strong> Maximal <strong>3 Pflanzen gleichzeitig</strong> (§ 3 Abs. 1 KCanG).
        </p>
        <p className="mb-2">
          <strong>Anbauvereinigungen:</strong> Andere Regelungen (siehe KCanG).
        </p>
        <p className="text-sm text-gray-600">
          <strong>Wichtig:</strong> deimudda übernimmt keine Haftung für Verstöße gegen das KCanG. 
          Informiere dich über die gesetzlichen Bestimmungen!
        </p>
      </div>
    )
  },
  {
    category: "Rechtliches",
    question: "Wer ist für Widerrufe zuständig?",
    answer: (
      <div>
        <p className="mb-2">
          <strong>Der Verkäufer</strong>, nicht deimudda!
        </p>
        <p className="mb-2">
          deimudda ist nur Vermittler. Der Kaufvertrag kommt direkt zwischen dir und dem Verkäufer zustande. 
          Für Widerrufe, Rücksendungen und Reklamationen ist der Verkäufer verantwortlich.
        </p>
        <p className="text-sm text-gray-600">
          Mehr Infos: <Link href="/widerruf" className="text-blue-600 hover:underline">Widerrufsbelehrung</Link>
        </p>
      </div>
    )
  },
  {
    category: "Rechtliches",
    question: "Wie werden meine Daten geschützt?",
    answer: (
      <div>
        <p className="mb-2">
          Wir nehmen Datenschutz ernst und halten uns an die <strong>DSGVO</strong>.
        </p>
        <p className="mb-2">
          <strong>Wichtig:</strong> Wenn du einen Kauf tätigst, werden deine Kontaktdaten an den Verkäufer übermittelt 
          (für Versand/Abholung). Der Verkäufer ist eigenständiger Datenverantwortlicher.
        </p>
        <p className="text-sm text-gray-600">
          Mehr Infos: <Link href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</Link>
        </p>
      </div>
    )
  },

  // Technisches
  {
    category: "Technisches",
    question: "Welche Browser werden unterstützt?",
    answer: (
      <div>
        <p className="mb-2">
          deimudda funktioniert mit allen modernen Browsern:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Chrome / Chromium (empfohlen)</li>
          <li>Firefox</li>
          <li>Safari</li>
          <li>Edge</li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Hinweis:</strong> Stelle sicher, dass JavaScript aktiviert ist und Cookies erlaubt sind.
        </p>
      </div>
    )
  },
  {
    category: "Technisches",
    question: "Ich habe einen Bug gefunden. Was tun?",
    answer: (
      <div>
        <p className="mb-2">
          Danke für deine Hilfe! Bitte melde Bugs an: <a href="mailto:support@deimudda.de" className="text-blue-600 hover:underline">support@deimudda.de</a>
        </p>
        <p className="mb-2">
          <strong>Bitte gib an:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Was ist passiert?</li>
          <li>Was hast du erwartet?</li>
          <li>Welcher Browser / welches Gerät?</li>
          <li>Screenshots (falls möglich)</li>
        </ul>
      </div>
    )
  },
  {
    category: "Technisches",
    question: "Gibt es eine mobile App?",
    answer: (
      <div>
        <p className="mb-2">
          Aktuell nicht, aber die Website ist <strong>mobilfreundlich</strong> (responsive Design).
        </p>
        <p className="text-sm text-gray-600">
          Du kannst deimudda problemlos auf deinem Smartphone oder Tablet nutzen.
        </p>
      </div>
    )
  }
  ];

  const categories = Array.from(new Set(faqData.map(item => item.category)));

  function FAQAccordion({ item }: { item: FAQItem }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition flex items-center justify-between"
        >
          <span className="font-semibold text-gray-900">{item.question}</span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
          )}
        </button>
        {isOpen && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-gray-700 prose prose-sm max-w-none">
              {item.answer}
            </div>
          </div>
        )}
      </div>
    );
  }

  const filteredFAQs = selectedCategory
    ? faqData.filter(item => item.category === selectedCategory)
    : faqData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" label="Zurück zur Startseite" />
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Häufig gestellte Fragen (FAQ)</h1>
          <p className="text-lg text-gray-700 mb-8">
            Hier findest du Antworten auf die häufigsten Fragen zu deimudda.
          </p>

          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">Kategorie filtern:</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === null
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Alle
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === category
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {filteredFAQs.map((item, index) => (
              <FAQAccordion key={index} item={item} />
            ))}
          </div>

          {/* Contact Hint */}
          <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <h3 className="text-lg font-bold text-green-900 mb-2">Deine Frage ist nicht dabei?</h3>
            <p className="text-green-800 mb-3">
              Kein Problem! Kontaktiere uns einfach:
            </p>
            <a
              href="/contact"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Zum Kontaktformular
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


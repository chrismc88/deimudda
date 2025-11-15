import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/BackButton";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" label="Zurück" />

        <h1 className="text-4xl font-bold mb-8">Nutzungsbedingungen & Rechtliche Hinweise</h1>

        <div className="space-y-6">
          {/* Disclaimer */}
          <Card className="border-l-4 border-red-500">
            <CardHeader>
              <CardTitle className="text-red-700">⚠️ Wichtiger Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Diese Plattform ist <strong>ausschließlich</strong> für den Handel mit Cannabis-Stecklingen und Samen gemäß des Konsumcannabisgesetzes (KCanG) bestimmt.
              </p>
              <p>
                Alle Nutzer verpflichten sich, die geltenden deutschen Gesetze einzuhalten. deimudda übernimmt <strong>keine Haftung</strong> für illegale Nutzung oder Verstöße gegen das KCanG durch Nutzer.
              </p>
            </CardContent>
          </Card>

          {/* Zulässige Produkte */}
          <Card>
            <CardHeader>
              <CardTitle>1. Zulässige Produkte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="font-semibold">Erlaubt:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cannabis-Stecklinge <strong>ohne Blütenstände</strong></li>
                <li>Cannabis-Samen</li>
                <li>Junge Pflanzen (Setzlinge) <strong>ohne Blütenentwicklung</strong></li>
              </ul>

              <p className="font-semibold mt-4">Nicht erlaubt:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Blüten oder Blütenstände</li>
                <li>Fruchtstände</li>
                <li>Verarbeitete Produkte (Öle, Extrakte, etc.)</li>
                <li>Getrocknete oder verarbeitete Pflanzenteile</li>
                <li>Alle anderen illegalen Waren</li>
              </ul>
            </CardContent>
          </Card>

          {/* Rechtliche Rahmenbedingungen */}
          <Card>
            <CardHeader>
              <CardTitle>2. Rechtliche Rahmenbedingungen (KCanG)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Das Konsumcannabisgesetz (KCanG) regelt den Anbau und Konsum von Cannabis in Deutschland. Diese Plattform operiert im Rahmen dieser Gesetze.
              </p>
              <p>
                <strong>Wichtig:</strong> Stecklinge und Samen sind gemäß aktueller Rechtsprechung <strong>nicht als Cannabis definiert</strong> und sind daher freiverkäuflich, solange sie keine Blütenstände aufweisen.
              </p>
              <p>
                Alle Nutzer sind selbst verantwortlich für die Einhaltung lokaler und regionaler Gesetze.
              </p>
            </CardContent>
          </Card>

          {/* Eigenverantwortung */}
          <Card>
            <CardHeader>
              <CardTitle>3. Eigenverantwortung der Nutzer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                <strong>Käufer und Verkäufer handeln in vollständiger Eigenverantwortung.</strong>
              </p>
              <p>
                Jeder Nutzer erklärt sich damit einverstanden, dass:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Er/Sie die Gesetze einhält und nur legale Produkte kauft/verkauft</li>
                <li>Er/Sie die Produkte nur für legale Zwecke nutzt</li>
                <li>Er/Sie mindestens 18 Jahre alt ist</li>
                <li>deimudda nicht verantwortlich für illegale Nutzung ist</li>
              </ul>
            </CardContent>
          </Card>

          {/* Altersbestätigung */}
          <Card>
            <CardHeader>
              <CardTitle>4. Altersbestätigung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Durch die Nutzung dieser Plattform bestätigen Sie, dass Sie <strong>mindestens 18 Jahre alt</strong> sind.
              </p>
              <p>
                deimudda behält sich das Recht vor, Nutzer zu sperren, die gegen diese Bedingung verstoßen.
              </p>
            </CardContent>
          </Card>

          {/* Haftungsausschluss */}
          <Card>
            <CardHeader>
              <CardTitle>5. Haftungsausschluss</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                <strong>deimudda übernimmt KEINE Haftung für:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Illegale Nutzung von Produkten durch Käufer</li>
                <li>Verstöße gegen das KCanG oder andere Gesetze</li>
                <li>Qualität oder Authentizität der angebotenen Produkte</li>
                <li>Lieferverzögerungen oder Versandprobleme</li>
                <li>Schäden durch unsachgemäße Lagerung oder Handhabung</li>
              </ul>
            </CardContent>
          </Card>

          {/* Kontakt */}
          <Card>
            <CardHeader>
              <CardTitle>6. Kontakt & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Bei Fragen zu den Nutzungsbedingungen oder rechtlichen Aspekten kontaktieren Sie uns über:
              </p>
              <p>
                <strong>E-Mail:</strong> support@deimudda.de
              </p>
              <p>
                <strong>Hinweis:</strong> Dies ist keine Rechtsberatung. Bei Fragen zu Ihrer spezifischen Situation konsultieren Sie bitte einen Rechtsanwalt.
              </p>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="text-xs text-gray-500 text-center py-4">
            <p>Zuletzt aktualisiert: Oktober 2025</p>
            <p>Diese Nutzungsbedingungen können jederzeit geändert werden.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


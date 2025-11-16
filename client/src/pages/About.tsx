
import BackButton from "@/components/BackButton";
import { useSiteName } from "@/_core/hooks/useSiteName";

export default function About() {
  const { siteName } = useSiteName();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" label="Zurück zur Startseite" />
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
            <h1 className="text-4xl font-bold mb-4">Über uns</h1>
            <p className="text-xl text-green-50">
              Mit Herz und Seele für biologischen Cannabis-Anbau
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Logos */}
            <div className="flex flex-wrap items-center justify-center gap-8 py-6 border-b">
              <img 
                src="/vaperge-logo.png" 
                alt="Vaperge Logo" 
                className="h-24 w-auto"
              />
              <img 
                src="/kalidad-logo.png" 
                alt="Kalidad Logo" 
                className="h-20 w-auto bg-white p-2 rounded"
              />
            </div>

            {/* Mission Statement */}
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
              <h2 className="text-2xl font-bold text-green-900 mb-3">Unsere Mission</h2>
              <p className="text-lg text-green-800 leading-relaxed">
                Wir möchten jedem ermöglichen, Cannabis in <strong>Kali-Qualität</strong> zu produzieren – 
                unabhängig von der Genetik. Denn Spitzenqualität ist keine Frage der Sorte, sondern eine Frage 
                der <strong>richtigen Anbau-Methodik</strong>.
              </p>
            </div>

            {/* Die Geschichte */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Die Geschichte von {siteName}</h2>
              
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                <p>
                  <strong>{siteName}</strong> ist mehr als nur eine Plattform – es ist das Ergebnis jahrelanger 
                  Leidenschaft, Forschung und Hingabe zum biologischen Cannabis-Anbau. Hinter {siteName} steht 
                  <strong> Vaperge - Eau de Terpènes</strong>, gegründet von Chris Rohleder, in enger Kooperation 
                  mit <strong>Kalidad - Grow- & Headshop</strong> in Malsch.
                </p>

                <p>
                  Was als Neugier und Experimentierfreude begann, entwickelte sich über die Jahre zu einer echten 
                  Expertise: Wir haben uns intensiv damit beschäftigt, wie man Cannabis <strong>biologisch</strong>, 
                  <strong>nachhaltig</strong> und in <strong>höchster Qualität</strong> anbauen kann – ohne auf 
                  synthetische Dünger oder aggressive Chemie zurückzugreifen.
                </p>
              </div>
            </section>

            {/* Der Cannabis-Foliant */}
            <section className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">📖 Der Cannabis-Foliant</h2>
              
              <div className="space-y-3 text-gray-700">
                <p>
                  Aus unserer jahrelangen Forschung und unzähligen Anbau-Experimenten entstand der 
                  <strong> Cannabis-Foliant</strong> – ein umfassendes Handbuch, das unser gesamtes Wissen 
                  über biologischen Cannabis-Anbau bündelt.
                </p>

                <p>
                  Der Foliant dokumentiert nicht nur Theorie, sondern <strong>praxiserprobte Methoden</strong>:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>Biologische Dünge-Schemata für verschiedene Wachstumsphasen</li>
                  <li>Natürliche Schädlingsbekämpfung ohne Chemie</li>
                  <li>Optimierung von Boden, Mikrobiologie und Nährstoffkreisläufen</li>
                  <li>Terpenen-Entwicklung und Aromaprofil-Optimierung</li>
                  <li>Ernte, Trocknung und Fermentation für maximale Qualität</li>
                </ul>

                <p className="text-sm text-amber-800 italic mt-4">
                  Der Foliant ist das Herzstück unserer Philosophie: Wissen teilen, damit jeder Grower 
                  sein volles Potenzial entfalten kann.
                </p>
              </div>
            </section>

            {/* Das Dünge-Schema */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🌱 Das ganzheitliche Grow-Konzept: Der Schlüssel zur Qualität</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Aus dem Cannabis-Folianten heraus haben wir ein <strong>ganzheitliches Grow-Konzept</strong> entwickelt, 
                  das auf rein <strong>biologischen Prinzipien</strong> basiert. Dieses Konzept ist das Ergebnis von 
                  Jahren des Experimentierens, Testens und Verfeinerns.
                </p>

                <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
                  <h3 className="font-bold text-green-900 mb-2">Die Philosophie dahinter:</h3>
                  <p className="text-green-800">
                    Spitzenqualität entsteht nicht durch teure Genetik oder High-Tech-Equipment, sondern durch 
                    <strong> Verständnis der biologischen Prozesse</strong>. Unser Grow-Konzept arbeitet mit der 
                    Natur, nicht gegen sie – und ermöglicht es jedem Grower, Premium-Qualität zu 
                    produzieren, egal welche Sorte angebaut wird.
                  </p>
                </div>

                <p>
                  Das Konzept umfasst:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Bodenbiologie:</strong> Aufbau eines gesunden Mikrobioms</li>
                  <li><strong>Nährstoff-Timing:</strong> Die richtige Düngung zur richtigen Zeit</li>
                  <li><strong>Organische Materialien:</strong> Kompost, Wurmhumus, Pflanzenjauchen</li>
                  <li><strong>Mineralien:</strong> Gesteinsmehl, Kalk, Spurenelemente</li>
                  <li><strong>Mikroorganismen:</strong> Mykorrhiza, Bakterien, Pilze</li>
                </ul>

                <p className="font-semibold text-green-700">
                  Das Ergebnis? Pflanzen, die nicht nur gesund wachsen, sondern <strong>Terpenen-Profile</strong> 
                  entwickeln, die höchste Qualitätsansprüche erfüllen – unabhängig von der Ausgangssorte.
                </p>
              </div>
            </section>

            {/* German Kali */}
            <section className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h2 className="text-2xl font-bold text-purple-900 mb-4">🌿 German Kali</h2>
              
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>German Kali</strong> steht für <strong>Qualität</strong> – echte, ehrliche, 
                  biologisch produzierte Qualität. Keine Abkürzungen, keine Chemie, keine Tricks. 
                  Nur <strong>ganzheitliches Grow-Konzept</strong>, das auf Verständnis der Natur basiert.
                </p>

                <p>
                  Unser Ansatz ist simpel: Mit der <strong>richtigen Methodik</strong> – biologischem Anbau, 
                  effektiven Mikroorganismen (EMs), einem durchdachten Nährstoff-Management und tiefem Verständnis 
                  der Bodenbiologie – wird aus <strong>jeder Genetik</strong> ein Premium-Produkt.
                </p>

                <p>
                  <strong>German Kali</strong> ist unsere Art zu zeigen: Man braucht keine überteuerten 
                  "Hype-Strains" oder synthetische Wundermittel. Was zählt, ist <strong>Methodik</strong>, 
                  <strong>Geduld</strong> und <strong>Respekt vor der Pflanze</strong>.
                </p>

                <div className="bg-purple-100 p-4 rounded mt-4">
                  <p className="text-purple-900 font-semibold">
                    💡 Kurz gesagt: <strong>German Kali</strong> bedeutet Spitzenqualität durch Methodik, 
                    nicht durch Genetik. Selbst aus einfachen Sorten wird mit unserem ganzheitlichen Grow-Konzept 
                    erstklassiges Cannabis.
                  </p>
                </div>
              </div>
            </section>

            {/* Die Vision */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Unsere Vision: Wissen teilen, Qualität demokratisieren</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Mit <strong>{siteName}</strong> wollen wir nicht nur Stecklinge und Samen vermitteln – wir wollen 
                  eine <strong>Community</strong> aufbauen, in der Wissen geteilt, Erfahrungen ausgetauscht und 
                  gemeinsam gelernt wird.
                </p>

                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">🌱</div>
                    <h3 className="font-bold text-blue-900 mb-2">Biologisch</h3>
                    <p className="text-sm text-blue-800">
                      Nur natürliche Methoden, keine synthetischen Chemikalien
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">🤝</div>
                    <h3 className="font-bold text-green-900 mb-2">Community</h3>
                    <p className="text-sm text-green-800">
                      Wissen teilen, voneinander lernen, gemeinsam wachsen
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">⭐</div>
                    <h3 className="font-bold text-purple-900 mb-2">Qualität</h3>
                    <p className="text-sm text-purple-800">
                      Kali-Standard für jeden – unabhängig von Budget oder Erfahrung
                    </p>
                  </div>
                </div>

                <p>
                  Wir glauben daran, dass <strong>jeder Grower</strong> – ob Anfänger oder Profi – in der Lage sein sollte, 
                  Cannabis in höchster Qualität zu produzieren. Dafür braucht es keine teuren Anlagen oder geheime Tricks, 
                  sondern nur das <strong>richtige Wissen</strong> und die <strong>richtige Methode</strong>.
                </p>

                <p className="font-semibold text-lg text-green-700">
                  Genau das bieten wir: <strong>Stecklinge</strong>, <strong>Wissen</strong> und eine 
                  <strong> Community</strong>, die mit Herz und Seele dabei ist.
                </p>
              </div>
            </section>

            {/* Das Team */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 Das Team</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <img 
                      src="/vaperge-logo.png" 
                      alt="Vaperge" 
                      className="h-16 w-auto"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Vaperge - Eau de Terpènes</h3>
                    <p className="text-gray-600">
                      Gegründet von Chris Rohleder. Spezialisiert auf Terpenen-Forschung, biologischen Anbau 
                      und die Entwicklung von Dünge-Schemata. Vaperge ist die treibende Kraft hinter dem 
                      Cannabis-Folianten und dem {siteName}-Projekt.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <img 
                      src="/kalidad-logo.png" 
                      alt="Kalidad" 
                      className="h-16 w-auto bg-white p-2 rounded"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Kalidad - Grow- & Headshop</h3>
                    <p className="text-gray-600">
                      Unser Partner in Malsch. Kalidad bringt jahrelange Erfahrung im Grow-Bereich mit und 
                      unterstützt die Community mit Fachwissen, Equipment und Beratung. Gemeinsam bilden wir 
                      ein starkes Team für biologischen Cannabis-Anbau.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Instagram: <a href="https://www.instagram.com/kalidad420/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@kalidad420</a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Warum deimudda? */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">❓ Warum "{siteName}"?</h2>
              
              <div className="space-y-3 text-gray-700">
                <p>
                  Der Name <strong>{siteName}</strong> ist eine liebevolle Anspielung auf die <strong>Mutterpflanzen</strong> 
                  (engl. "mother plants"), von denen Stecklinge geschnitten werden. Im Pfälzischen Dialekt wird daraus 
                  "dei Mudda" – deine Mutter.
                </p>

                <p>
                  Es ist ein Augenzwinkern, aber auch ein Statement: <strong>Respekt vor der Natur</strong>, 
                  <strong>Respekt vor der Pflanze</strong> und <strong>Respekt vor dem Handwerk</strong> des Anbaus.
                </p>

                <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-green-900 italic">
                    "Bei uns geht's nicht um schnelles Geld oder Massenproduktion. Bei uns geht's um Leidenschaft, 
                    Qualität und die Liebe zur Pflanze. Deimudda – weil jede gute Ernte mit einer guten Mutter beginnt." 
                    <span className="block mt-2 text-right font-semibold">– Das deimudda-Team</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 rounded-lg text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Werde Teil der Community!</h2>
              <p className="text-lg text-green-50 mb-6">
                Entdecke hochwertige Stecklinge, tausche dich mit Gleichgesinnten aus und lerne, 
                wie du Cannabis in Kali-Qualität produzierst.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="/browse" 
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
                >
                  Stecklinge entdecken
                </a>
                <a 
                  href="/register" 
                  className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition border-2 border-white"
                >
                  Jetzt registrieren
                </a>
              </div>
            </section>

            {/* Kontakt */}
            <section className="text-center text-gray-600">
              <p className="mb-2">Fragen? Anregungen? Feedback?</p>
              <p>
                Schreib uns: <a href="mailto:info@deimudda.de" className="text-green-600 hover:underline font-semibold">info@deimudda.de</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


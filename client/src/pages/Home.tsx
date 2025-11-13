import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Leaf, TrendingUp, Lock, Zap, Users } from "lucide-react";

// Dev-Login sichtbar machen: in DEV oder via .env Flag
const DEV_LOGIN_URL = "/api/dev-login?openId=dev-user&name=Dev%20User";
const SHOW_DEV = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEV_LOGIN === "true";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const activeListings = trpc.listing.getActive.useQuery({ limit: 6 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/seedling-logo.png" alt="deimudda Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-green-700">{APP_TITLE}</h1>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">Hallo, {user?.name}</span>
                <Link href="/profile">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()}>Logout</Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={() => (window.location.href = getLoginUrl())}>
                  Login / Registrieren
                </Button>
                {SHOW_DEV && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => (window.location.href = DEV_LOGIN_URL)}
                    title="Setzt lokal ein Session-Cookie"
                  >
                    Dev Login
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="flex justify-center mb-8">
          <img src="/seedling-logo.png" alt="Cannabis Stecklinge" className="h-32 w-auto" />
        </div>

        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Cannabis-Stecklinge & Samen
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Die erste legale Marktplattform für Cannabis-Vermehrungsmaterial in Deutschland.
          Kaufen und verkaufen Sie Stecklinge und Samen sicher und transparent.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/profile">
            <Button size="lg" className="gap-2">
              <Leaf className="w-5 h-5" />
              {isAuthenticated ? "Zum Dashboard" : "Als Verkäufer starten"}
            </Button>
          </Link>

          <Link href="/browse">
            <Button variant="outline" size="lg" className="gap-2">
              <ShoppingCart className="w-5 h-5" />
              Stecklinge kaufen
            </Button>
          </Link>

          {!isAuthenticated && SHOW_DEV && (
            <Button
              size="lg"
              variant="secondary"
              onClick={() => (window.location.href = DEV_LOGIN_URL)}
              title="Dev-Login Link (nur lokal sichtbar)"
            >
              Dev Login
            </Button>
          )}
        </div>

        {!isAuthenticated && SHOW_DEV && (
          <p className="mt-3 text-xs text-gray-500">
            Dev-Modus aktiv • <code>/api/dev-login</code> setzt ein Session-Cookie.
          </p>
        )}
      </section>

      {/* Legal Disclaimer */}
      <section className="bg-red-50 border-l-4 border-red-500 py-8 px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-red-900 mb-3">⚠️ Wichtiger Disclaimer</h2>
          <div className="text-sm text-red-800 space-y-2">
            <p>
              <strong>Rechtliche Rahmenbedingungen:</strong> Diese Plattform ist ausschließlich für den Handel mit Cannabis-Stecklingen und Samen gemäß des Konsumcannabisgesetzes (KCanG) bestimmt. Alle Nutzer verpflichten sich, die geltenden Gesetze einzuhalten.
            </p>
            <p>
              <strong>Zulässige Produkte:</strong> Es dürfen nur Stecklinge und Samen ohne Blütenstände, Fruchtstände oder andere Pflanzenteile mit Cannabinoid-Gehalt verkauft werden. Blüten, verarbeitete Produkte und andere illegale Waren sind streng verboten.
            </p>
            <p>
              <strong>Eigenverantwortung:</strong> Käufer und Verkäufer handeln in vollständiger Eigenverantwortung. deimudda übernimmt keine Haftung für illegale Nutzung oder Verstöße gegen das KCanG durch Nutzer.
            </p>
            <p>
              <strong>Altersangabe:</strong> Alle Nutzer bestätigen, dass sie mindestens 18 Jahre alt sind und die Nutzungsbedingungen akzeptieren.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Warum deimudda?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Lock className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>100% Legal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Stecklinge sind freiverkäufliches Vermehrungsmaterial und vollständig legal nach dem KCanG.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Einfach & Schnell</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Registrieren Sie sich, erstellen Sie ein Angebot und beginnen Sie zu verkaufen – in Minuten.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Faire Gebühren</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-600 font-medium">
                    Transparente Gebührenstruktur:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Plattformgebühr:</span>
                      <span className="font-semibold text-green-600">€0,42</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">PayPal-Gebühren:</span>
                      <span className="font-semibold text-blue-600">€0,89</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Bei Barzahlung:</span>
                        <span className="font-bold text-gray-800">€0,42</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-700 font-medium">Bei Online-Zahlung:</span>
                        <span className="font-bold text-gray-800">€1,31</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Keine versteckten Kosten. Alle Gebühren werden transparent angezeigt.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Verbinden Sie sich mit anderen Züchtern und Liebhabern. Teilen Sie Ihr Wissen.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShoppingCart className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Festpreis & Verhandlung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Entscheiden Sie flexibel zwischen Festpreis oder Verhandlungsbasis – ganz nach Ihrem Angebot.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Leaf className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Vielfalt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tausende von Sorten und Züchtern. Finden Sie genau das, was Sie suchen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Active Listings */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold mb-8">Aktuelle Angebote</h3>
        {activeListings.isLoading ? (
          <p className="text-gray-500">Lädt...</p>
        ) : activeListings.data && activeListings.data.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {activeListings.data.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                {listing.imageUrl && (
                  <img
                    src={listing.imageUrl}
                    alt={listing.strain}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{listing.strain}</CardTitle>
                  <CardDescription>
                    {listing.type === "cutting" ? "Steckling" : "Samen"} • {listing.quantity} verfügbar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{listing.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
                      {listing.priceType === "fixed"
                        ? `€${parseFloat(listing.fixedPrice as any).toFixed(2)}`
                        : listing.offerMinPrice
                        ? `Ab €${parseFloat(listing.offerMinPrice as any).toFixed(2)}`
                        : "Verhandlungsbasis"}
                    </span>
                    <Button size="sm" onClick={() => (window.location.href = `/listing/${listing.id}`)}>
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Noch keine Angebote vorhanden. Seien Sie der Erste!
          </p>
        )}
      </section>

      {/* CTA */}
      <section className="bg-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Bereit zu starten?</h3>
          <p className="text-lg mb-8 opacity-90">
            Werden Sie Teil der deimudda-Community und verdienen Sie mit Ihren Stecklingen.
          </p>

          {isAuthenticated ? (
            <Link href="/profile">
              <Button size="lg" variant="secondary">Zum Dashboard</Button>
            </Link>
          ) : (
            <div className="flex justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Jetzt registrieren
              </Button>
              {SHOW_DEV && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => (window.location.href = DEV_LOGIN_URL)}
                >
                  Dev Login
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ... (unverändert) */}
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 deimudda. Alle Rechte vorbehalten.</p>
            <p className="mt-2 text-xs">
              Stecklinge sind legales Vermehrungsmaterial nach dem Konsumcannabisgesetz (KCanG).
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

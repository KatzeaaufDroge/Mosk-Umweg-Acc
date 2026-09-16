export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-neutral-950 pt-24 sm:pt-32 pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 sm:mb-12">Impressum</h1>

        <div className="prose prose-invert max-w-none space-y-6 sm:space-y-8">
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">Unternehmen</h2>
            <div className="text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <p>MOSK unlimited – Einzelunternehmer</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">Geschäftssitz</h2>
            <div className="text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <p>Bahnhofstraße 16/1</p>
              <p>4780 St. Vith</p>
              <p>Belgien</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">Rechtliche Vertretung</h2>
            <div className="text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <p>Dmitriy Mamon</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">Unternehmensnummer (BCE/KBO)</h2>
            <div className="text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <p>BE1029443083</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">Umsatzsteuer-Identifikationsnummer</h2>
            <div className="text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <p>BE1029443083</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">Kontakt</h2>
            <div className="text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <p>E-Mail: <a href="mailto:d.mamon@moskunlimited.be" className="text-blue-400 hover:text-blue-300">d.mamon@moskunlimited.be</a></p>
              <p>Telefon: +32 472 80 44 61</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">Zuständige Aufsichtsbehörde</h2>
            <div className="text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <p>SPF Économie / FOD Economie – Belgien</p>
            </div>
          </section>

          <section className="pt-6 sm:pt-8 border-t border-gray-700">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4">Weitere Informationen</h2>
            <div className="flex flex-wrap gap-4">
              <a
                href="/agb"
                className="inline-flex items-center px-6 py-3 bg-[#22c55e] text-black font-semibold rounded-lg hover:bg-[#16a34a] transition-all duration-300 text-sm sm:text-base"
              >
                AGB
              </a>
              <a
                href="/datenschutz"
                className="inline-flex items-center px-6 py-3 bg-[#22c55e] text-black font-semibold rounded-lg hover:bg-[#16a34a] transition-all duration-300 text-sm sm:text-base"
              >
                Datenschutzerklärung
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

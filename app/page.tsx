import Link from 'next/link'
import { Receipt, TrendingDown, AlertTriangle, FileText, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-8 w-8 text-[#6366f1]" />
            <span className="text-xl font-bold text-slate-800">GastoTrack</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-[#6366f1]">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4f46e5]"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="mb-6 text-5xl font-bold text-slate-800">
            Controla tus gastos con{' '}
            <span className="text-[#6366f1]">OCR</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
            Escanea tus tickets y facturas, categoriza automáticamente tus gastos,
            establece presupuestos y recibe alertas cuando te acerques al límite.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-lg bg-[#6366f1] px-6 py-3 font-medium text-white transition hover:bg-[#4f46e5]"
            >
              Comenzar gratis <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-800">
            Todo lo que necesitas
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border p-6">
              <Receipt className="mb-4 h-10 w-10 text-[#6366f1]" />
              <h3 className="mb-2 text-lg font-semibold text-slate-800">OCR de Tickets</h3>
              <p className="text-sm text-slate-600">
                Escanea tus recibos yextrae automáticamente el monto y la fecha.
              </p>
            </div>
            <div className="rounded-xl border p-6">
              <TrendingDown className="mb-4 h-10 w-10 text-[#6366f1]" />
              <h3 className="mb-2 text-lg font-semibold text-slate-800">Categorización</h3>
              <p className="text-sm text-slate-600">
                Clasifica automáticamente tus gastos por categoría.
              </p>
            </div>
            <div className="rounded-xl border p-6">
              <AlertTriangle className="mb-4 h-10 w-10 text-[#6366f1]" />
              <h3 className="mb-2 text-lg font-semibold text-slate-800">Presupuestos</h3>
              <p className="text-sm text-slate-600">
                Establece límites mensuales yrecibe alertas及早.
              </p>
            </div>
            <div className="rounded-xl border p-6">
              <FileText className="mb-4 h-10 w-10 text-[#6366f1]" />
              <h3 className="mb-2 text-lg font-semibold text-slate-800">Reportes Fiscales</h3>
              <p className="text-sm text-slate-600">
                Exporta reportes para tu declaración de impuestos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          © 2026 GastoTrack. Demo-app.
        </div>
      </footer>
    </div>
  )
}
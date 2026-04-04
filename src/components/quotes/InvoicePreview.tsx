import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useApp, Quote } from '@/store/AppContext'

export function InvoicePreview({
  quote,
  open,
  onOpenChange,
}: {
  quote: Quote | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { settings, clients } = useApp()
  if (!quote) return null

  const client = clients.find((c) => c.id === quote.clientId) || {
    name: quote.clientName,
    document: '',
    address: '',
    email: '',
    phone: '',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white text-black print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-full print:w-full sm:max-h-[90vh] overflow-y-auto print:overflow-visible">
        <div className="flex justify-end print:hidden mb-4 border-b pb-4">
          <Button
            onClick={() => window.print()}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Printer className="w-4 h-4" /> Imprimir Nota / PDF
          </Button>
        </div>
        <div className="p-2 sm:p-8 space-y-8 print:p-0">
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-800">
                {settings.companyName || 'Empresa Padrão'}
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                CNPJ: {settings.companyDocument || 'Não informado'}
              </p>
              <p className="text-sm text-slate-500">{settings.companyAddress}</p>
              <p className="text-sm text-slate-500">
                {settings.companyPhone} • {settings.companyEmail}
              </p>
            </div>
            {settings.companyLogo && (
              <img
                src={settings.companyLogo}
                alt="Logo"
                className="w-24 h-24 object-contain rounded-md border p-1"
              />
            )}
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Tomador do Serviço / Cliente
            </h2>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-transparent print:border-none print:p-0">
              <p className="font-semibold text-lg text-slate-800">{client.name}</p>
              <p className="text-sm text-slate-600">Doc: {client.document || 'Não informado'}</p>
              <p className="text-sm text-slate-600">{client.address || 'Endereço não informado'}</p>
              <p className="text-sm text-slate-600">
                {client.phone} • {client.email}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-slate-600 mb-4 font-medium">
              <span>Documento Auxiliar - Pedido #{quote.id.slice(-6)}</span>
              <span>Emissão: {new Date(quote.date).toLocaleDateString('pt-BR')}</span>
            </div>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-600">
                  <th className="py-2 font-bold">Descrição dos Serviços / Peças</th>
                  <th className="py-2 font-bold text-center">Qtd</th>
                  <th className="py-2 font-bold text-right">Valor Unit.</th>
                  <th className="py-2 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-3">
                      <p className="font-semibold text-slate-800">{item.pieceName}</p>
                      <p className="text-xs text-slate-500">
                        Peso Estimado: {item.weight}g | Tempo: {item.timeHours}h
                      </p>
                    </td>
                    <td className="py-3 text-center text-slate-700">1</td>
                    <td className="py-3 text-right text-slate-700">
                      R$ {item.suggestedPrice.toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-medium text-slate-800">
                      R$ {item.suggestedPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4">
            <div className="w-full sm:w-1/2 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal:</span>
                <span>R$ {quote.suggestedPrice.toFixed(2)}</span>
              </div>
              {quote.finalPrice !== quote.suggestedPrice && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Ajuste/Desconto:</span>
                  <span>R$ {(quote.finalPrice - quote.suggestedPrice).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-slate-800 font-bold text-xl text-slate-800">
                <span>Total a Pagar:</span>
                <span>R$ {quote.finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-xs text-slate-400">
            <p>
              Este documento é uma representação visual de orçamento e não possui valor fiscal como
              Nota Fiscal Eletrônica (NF-e) a menos que emitido pelo sistema da SEFAZ.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

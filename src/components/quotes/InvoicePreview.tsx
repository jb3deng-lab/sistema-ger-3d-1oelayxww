import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, Mail, Download } from 'lucide-react'
import { useApp, Quote } from '@/store/AppContext'
import { getWhatsAppLink } from '@/lib/utils'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { useToast } from '@/hooks/use-toast'

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
  const { toast } = useToast()

  if (!quote) return null

  const client = clients.find((c) => c.id === quote.clientId) || {
    name: quote.clientName,
    document: '',
    address: '',
    email: '',
    phone: '',
  }

  const handleWhatsAppShare = () => {
    const companyName = settings?.companyName || 'nossa loja'
    const message = `Olá ${client.name}, segue o detalhamento do seu pedido #${quote.id.slice(
      -6,
    )} na ${companyName}.\nTotal: R$ ${quote.finalPrice.toFixed(2)}`

    const link = getWhatsAppLink(client.phone, message)

    if (!client.phone) {
      toast({
        title: 'Aviso',
        description: 'Cliente sem telefone cadastrado. Abrindo WhatsApp genérico.',
      })
    }

    window.open(link, '_blank')
  }

  const handleEmailShare = () => {
    const companyName = settings?.companyName || 'nossa loja'
    const subject = `Orçamento/Pedido #${quote.id.slice(-6)} - ${companyName}`
    const body = `Olá ${client.name},\n\nSegue o detalhamento do seu pedido #${quote.id.slice(-6)} na ${companyName}.\n\nTotal: R$ ${quote.finalPrice.toFixed(2)}\n\nObrigado pela preferência!`
    const mailto = `mailto:${client.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailto, '_blank')
  }

  const handleDownloadPDF = () => {
    toast({
      title: 'Dica para PDF',
      description: 'Na tela de impressão, selecione "Salvar como PDF" como destino.',
      duration: 5000,
    })
    setTimeout(() => window.print(), 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white text-black sm:max-h-[90vh] overflow-y-auto print:p-0 print:m-0 print:max-w-none print:w-full print:overflow-visible print:border-none print:shadow-none print:bg-white print:text-black">
        <DialogTitle className="sr-only">Visualização de Orçamento</DialogTitle>
        <style>{`
          @media print {
            @page { size: A4 portrait; margin: 15mm; }
            body > * { display: none !important; }
            body > [data-radix-portal] { display: block !important; }
            [data-radix-portal] > .fixed.inset-0 { display: none !important; }
            
            [role="dialog"] {
              position: relative !important;
              transform: none !important;
              left: auto !important;
              top: auto !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              max-height: none !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              background: white !important;
            }
            .print\\:hidden { display: none !important; }
          }
        `}</style>

        <div className="flex flex-wrap justify-end gap-2 print:hidden mb-4 border-b pb-4">
          <Button
            onClick={handleWhatsAppShare}
            variant="outline"
            className="gap-2 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10 border-[#25D366]/20"
          >
            <WhatsAppIcon className="w-4 h-4" /> WhatsApp
          </Button>
          <Button
            onClick={handleEmailShare}
            variant="outline"
            className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
          >
            <Mail className="w-4 h-4" /> E-mail
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <Download className="w-4 h-4" /> Baixar PDF
          </Button>
          <Button
            onClick={() => window.print()}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
        </div>

        <div id="printable-invoice" className="p-2 sm:p-8 space-y-8 print:p-0 print:space-y-6">
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 print:pb-4">
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
                {quote.items.map((item, idx) => {
                  const qty = item.quantity || 1
                  return (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-3">
                        <p className="font-semibold text-slate-800">{item.pieceName}</p>
                        <p className="text-xs text-slate-500">
                          Peso Estimado: {item.weight}g | Tempo: {item.timeHours}h
                        </p>
                      </td>
                      <td className="py-3 text-center text-slate-700">{qty}</td>
                      <td className="py-3 text-right text-slate-700">
                        R$ {item.suggestedPrice.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-medium text-slate-800">
                        R$ {(item.suggestedPrice * qty).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4">
            <div className="w-full sm:w-1/2 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal (Itens + Adicionais):</span>
                <span>R$ {(quote.finalPrice + (quote.discount || 0)).toFixed(2)}</span>
              </div>
              {!!quote.discount && quote.discount > 0 && (
                <div className="flex justify-between text-sm text-slate-600 text-red-600">
                  <span>Desconto:</span>
                  <span>- R$ {quote.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-slate-800 font-bold text-xl text-slate-800">
                <span>Total a Pagar:</span>
                <span>R$ {quote.finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {(quote as any).showComments && (quote as any).comments ? (
            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100 print:bg-transparent print:border-none print:p-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Observações
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {(quote as any).comments}
              </p>
            </div>
          ) : null}

          <div className="mt-12 pt-8 border-t text-center text-xs text-slate-400 print:mt-8 print:pt-4">
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

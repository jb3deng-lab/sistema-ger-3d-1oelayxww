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

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-invoice')
    if (!element) return

    const btn = document.getElementById('btn-download-pdf')
    const originalText = btn?.innerHTML
    if (btn) btn.innerHTML = '<span class="animate-pulse">Gerando...</span>'

    try {
      await new Promise((resolve, reject) => {
        if ((window as any).html2pdf) return resolve(true)
        const script = document.createElement('script')
        script.src =
          'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      const opt = {
        margin: 10,
        filename: `Orcamento_${quote.id.slice(-6)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }

      await (window as any).html2pdf().set(opt).from(element).save()
      toast({ title: 'Sucesso', description: 'Download do PDF iniciado.' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao gerar o PDF. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      if (btn && originalText) btn.innerHTML = originalText
    }
  }

  const handlePrint = () => {
    const element = document.getElementById('printable-invoice')
    if (!element) return

    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    document.body.appendChild(iframe)

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((style) => style.outerHTML)
      .join('\n')

    const iframeDoc = iframe.contentWindow?.document
    if (!iframeDoc) return

    iframeDoc.open()
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orcamento_${quote.id.slice(-6)}</title>
          ${styles}
          <style>
            @media print {
              @page { size: A4 portrait; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; }
              .print\\:hidden { display: none !important; }
              #printable-invoice { max-width: 100%; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body class="bg-white text-black p-8">
          ${element.outerHTML}
        </body>
      </html>
    `)
    iframeDoc.close()

    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white text-black sm:max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Visualização de Orçamento</DialogTitle>

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
            id="btn-download-pdf"
            onClick={handleDownloadPDF}
            variant="outline"
            className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <Download className="w-4 h-4" /> Baixar PDF
          </Button>
          <Button
            onClick={handlePrint}
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
                <span>Subtotal (Itens):</span>
                <span>R$ {quote.suggestedPrice.toFixed(2)}</span>
              </div>
              {(quote.packagingCost > 0 || quote.shippingCost > 0) && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Embalagem/Frete:</span>
                  <span>R$ {(quote.packagingCost + quote.shippingCost).toFixed(2)}</span>
                </div>
              )}
              {!!quote.salesFeeValue && quote.salesFeeValue > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Taxa Método Venda ({quote.salesMethod}):</span>
                  <span>+ R$ {quote.salesFeeValue.toFixed(2)}</span>
                </div>
              )}
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
            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100 prevent-break print:bg-transparent print:border-none print:p-0">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Observações
              </h3>
              <p className="text-sm text-slate-800 whitespace-pre-wrap">
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

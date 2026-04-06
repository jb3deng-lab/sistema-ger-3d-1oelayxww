import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, CheckCircle2, Printer } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { InvoicePreview } from '@/components/quotes/InvoicePreview'
import { getWhatsAppLink } from '@/lib/utils'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'

export default function Orders() {
  const { orders, quotes, updateOrderStatus, clients, settings } = useApp()
  const { toast } = useToast()
  const [invoiceQuote, setInvoiceQuote] = useState<any>(null)

  const handleWhatsAppShare = (quote: any) => {
    const client = clients.find((c) => c.id === quote.clientId)
    const clientName = client?.name || quote.clientName
    const phone = client?.phone
    const companyName = settings?.companyName || 'nossa loja'

    const message = `Olá ${clientName}, segue o detalhamento do seu pedido #${quote.id.slice(
      -6,
    )} na ${companyName}.\nTotal: R$ ${quote.finalPrice.toFixed(2)}`

    const link = getWhatsAppLink(phone, message)

    if (!phone) {
      toast({
        title: 'Aviso',
        description: 'Cliente sem telefone cadastrado. Abrindo WhatsApp genérico.',
      })
    }

    window.open(link, '_blank')
  }

  const handleStatusChange = (id: string, newStatus: any) => {
    updateOrderStatus(id, newStatus)
    if (newStatus === 'Finalizado') {
      toast({
        title: 'Produção Finalizada',
        description: 'Status do pedido atualizado para Finalizado.',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aguardando':
        return 'bg-amber-100 text-amber-800'
      case 'Em produção':
        return 'bg-indigo-100 text-indigo-800'
      case 'Finalizado':
        return 'bg-emerald-100 text-emerald-800'
      case 'Entregue':
        return 'bg-slate-200 text-slate-800'
      default:
        return 'bg-slate-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Pedidos em Produção</h2>
      </div>

      <InvoicePreview
        quote={invoiceQuote}
        open={!!invoiceQuote}
        onOpenChange={(o) => !o && setInvoiceQuote(null)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => {
          const quote = quotes.find((q) => q.id === order.quoteId)
          if (!quote) return null

          return (
            <Card
              key={order.id}
              className="border-none shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {quote.items[0]?.pieceName}{' '}
                      {quote.items.length > 1 && `(+${quote.items.length - 1})`}
                    </h3>
                    <p className="text-sm text-slate-500">{quote.clientName}</p>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />{' '}
                    {quote.items.reduce((acc, i) => acc + i.timeHours, 0)}h est.
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{' '}
                    {new Date(order.startDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1 font-medium text-slate-800 ml-auto">
                    R$ {quote.finalPrice.toFixed(2)}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Select
                    value={order.status}
                    onValueChange={(v) => handleStatusChange(order.id, v)}
                  >
                    <SelectTrigger className="flex-1 h-9 text-sm">
                      <SelectValue placeholder="Alterar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aguardando">Aguardando</SelectItem>
                      <SelectItem value="Em produção">Em produção</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                      <SelectItem value="Entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10 border-[#25D366]/20"
                    onClick={() => handleWhatsAppShare(quote)}
                    title="Compartilhar no WhatsApp"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => setInvoiceQuote(quote)}
                    title="Imprimir Nota"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {orders.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed">
            <CheckCircle2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p>Nenhum pedido no momento.</p>
          </div>
        )}
      </div>
    </div>
  )
}

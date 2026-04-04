import { useApp } from '@/store/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Orders() {
  const { orders, quotes, updateOrderStatus } = useApp()
  const { toast } = useToast()

  const handleStatusChange = (id: string, newStatus: any) => {
    updateOrderStatus(id, newStatus)
    if (newStatus === 'Finalizado') {
      toast({
        title: 'Produção Finalizada',
        description: 'Filamento deduzido e receita registrada.',
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
        <h2 className="text-2xl font-bold text-slate-800">Pedidos em Produção</h2>
      </div>

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
                    <h3 className="font-bold text-slate-800">{quote.pieceName}</h3>
                    <p className="text-sm text-slate-500">{quote.clientName}</p>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {quote.timeHours}h est.
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{' '}
                    {new Date(order.startDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1 font-medium text-slate-800 ml-auto">
                    R$ {quote.finalPrice.toFixed(2)}
                  </div>
                </div>

                <div className="pt-2">
                  <Select
                    value={order.status}
                    onValueChange={(v) => handleStatusChange(order.id, v)}
                  >
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="Alterar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aguardando">Aguardando</SelectItem>
                      <SelectItem value="Em produção">Em produção</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                      <SelectItem value="Entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
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

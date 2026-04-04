import { useState, useMemo } from 'react'
import { useApp } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Plus, TrendingUp, PackageSearch, Activity, AlertTriangle } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { DateRangePicker } from '@/components/DateRangePicker'
import { DateRange } from 'react-day-picker'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

export default function Index() {
  const { transactions, orders, quotes, filaments } = useApp()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  const filteredTransactions = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return transactions
    return transactions.filter((t) => {
      const d = new Date(t.date)
      return isWithinInterval(d, { start: dateRange.from!, end: dateRange.to! })
    })
  }, [transactions, dateRange])

  const entradas = filteredTransactions
    .filter((t) => t.type === 'Entrada')
    .reduce((sum, t) => sum + t.amount, 0)
  const saidas = filteredTransactions
    .filter((t) => t.type === 'Saída')
    .reduce((sum, t) => sum + t.amount, 0)
  const lucro = entradas - saidas

  const activeOrders = orders.filter((o) => o.status === 'Em produção' || o.status === 'Aguardando')
  const lowFilaments = filaments.filter((f) => f.currentWeight < 100)

  // Mock chart data - dynamically appending the filtered period at the end
  const chartData = [
    { name: 'Maio', Entradas: 400, Saídas: 240 },
    { name: 'Jun', Entradas: 300, Saídas: 139 },
    { name: 'Jul', Entradas: 200, Saídas: 980 },
    { name: 'Ago', Entradas: 278, Saídas: 390 },
    { name: 'Período', Entradas: entradas, Saídas: saidas },
  ]

  const chartConfig = {
    Entradas: { label: 'Entradas', color: 'hsl(160, 84%, 39%)' },
    Saídas: { label: 'Saídas', color: 'hsl(347, 77%, 50%)' },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold hidden sm:block text-foreground">Visão Geral</h2>
        <div className="w-full sm:w-auto">
          <DateRangePicker
            date={dateRange}
            setDate={setDateRange}
            className="w-full sm:w-[300px]"
          />
        </div>
      </div>

      {/* Mobile Quick Actions */}
      <div className="grid grid-cols-2 gap-4 md:hidden">
        <Link to="/quotes">
          <Button className="w-full h-14 rounded-xl flex gap-2">
            <Plus className="h-5 w-5" /> Orçamento
          </Button>
        </Link>
        <Link to="/inventory">
          <Button variant="outline" className="w-full h-14 rounded-xl flex gap-2">
            <Plus className="h-5 w-5" /> Filamento
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita (Período)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">R$ {entradas.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro (Período)
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">R$ {lucro.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos Ativos
            </CardTitle>
            <PackageSearch className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeOrders.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Filamentos Baixos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{lowFilaments.length}</div>
            <p className="text-xs text-rose-500 mt-1">
              {lowFilaments.length > 0 ? 'Atenção necessária' : 'Estoque ok'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 rounded-xl border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle>Visão Financeira</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="Entradas" fill="var(--color-Entradas)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Saídas" fill="var(--color-Saídas)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle>Fila de Produção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeOrders.slice(0, 4).map((order) => {
              const quote = quotes.find((q) => q.id === order.quoteId)
              if (!quote) return null
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="overflow-hidden">
                    <p className="font-medium text-sm text-foreground truncate">
                      {quote.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {quote.items.length} itens
                    </p>
                  </div>
                  <Badge
                    variant={order.status === 'Em produção' ? 'default' : 'secondary'}
                    className={
                      order.status === 'Em produção'
                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                        : ''
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              )
            })}
            {activeOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum pedido na fila
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

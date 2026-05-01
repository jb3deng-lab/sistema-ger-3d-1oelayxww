import { useState, useMemo } from 'react'
import { useApp } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Plus, Minus, TrendingUp, PackageSearch, Activity, AlertTriangle } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
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

  const quotesInPeriod = useMemo(
    () =>
      quotes.filter((q) => {
        if (!dateRange?.from || !dateRange?.to) return true
        return isWithinInterval(new Date(q.date), { start: dateRange.from, end: dateRange.to })
      }),
    [quotes, dateRange],
  )

  const quotesCriados = quotesInPeriod.length
  const quotesAprovados = quotesInPeriod.filter((q) => q.status === 'Aprovado').length

  const chartDataFinanceiro = useMemo(() => {
    const grouped = filteredTransactions.reduce(
      (acc, t) => {
        const day = new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        if (!acc[day]) acc[day] = { name: day, Entradas: 0, Saídas: 0 }
        if (t.type === 'Entrada') acc[day].Entradas += t.amount
        else acc[day].Saídas += t.amount
        return acc
      },
      {} as Record<string, any>,
    )
    const result = Object.values(grouped)
    if (result.length === 0) return [{ name: 'Período', Entradas: 0, Saídas: 0 }]
    return result
  }, [filteredTransactions])

  const chartDataFaturamento = useMemo(() => {
    const grouped = quotesInPeriod
      .filter((q) => q.status === 'Aprovado')
      .reduce(
        (acc, q) => {
          const day = new Date(q.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          })
          if (!acc[day]) acc[day] = { name: day, Faturamento: 0, Lucro: 0 }
          acc[day].Faturamento += q.finalPrice
          acc[day].Lucro += q.finalPrice - q.totalCosts.total
          return acc
        },
        {} as Record<string, any>,
      )
    const result = Object.values(grouped)
    if (result.length === 0) return [{ name: 'Período', Faturamento: 0, Lucro: 0 }]
    return result
  }, [quotesInPeriod])

  const [showProductionQueue, setShowProductionQueue] = useState(false)

  const configFinanceiro = {
    Entradas: { label: 'Entradas', color: 'hsl(160, 84%, 39%)' },
    Saídas: { label: 'Saídas', color: 'hsl(347, 77%, 50%)' },
  }
  const configFaturamento = {
    Faturamento: { label: 'Faturamento', color: 'hsl(217, 91%, 60%)' },
    Lucro: { label: 'Lucro', color: 'hsl(160, 84%, 39%)' },
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
              Faturamento (Aprovados)
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
              Orçamentos (Período)
            </CardTitle>
            <PackageSearch className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">{quotesCriados} Criados</div>
            <p className="text-xs text-muted-foreground">
              {quotesAprovados} Aprovados ({quotesCriados - quotesAprovados} pend./recus.)
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fila de Produção
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeOrders.length} Ativos</div>
            <p className="text-xs text-rose-500 mt-1">
              {lowFilaments.length > 0
                ? `${lowFilaments.length} filamentos na reserva`
                : 'Estoque ok'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle>Faturamento x Lucro</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={configFaturamento} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartDataFaturamento}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
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
                  <Line
                    type="monotone"
                    dataKey="Faturamento"
                    stroke="var(--color-Faturamento)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Lucro"
                    stroke="var(--color-Lucro)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle>Entradas x Saídas</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={configFinanceiro} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartDataFinanceiro}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
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
                  <Line
                    type="monotone"
                    dataKey="Entradas"
                    stroke="var(--color-Entradas)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Saídas"
                    stroke="var(--color-Saídas)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-none shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Fila de Produção</CardTitle>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowProductionQueue(!showProductionQueue)}
          >
            {showProductionQueue ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </CardHeader>
        {showProductionQueue && (
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
        )}
      </Card>
    </div>
  )
}

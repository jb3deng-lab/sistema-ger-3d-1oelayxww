import { useState, useMemo } from 'react'
import { useApp } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react'
import { DateRangePicker } from '@/components/DateRangePicker'
import { DateRange } from 'react-day-picker'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { Button } from '@/components/ui/button'

export default function Financial() {
  const { transactions, filaments, quotes } = useApp()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [hideTransactions, setHideTransactions] = useState(false)

  const filteredTransactions = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return transactions
    return transactions.filter((t) => {
      const d = new Date(t.date)
      return isWithinInterval(d, { start: dateRange.from!, end: dateRange.to! })
    })
  }, [transactions, dateRange])

  const totalEntradas = filteredTransactions
    .filter((t) => t.type === 'Entrada')
    .reduce((a, b) => a + b.amount, 0)
  const totalSaidas = filteredTransactions
    .filter((t) => t.type === 'Saída')
    .reduce((a, b) => a + b.amount, 0)
  const saldo = totalEntradas - totalSaidas

  const invRolls = filaments.length
  const invTotalKg = filaments.reduce((acc, f) => acc + f.currentWeight / 1000, 0)
  const invTotalValue = filaments.reduce(
    (acc, f) => acc + (f.currentWeight / 1000) * f.costPerKg,
    0,
  )

  // Group transactions by quoteId for better viewing
  const groupedList = useMemo(() => {
    const list: any[] = []
    const groups: Record<string, { entrada: number; saida: number; date: string; desc: string }> =
      {}

    filteredTransactions.forEach((t) => {
      if (t.quoteId) {
        if (!groups[t.quoteId])
          groups[t.quoteId] = {
            entrada: 0,
            saida: 0,
            date: t.date,
            desc: `Pedido #${t.quoteId.slice(-6)}`,
          }
        if (t.type === 'Entrada') groups[t.quoteId].entrada += t.amount
        else groups[t.quoteId].saida += t.amount
      } else {
        list.push({ isGroup: false, ...t })
      }
    })

    Object.entries(groups).forEach(([id, g]) => {
      const q = quotes.find((x) => x.id === id)
      list.push({
        isGroup: true,
        id,
        date: g.date,
        description: q ? `${g.desc} - ${q.clientName}` : g.desc,
        entrada: g.entrada,
        saida: g.saida,
      })
    })

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [filteredTransactions, quotes])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Financeiro</h2>
        <DateRangePicker date={dateRange} setDate={setDateRange} className="w-full sm:w-[300px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Entradas
              </span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <span className="text-3xl font-bold text-emerald-800 dark:text-emerald-300">
              R$ {totalEntradas.toFixed(2)}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 dark:bg-rose-950/20 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-rose-700 dark:text-rose-400">Saídas</span>
              <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-full">
                <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <span className="text-3xl font-bold text-rose-800 dark:text-rose-300">
              R$ {totalSaidas.toFixed(2)}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 dark:bg-slate-900 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-300">Saldo Líquido</span>
            </div>
            <span className="text-3xl font-bold text-white">R$ {saldo.toFixed(2)}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-card md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Resumo do Estoque (Filamentos)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center text-sm">
            <div>
              <span className="font-bold text-lg">{invRolls}</span> rolos
            </div>
            <div>
              <span className="font-bold text-lg">{invTotalKg.toFixed(1)}</span> kg totais
            </div>
            <div>
              Valor: <span className="font-bold text-primary">R$ {invTotalValue.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card">
        <div className="flex justify-between items-center p-4 border-b">
          <CardTitle className="text-lg">Movimentações</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setHideTransactions(!hideTransactions)}>
            {hideTransactions ? (
              <Eye className="w-4 h-4 mr-2" />
            ) : (
              <EyeOff className="w-4 h-4 mr-2" />
            )}
            {hideTransactions ? 'Mostrar' : 'Ocultar'}
          </Button>
        </div>
        {!hideTransactions && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Entrada</TableHead>
                  <TableHead className="text-right">Saída</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedList.map((t, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-muted-foreground w-32">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{t.description}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {t.isGroup
                        ? t.entrada > 0
                          ? `+ R$ ${t.entrada.toFixed(2)}`
                          : '-'
                        : t.type === 'Entrada'
                          ? `+ R$ ${t.amount.toFixed(2)}`
                          : '-'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-600 dark:text-rose-400">
                      {t.isGroup
                        ? t.saida > 0
                          ? `- R$ ${t.saida.toFixed(2)}`
                          : '-'
                        : t.type === 'Saída'
                          ? `- R$ ${t.amount.toFixed(2)}`
                          : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {groupedList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhuma movimentação no período selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}

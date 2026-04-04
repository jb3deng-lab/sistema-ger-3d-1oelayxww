import { useState, useMemo } from 'react'
import { useApp } from '@/store/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { DateRangePicker } from '@/components/DateRangePicker'
import { DateRange } from 'react-day-picker'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

export default function Financial() {
  const { transactions } = useApp()
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

  const totalEntradas = filteredTransactions
    .filter((t) => t.type === 'Entrada')
    .reduce((a, b) => a + b.amount, 0)
  const totalSaidas = filteredTransactions
    .filter((t) => t.type === 'Saída')
    .reduce((a, b) => a + b.amount, 0)
  const saldo = totalEntradas - totalSaidas

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

      <Card className="border-none shadow-sm bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground w-32">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{t.description}</TableCell>
                  <TableCell
                    className={`text-right font-bold ${t.type === 'Entrada' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                  >
                    {t.type === 'Entrada' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Nenhuma movimentação no período selecionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

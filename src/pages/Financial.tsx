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

export default function Financial() {
  const { transactions } = useApp()

  const totalEntradas = transactions
    .filter((t) => t.type === 'Entrada')
    .reduce((a, b) => a + b.amount, 0)
  const totalSaidas = transactions
    .filter((t) => t.type === 'Saída')
    .reduce((a, b) => a + b.amount, 0)
  const saldo = totalEntradas - totalSaidas

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Financeiro</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-emerald-700">Entradas</span>
              <div className="p-2 bg-emerald-100 rounded-full">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <span className="text-3xl font-bold text-emerald-800">
              R$ {totalEntradas.toFixed(2)}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-rose-700">Saídas</span>
              <div className="p-2 bg-rose-100 rounded-full">
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
              </div>
            </div>
            <span className="text-3xl font-bold text-rose-800">R$ {totalSaidas.toFixed(2)}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-300">Saldo Líquido</span>
            </div>
            <span className="text-3xl font-bold text-white">R$ {saldo.toFixed(2)}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-slate-500 w-32">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">{t.description}</TableCell>
                  <TableCell
                    className={`text-right font-bold ${t.type === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {t.type === 'Entrada' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                    Nenhuma movimentação registrada.
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

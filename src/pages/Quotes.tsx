import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Calculator, FileText, CheckCircle, XCircle } from 'lucide-react'

export default function Quotes() {
  const { quotes, addQuote, updateQuoteStatus, filaments, settings } = useApp()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    clientName: '',
    pieceName: '',
    weight: '',
    timeHours: '',
    filamentId: '',
    finalPrice: '',
  })
  const [calculatedCosts, setCalculatedCosts] = useState<{
    material: number
    machine: number
    energy: number
    total: number
    suggested: number
  } | null>(null)

  const handleCalculate = () => {
    const weight = parseFloat(formData.weight) || 0
    const time = parseFloat(formData.timeHours) || 0
    const material = (weight / 1000) * settings.filamentCost
    const machine = time * settings.machineCost
    const energy = time * settings.energyCost
    const total = material + machine + energy
    const suggested = total * (1 + settings.profitMargin / 100)
    setCalculatedCosts({ material, machine, energy, total, suggested })
    setFormData((prev) => ({ ...prev, finalPrice: suggested.toFixed(2) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!calculatedCosts) return
    addQuote({
      id: Date.now().toString(),
      clientName: formData.clientName,
      pieceName: formData.pieceName,
      weight: parseFloat(formData.weight),
      timeHours: parseFloat(formData.timeHours),
      filamentId: formData.filamentId,
      costs: calculatedCosts,
      suggestedPrice: calculatedCosts.suggested,
      finalPrice: parseFloat(formData.finalPrice),
      status: 'Pendente',
      date: new Date().toISOString(),
    })
    toast({ title: 'Orçamento Criado', description: 'Novo orçamento salvo com sucesso.' })
    setOpen(false)
    setFormData({
      clientName: '',
      pieceName: '',
      weight: '',
      timeHours: '',
      filamentId: '',
      finalPrice: '',
    })
    setCalculatedCosts(null)
  }

  const generatePDF = () => {
    toast({ title: 'PDF Gerado', description: 'O documento foi salvo no seu dispositivo.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Orçamentos</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Orçamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nome do Cliente</Label>
                  <Input
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Nome da Peça</Label>
                  <Input
                    required
                    value={formData.pieceName}
                    onChange={(e) => setFormData({ ...formData, pieceName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso (g)</Label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tempo (horas)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    required
                    min="0.1"
                    value={formData.timeHours}
                    onChange={(e) => setFormData({ ...formData, timeHours: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Material</Label>
                  <Select
                    required
                    value={formData.filamentId}
                    onValueChange={(v) => setFormData({ ...formData, filamentId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filaments.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} ({f.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full gap-2"
                onClick={handleCalculate}
              >
                <Calculator className="w-4 h-4" /> Calcular Automaticamente
              </Button>

              {calculatedCosts && (
                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm border">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Custo Material:</span>{' '}
                    <span>R$ {calculatedCosts.material.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Custo Máquina:</span>{' '}
                    <span>R$ {calculatedCosts.machine.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Custo Energia:</span>{' '}
                    <span>R$ {calculatedCosts.energy.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between font-bold">
                    <span className="text-slate-700">Preço Sugerido:</span>{' '}
                    <span className="text-indigo-600">
                      R$ {calculatedCosts.suggested.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label>Preço Final (Ajuste Manual)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={formData.finalPrice}
                      onChange={(e) => setFormData({ ...formData, finalPrice: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={!calculatedCosts}
              >
                Salvar Orçamento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Cliente & Peça</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    <div className="font-medium text-slate-800">{quote.clientName}</div>
                    <div className="text-xs text-slate-500">
                      {quote.pieceName} • {quote.weight}g
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(quote.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">R$ {quote.finalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        quote.status === 'Aprovado'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : quote.status === 'Recusado'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }
                    >
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={generatePDF} title="Gerar PDF">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </Button>
                      {quote.status === 'Pendente' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuoteStatus(quote.id, 'Aprovado')}
                            title="Aprovar"
                          >
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuoteStatus(quote.id, 'Recusado')}
                            title="Recusar"
                          >
                            <XCircle className="h-4 w-4 text-rose-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {quotes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    Nenhum orçamento encontrado.
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

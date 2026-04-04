import { useState, useMemo } from 'react'
import { useApp, QuoteItem } from '@/store/AppContext'
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
import { Calculator, FileText, CheckCircle, XCircle, Plus, Trash2, Edit } from 'lucide-react'

export default function Quotes() {
  const { quotes, addQuote, updateQuote, updateQuoteStatus, filaments, settings } = useApp()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [items, setItems] = useState<Array<Omit<QuoteItem, 'id' | 'costs' | 'suggestedPrice'>>>([])
  const [finalPrice, setFinalPrice] = useState('')
  const [status, setStatus] = useState<'Pendente' | 'Aprovado' | 'Recusado'>('Pendente')

  const handleOpenNew = () => {
    setEditingId(null)
    setClientName('')
    setItems([{ pieceName: '', weight: 0, timeHours: 0, filamentId: '' }])
    setFinalPrice('')
    setStatus('Pendente')
    setOpen(true)
  }

  const handleOpenEdit = (quote: any) => {
    setEditingId(quote.id)
    setClientName(quote.clientName)
    setItems(
      quote.items.map((i: any) => ({
        pieceName: i.pieceName,
        weight: i.weight,
        timeHours: i.timeHours,
        filamentId: i.filamentId,
      })),
    )
    setFinalPrice(quote.finalPrice.toString())
    setStatus(quote.status)
    setOpen(true)
  }

  const calculatedItems = useMemo(() => {
    return items.map((item, index) => {
      const filament = filaments.find((f) => f.id === item.filamentId)
      const costPerKg = filament ? filament.costPerKg : 150
      const weight = item.weight || 0
      const time = item.timeHours || 0

      const material = (weight / 1000) * costPerKg
      const machine = time * settings.machineCost
      const energy = time * settings.energyCost
      const total = material + machine + energy
      const suggestedPrice = total * (1 + settings.profitMargin / 100)

      return {
        ...item,
        id: `temp-${index}`,
        costs: { material, machine, energy, total },
        suggestedPrice,
      }
    })
  }, [items, filaments, settings])

  const totals = useMemo(() => {
    return calculatedItems.reduce(
      (acc, item) => ({
        material: acc.material + item.costs.material,
        machine: acc.machine + item.costs.machine,
        energy: acc.energy + item.costs.energy,
        total: acc.total + item.costs.total,
        suggestedPrice: acc.suggestedPrice + item.suggestedPrice,
      }),
      { material: 0, machine: 0, energy: 0, total: 0, suggestedPrice: 0 },
    )
  }, [calculatedItems])

  const handleApplySuggested = () => {
    setFinalPrice(totals.suggestedPrice.toFixed(2))
  }

  const handleAddItem = () => {
    setItems([...items, { pieceName: '', weight: 0, timeHours: 0, filamentId: '' }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      toast({ title: 'Erro', description: 'Adicione pelo menos um item.', variant: 'destructive' })
      return
    }

    const quoteData = {
      clientName,
      items: calculatedItems,
      totalCosts: {
        material: totals.material,
        machine: totals.machine,
        energy: totals.energy,
        total: totals.total,
      },
      suggestedPrice: totals.suggestedPrice,
      finalPrice: parseFloat(finalPrice) || totals.suggestedPrice,
      status,
      date: new Date().toISOString(),
    }

    if (editingId) {
      updateQuote(editingId, quoteData)
      toast({
        title: 'Orçamento Atualizado',
        description: 'As alterações foram salvas com sucesso.',
      })
    } else {
      addQuote({
        id: Date.now().toString(),
        ...quoteData,
      })
      toast({ title: 'Orçamento Criado', description: 'Novo orçamento salvo com sucesso.' })
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Orçamentos</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} className="w-full sm:w-auto">
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Orçamento' : 'Criar Orçamento'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Nome do Cliente</Label>
                  <Input
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                {editingId && (
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Aprovado">Aprovado</SelectItem>
                        <SelectItem value="Recusado">Recusado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Itens do Orçamento</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Peça
                  </Button>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3 relative border">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-6">
                      <div className="space-y-2">
                        <Label>Nome da Peça</Label>
                        <Input
                          required
                          value={item.pieceName}
                          onChange={(e) => updateItem(index, 'pieceName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Material</Label>
                        <Select
                          required
                          value={item.filamentId}
                          onValueChange={(v) => updateItem(index, 'filamentId', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {filaments.map((f) => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.name} (R$ {f.costPerKg}/kg)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Peso (g)</Label>
                        <Input
                          type="number"
                          required
                          min="1"
                          value={item.weight || ''}
                          onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tempo (horas)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          required
                          min="0.1"
                          value={item.timeHours || ''}
                          onChange={(e) =>
                            updateItem(index, 'timeHours', parseFloat(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo Material Total:</span>{' '}
                  <span>R$ {totals.material.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo Máquina Total:</span>{' '}
                  <span>R$ {totals.machine.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo Energia Total:</span>{' '}
                  <span>R$ {totals.energy.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold items-center">
                  <span className="text-foreground">Preço Sugerido Total:</span>{' '}
                  <div className="flex items-center gap-2">
                    <span className="text-primary">R$ {totals.suggestedPrice.toFixed(2)}</span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleApplySuggested}
                      title="Aplicar valor sugerido"
                    >
                      <Calculator className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Label>Preço Final a Cobrar</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={items.length === 0}>
                {editingId ? 'Salvar Alterações' : 'Salvar Orçamento'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium text-foreground">{quote.clientName}</TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground flex flex-col gap-1">
                      {quote.items.map((i, idx) => (
                        <span key={idx}>
                          {i.pieceName} ({i.weight}g)
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(quote.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">R$ {quote.finalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        quote.status === 'Aprovado'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                          : quote.status === 'Recusado'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400'
                      }
                    >
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(quote)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          toast({
                            title: 'PDF Gerado',
                            description: 'Documento com ' + quote.items.length + ' itens salvo.',
                          })
                        }
                        title="Gerar PDF"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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

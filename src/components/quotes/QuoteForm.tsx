import { useState, useMemo, useEffect } from 'react'
import { useApp, Quote, QuoteItem } from '@/store/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calculator, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type QuoteFormProps = { open: boolean; onOpenChange: (o: boolean) => void; editId: string | null }

export function QuoteForm({ open, onOpenChange, editId }: QuoteFormProps) {
  const { quotes, addQuote, updateQuote, filaments, machines, clients, settings } = useApp()
  const { toast } = useToast()

  const [clientId, setClientId] = useState('')
  const [items, setItems] = useState<Partial<QuoteItem>[]>([])
  const [finalPrice, setFinalPrice] = useState('')
  const [status, setStatus] = useState<'Pendente' | 'Aprovado' | 'Recusado'>('Pendente')

  useEffect(() => {
    if (open) {
      if (editId) {
        const q = quotes.find((x) => x.id === editId)
        if (q) {
          setClientId(q.clientId)
          setItems(q.items)
          setFinalPrice(q.finalPrice.toString())
          setStatus(q.status)
        }
      } else {
        setClientId('')
        setItems([{ pieceName: '', weight: 0, timeHours: 0, filamentId: '', machineId: '' }])
        setFinalPrice('')
        setStatus('Pendente')
      }
    }
  }, [open, editId, quotes])

  const calculatedItems = useMemo(() => {
    return items.map((item, index) => {
      const filament = filaments.find((f) => f.id === item.filamentId)
      const machine = machines.find((m) => m.id === item.machineId)
      const costPerKg = filament ? filament.costPerKg : settings.filamentCost
      const machineDepRate = machine ? machine.depreciationRate : settings.machineCost
      const weight = item.weight || 0
      const time = item.timeHours || 0
      const material = (weight / 1000) * costPerKg
      const machineCost = time * machineDepRate
      const energy = time * settings.energyCost
      const total = material + machineCost + energy
      const suggestedPrice = total * (1 + settings.profitMargin / 100)

      return {
        ...item,
        id: `temp-${index}`,
        costs: { material, machine: machineCost, energy, total },
        suggestedPrice,
      }
    }) as QuoteItem[]
  }, [items, filaments, machines, settings])

  const totals = useMemo(
    () =>
      calculatedItems.reduce(
        (acc, item) => ({
          material: acc.material + item.costs.material,
          machine: acc.machine + item.costs.machine,
          energy: acc.energy + item.costs.energy,
          total: acc.total + item.costs.total,
          suggestedPrice: acc.suggestedPrice + item.suggestedPrice,
        }),
        { material: 0, machine: 0, energy: 0, total: 0, suggestedPrice: 0 },
      ),
    [calculatedItems],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId)
      return toast({ title: 'Erro', description: 'Selecione um cliente.', variant: 'destructive' })
    if (items.length === 0)
      return toast({ title: 'Erro', description: 'Adicione itens.', variant: 'destructive' })

    const client = clients.find((c) => c.id === clientId)
    const quoteData: Omit<Quote, 'id'> = {
      clientId,
      clientName: client ? client.name : '',
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
    if (editId) {
      updateQuote(editId, quoteData)
      toast({ title: 'Orçamento Atualizado' })
    } else {
      addQuote({ id: Date.now().toString(), ...quoteData })
      toast({ title: 'Orçamento Criado' })
    }
    onOpenChange(false)
  }

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editId ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Cliente</Label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editId && (
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
              <h3 className="text-sm font-semibold">Itens da Impressão</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setItems([
                    ...items,
                    { pieceName: '', weight: 0, timeHours: 0, filamentId: '', machineId: '' },
                  ])
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3 relative border">
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive"
                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pr-6">
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Peça</Label>
                    <Input
                      required
                      value={item.pieceName || ''}
                      onChange={(e) => updateItem(index, 'pieceName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-1">
                    <Label>Peso (g)</Label>
                    <Input
                      type="number"
                      required
                      min="1"
                      value={item.weight || ''}
                      onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-1">
                    <Label>Tempo (h)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      required
                      min="0.1"
                      value={item.timeHours || ''}
                      onChange={(e) => updateItem(index, 'timeHours', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Filamento</Label>
                    <Select
                      required
                      value={item.filamentId || ''}
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
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Máquina</Label>
                    <Select
                      required
                      value={item.machineId || ''}
                      onValueChange={(v) => updateItem(index, 'machineId', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} (R$ {m.depreciationRate.toFixed(2)}/h)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm border">
            <div className="flex justify-between text-muted-foreground">
              <span>Material: R$ {totals.material.toFixed(2)}</span>
              <span>Máquina: R$ {totals.machine.toFixed(2)}</span>
              <span>Energia: R$ {totals.energy.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t flex justify-between font-bold items-center">
              <span>Preço Sugerido:</span>
              <div className="flex items-center gap-2">
                <span className="text-primary">R$ {totals.suggestedPrice.toFixed(2)}</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setFinalPrice(totals.suggestedPrice.toFixed(2))}
                >
                  <Calculator className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Label>Preço Final Cobrado</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Salvar Orçamento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

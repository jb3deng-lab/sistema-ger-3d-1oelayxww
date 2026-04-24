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
  const [discount, setDiscount] = useState('0')
  const [packagingCost, setPackagingCost] = useState('0')
  const [shippingCost, setShippingCost] = useState('0')
  const [finalPrice, setFinalPrice] = useState('')
  const [status, setStatus] = useState<'Pendente' | 'Aprovado' | 'Recusado'>('Pendente')

  useEffect(() => {
    if (open) {
      if (editId) {
        const q = quotes.find((x) => x.id === editId)
        if (q) {
          setClientId(q.clientId)
          setItems(q.items)
          setDiscount(q.discount?.toString() || '0')
          setPackagingCost(q.packagingCost?.toString() || '0')
          setShippingCost(q.shippingCost?.toString() || '0')
          setFinalPrice(q.finalPrice.toString())
          setStatus(q.status)
        }
      } else {
        setClientId('')
        setItems([
          { pieceName: '', weight: 0, timeHours: 0, quantity: 1, filamentId: '', machineId: '' },
        ])
        setDiscount('0')
        setPackagingCost('0')
        setShippingCost('0')
        setFinalPrice('')
        setStatus('Pendente')
      }
    }
  }, [open, editId, quotes])

  const calculatedItems = useMemo(() => {
    return items.map((item, index) => {
      const filament = filaments.find((f) => f.id === item.filamentId)
      const machine = machines.find((m) => m.id === item.machineId)
      const costPerKg = filament ? filament.costPerKg : 150
      const machineDepRate = machine ? machine.depreciationRate : settings.machineCost
      const powerWatts = machine ? machine.powerWatts : 0
      const weight = item.weight || 0
      const time = item.timeHours || 0

      const material = (weight / 1000) * costPerKg
      const machineCost = time * machineDepRate
      const energy = time * (powerWatts / 1000) * settings.energyCost

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
        (acc, item) => {
          const qty = item.quantity || 1
          return {
            material: acc.material + item.costs.material * qty,
            machine: acc.machine + item.costs.machine * qty,
            energy: acc.energy + item.costs.energy * qty,
            total: acc.total + item.costs.total * qty,
            suggestedPrice: acc.suggestedPrice + item.suggestedPrice * qty,
          }
        },
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
    const discountVal = parseFloat(discount) || 0
    const packVal = parseFloat(packagingCost) || 0
    const shipVal = parseFloat(shippingCost) || 0

    const baseSubtotal = totals.suggestedPrice + packVal + shipVal
    const finalPriceVal = parseFloat(finalPrice) || Math.max(0, baseSubtotal - discountVal)

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
      packagingCost: packVal,
      shippingCost: shipVal,
      discount: discountVal,
      finalPrice: finalPriceVal,
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
    const currentItem = newItems[index]

    if (field === 'filamentId' || field === 'quantity' || field === 'weight') {
      const filId = field === 'filamentId' ? value : currentItem.filamentId
      const qty = field === 'quantity' ? value : currentItem.quantity || 1
      const w = field === 'weight' ? value : currentItem.weight || 0

      if (filId) {
        const filament = filaments.find((f) => f.id === filId)
        if (filament && filament.currentWeight < w * qty) {
          alert(
            `Atenção: Estoque insuficiente! Restam ${filament.currentWeight.toFixed(0)}g deste filamento.`,
          )
        }
      }
    }

    newItems[index] = { ...currentItem, [field]: value }
    setItems(newItems)
  }

  const recalculateFinalPrice = () => {
    const packVal = parseFloat(packagingCost) || 0
    const shipVal = parseFloat(shippingCost) || 0
    const d = parseFloat(discount) || 0
    const base = totals.suggestedPrice + packVal + shipVal
    setFinalPrice(Math.max(0, base - d).toFixed(2))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editId ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
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
                    {
                      pieceName: '',
                      weight: 0,
                      timeHours: 0,
                      quantity: 1,
                      filamentId: '',
                      machineId: '',
                    },
                  ])
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar Peça
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
                    onClick={() => {
                      if (window.confirm('Excluir este item?'))
                        setItems(items.filter((_, i) => i !== index))
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 pr-6">
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Peça</Label>
                    <Input
                      required
                      value={item.pieceName || ''}
                      onChange={(e) => updateItem(index, 'pieceName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-1">
                    <Label>Qtd</Label>
                    <Input
                      type="number"
                      required
                      min="1"
                      value={item.quantity || 1}
                      onChange={(e) =>
                        updateItem(index, 'quantity', parseInt(e.target.value, 10) || 1)
                      }
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
                  <div className="space-y-2 lg:col-span-2">
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
                  <div className="space-y-2 lg:col-span-3">
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
                            {f.name} (R$ {f.costPerKg}/kg) - {f.currentWeight.toFixed(0)}g disp.
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 lg:col-span-3">
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

          <div className="bg-muted p-4 rounded-lg space-y-4 text-sm border">
            <div className="flex justify-between text-muted-foreground pb-2 border-b border-border/50">
              <span>Material: R$ {totals.material.toFixed(2)}</span>
              <span>Máquina: R$ {totals.machine.toFixed(2)}</span>
              <span>Energia: R$ {totals.energy.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Embalagem (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={packagingCost}
                  onChange={(e) => {
                    setPackagingCost(e.target.value)
                  }}
                  onBlur={recalculateFinalPrice}
                />
              </div>
              <div className="space-y-2">
                <Label>Frete (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => {
                    setShippingCost(e.target.value)
                  }}
                  onBlur={recalculateFinalPrice}
                />
              </div>
              <div className="space-y-2">
                <Label>Desconto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => {
                    setDiscount(e.target.value)
                  }}
                  onBlur={recalculateFinalPrice}
                />
              </div>
              <div className="space-y-2 bg-primary/5 p-2 rounded border border-primary/20">
                <div className="flex items-center justify-between">
                  <Label className="text-primary font-bold">Total Cobrado</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-5 h-5 -mt-1 text-primary hover:bg-primary/20"
                    title="Calcular automático"
                    onClick={recalculateFinalPrice}
                  >
                    <Calculator className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  className="font-bold bg-white dark:bg-black"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-muted-foreground">
              <span>Peças Base: R$ {totals.suggestedPrice.toFixed(2)}</span>
              <span>Margem de Lucro: {settings.profitMargin}%</span>
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

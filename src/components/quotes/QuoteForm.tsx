import { useState, useMemo, useEffect } from 'react'
import { useApp, Quote, QuoteItem, Product } from '@/store/AppContext'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

type QuoteFormProps = { open: boolean; onOpenChange: (o: boolean) => void; editId: string | null }

export function QuoteForm({ open, onOpenChange, editId }: QuoteFormProps) {
  const { quotes, addQuote, updateQuote, filaments, machines, clients, settings, products } =
    useApp()
  const { toast } = useToast()

  const [clientId, setClientId] = useState('')
  const [items, setItems] = useState<Partial<QuoteItem>[]>([])
  const [discount, setDiscount] = useState('0')
  const [packagingCost, setPackagingCost] = useState('0')
  const [shippingCost, setShippingCost] = useState('0')
  const [salesMethod, setSalesMethod] = useState(settings.salesMethods[0]?.name || '')
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
          setSalesMethod(q.salesMethod || settings.salesMethods[0]?.name || '')
          setFinalPrice(q.finalPrice.toString())
          setStatus(q.status)
        }
      } else {
        setClientId('')
        setItems([
          {
            pieceName: '',
            machineId: '',
            quantity: 1,
            materials: [],
            extraComponents: [],
            timeHours: 0,
            prepTimeHours: 0,
          },
        ])
        setDiscount('0')
        setPackagingCost('0')
        setShippingCost('0')
        setSalesMethod(settings.salesMethods[0]?.name || '')
        setFinalPrice('')
        setStatus('Pendente')
      }
    }
  }, [open, editId, quotes, settings])

  const calculatedItems = useMemo(() => {
    return items.map((item, index) => {
      const machine = machines.find((m) => m.id === item.machineId)
      const machineDepRate = machine ? machine.depreciationRate : settings.machineCost
      const powerWatts = machine ? machine.powerWatts : 0

      const time = item.timeHours || 0
      const prepTime = item.prepTimeHours || 0

      let materialCost = 0
      item.materials?.forEach((m) => {
        const f = filaments.find((fil) => fil.id === m.filamentId)
        if (f) materialCost += (m.weight / 1000) * f.costPerKg
      })

      let extraCost = 0
      item.extraComponents?.forEach((c) => (extraCost += c.cost))

      const machineCost = time * machineDepRate
      const energy = time * (powerWatts / 1000) * settings.energyCost
      const operatorCost = prepTime * settings.operatorHourCost

      const total = materialCost + machineCost + energy + operatorCost + extraCost
      const margin = item.profitMargin != null ? item.profitMargin : settings.profitMargin
      const suggestedPrice = total * (1 + margin / 100)

      return {
        ...item,
        id: `temp-${index}`,
        costs: {
          material: materialCost,
          machine: machineCost,
          energy,
          operator: operatorCost,
          extra: extraCost,
          total,
        },
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
            operator: acc.operator + item.costs.operator * qty,
            extra: acc.extra + item.costs.extra * qty,
            total: acc.total + item.costs.total * qty,
            suggestedPrice: acc.suggestedPrice + item.suggestedPrice * qty,
          }
        },
        { material: 0, machine: 0, energy: 0, operator: 0, extra: 0, total: 0, suggestedPrice: 0 },
      ),
    [calculatedItems],
  )

  const feeData = useMemo(() => {
    const sm = settings.salesMethods.find((m) => m.name === salesMethod)
    const feePercent = sm ? sm.fee : 0
    const packVal = parseFloat(packagingCost) || 0
    const shipVal = parseFloat(shippingCost) || 0
    const baseSubtotal = totals.suggestedPrice + packVal + shipVal
    const feeValue = baseSubtotal * (feePercent / 100)
    return { feePercent, feeValue, subtotalWithFee: baseSubtotal + feeValue }
  }, [salesMethod, settings, totals, packagingCost, shippingCost])

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

    const finalPriceVal =
      parseFloat(finalPrice) || Math.max(0, feeData.subtotalWithFee - discountVal)

    const quoteData: any = {
      clientId,
      clientName: client ? client.name : '',
      items: calculatedItems,
      totalCosts: {
        material: totals.material,
        machine: totals.machine,
        energy: totals.energy,
        operator: totals.operator,
        extra: totals.extra,
        total: totals.total,
      },
      suggestedPrice: totals.suggestedPrice,
      packagingCost: packVal,
      shippingCost: shipVal,
      discount: discountVal,
      salesMethod,
      salesFeePercent: feeData.feePercent,
      salesFeeValue: feeData.feeValue,
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

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId)
    if (!prod) return
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      productId,
      pieceName: prod.name,
      timeHours: prod.printTimeMins / 60,
      prepTimeHours: prod.prepTimeMins / 60,
      materials: [...prod.materials],
      extraComponents: [...prod.extraComponents],
      profitMargin: prod.profitMargin || undefined,
    }
    setItems(newItems)
  }

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const recalculateFinalPrice = () => {
    const d = parseFloat(discount) || 0
    setFinalPrice(Math.max(0, feeData.subtotalWithFee - d).toFixed(2))
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
              <h3 className="text-sm font-semibold">Itens do Orçamento</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setItems([
                    ...items,
                    {
                      pieceName: '',
                      machineId: '',
                      quantity: 1,
                      materials: [],
                      extraComponents: [],
                      timeHours: 0,
                      prepTimeHours: 0,
                    },
                  ])
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar Produto
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 pr-6">
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Produto Base</Label>
                    <Select
                      value={item.productId || ''}
                      onValueChange={(v) => handleProductSelect(index, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Nome Custom (opcional)</Label>
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
                    <Label>Máquina</Label>
                    <Select
                      required
                      value={item.machineId || ''}
                      onValueChange={(v) => updateItem(index, 'machineId', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="..." />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
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
            <div className="flex flex-wrap gap-4 text-muted-foreground pb-2 border-b border-border/50 text-xs">
              <span>Materiais: R$ {totals.material.toFixed(2)}</span>
              <span>Extras: R$ {totals.extra.toFixed(2)}</span>
              <span>Máquina: R$ {totals.machine.toFixed(2)}</span>
              <span>Energia: R$ {totals.energy.toFixed(2)}</span>
              <span>Operador: R$ {totals.operator.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Embalagem (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(e.target.value)}
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
                  onChange={(e) => setShippingCost(e.target.value)}
                  onBlur={recalculateFinalPrice}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Método de Venda (Taxa)</Label>
                <Select
                  value={salesMethod}
                  onValueChange={(v) => {
                    setSalesMethod(v)
                    recalculateFinalPrice()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.salesMethods.map((m) => (
                      <SelectItem key={m.name} value={m.name}>
                        {m.name} ({m.fee}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Desconto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  onBlur={recalculateFinalPrice}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-muted-foreground">
              <span>Peças Base: R$ {totals.suggestedPrice.toFixed(2)}</span>
              <span>Taxa Venda: R$ {feeData.feeValue.toFixed(2)}</span>
            </div>

            <div className="space-y-2 bg-primary/5 p-2 rounded border border-primary/20 mt-2">
              <div className="flex items-center justify-between">
                <Label className="text-primary font-bold">Total Cobrado</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-5 h-5 -mt-1 text-primary"
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
          <Button type="submit" className="w-full">
            Salvar Orçamento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

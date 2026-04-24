import { useState, useMemo } from 'react'
import { useApp, Machine, MaintenanceItem } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Calculator, Settings2 } from 'lucide-react'

export default function Machines() {
  const { machines, addMachine, updateMachine, deleteMachine } = useApp()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    purchaseValue: '',
    usefulLifeHours: '',
    powerWatts: '',
  })

  const [maintenanceItems, setMaintenanceItems] = useState<Partial<MaintenanceItem>[]>([])

  const handleOpen = (machine?: Machine) => {
    if (machine) {
      setEditingId(machine.id)
      setFormData({
        name: machine.name,
        purchaseValue: machine.purchaseValue.toString(),
        usefulLifeHours: machine.usefulLifeHours.toString(),
        powerWatts: machine.powerWatts.toString(),
      })
      setMaintenanceItems(machine.maintenanceItems || [])
    } else {
      setEditingId(null)
      setFormData({ name: '', purchaseValue: '', usefulLifeHours: '', powerWatts: '' })
      setMaintenanceItems([])
    }
    setOpen(true)
  }

  const calculatedDepreciation = useMemo(() => {
    const pVal = parseFloat(formData.purchaseValue) || 0
    const uLife = parseFloat(formData.usefulLifeHours) || 1
    const base = pVal / uLife

    const partsCost = maintenanceItems.reduce((acc, item) => {
      const c = Number(item.cost) || 0
      const lh = Number(item.lifeHours) || 1
      return acc + c / lh
    }, 0)

    return base + partsCost
  }, [formData, maintenanceItems])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pVal = parseFloat(formData.purchaseValue) || 0
    const uLife = parseFloat(formData.usefulLifeHours) || 1
    const pWatts = parseFloat(formData.powerWatts) || 0
    const depRate = calculatedDepreciation

    const validItems = maintenanceItems.map((item, idx) => ({
      id: item.id || `part-${Date.now()}-${idx}`,
      name: item.name || 'Peça sem nome',
      description: item.description || '',
      code: item.code || '',
      cost: Number(item.cost) || 0,
      lifeHours: Number(item.lifeHours) || 1,
    }))

    if (editingId) {
      updateMachine(editingId, {
        name: formData.name,
        purchaseValue: pVal,
        usefulLifeHours: uLife,
        depreciationRate: depRate,
        powerWatts: pWatts,
        maintenanceItems: validItems,
      })
    } else {
      addMachine({
        id: Date.now().toString(),
        name: formData.name,
        purchaseValue: pVal,
        usefulLifeHours: uLife,
        depreciationRate: depRate,
        powerWatts: pWatts,
        maintenanceItems: validItems,
      })
    }
    setOpen(false)
  }

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        'Tem certeza que deseja excluir esta máquina? Isso afetará apenas os próximos orçamentos.',
      )
    ) {
      deleteMachine(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Minhas Impressoras 3D (Frota)</h2>
          <p className="text-muted-foreground text-sm">
            Gerencie suas máquinas e calcule custos precisos (depreciação e peças).
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Nova Máquina
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Máquina' : 'Nova Máquina'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Modelo / Nome da Máquina</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Ender 3 V2"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Potência (Watts)</Label>
                <Input
                  type="number"
                  required
                  value={formData.powerWatts}
                  onChange={(e) => setFormData({ ...formData, powerWatts: e.target.value })}
                  placeholder="Ex: 350"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor de Compra (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.purchaseValue}
                  onChange={(e) => setFormData({ ...formData, purchaseValue: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Vida Útil Estimada (Horas)</Label>
                <Input
                  type="number"
                  required
                  value={formData.usefulLifeHours}
                  onChange={(e) => setFormData({ ...formData, usefulLifeHours: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Peças de Reposição
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMaintenanceItems([
                      ...maintenanceItems,
                      { name: '', description: '', code: '', cost: 0, lifeHours: 1 },
                    ])
                  }
                >
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Peça
                </Button>
              </div>

              {maintenanceItems.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhuma peça de reposição recorrente adicionada (ex: bicos, hotends).
                </p>
              )}

              {maintenanceItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-muted/30 border rounded-lg space-y-3 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 text-destructive h-6 w-6"
                    onClick={() =>
                      setMaintenanceItems(maintenanceItems.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pr-6">
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">Nome da Peça</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => {
                          const newItems = [...maintenanceItems]
                          newItems[idx].name = e.target.value
                          setMaintenanceItems(newItems)
                        }}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Código</Label>
                      <Input
                        value={item.code}
                        onChange={(e) => {
                          const newItems = [...maintenanceItems]
                          newItems[idx].code = e.target.value
                          setMaintenanceItems(newItems)
                        }}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Valor (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        required
                        value={item.cost || ''}
                        onChange={(e) => {
                          const newItems = [...maintenanceItems]
                          newItems[idx].cost = parseFloat(e.target.value)
                          setMaintenanceItems(newItems)
                        }}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Vida (h)</Label>
                      <Input
                        type="number"
                        required
                        min="1"
                        value={item.lifeHours || ''}
                        onChange={(e) => {
                          const newItems = [...maintenanceItems]
                          newItems[idx].lifeHours = parseFloat(e.target.value)
                          setMaintenanceItems(newItems)
                        }}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 p-3 rounded-lg flex items-center gap-3 text-sm border border-primary/20">
              <Calculator className="w-5 h-5 text-primary" />
              <div>
                <p className="font-bold text-primary">
                  Custo Total da Máquina: R$ {calculatedDepreciation.toFixed(2)}/h
                </p>
                <p className="text-muted-foreground text-xs">
                  Soma da depreciação da máquina + desgaste das peças de reposição.
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Salvar Impressora
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map((machine) => (
          <Card key={machine.id} className="border-none shadow-sm bg-card overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-foreground">{machine.name}</CardTitle>
                <div className="flex gap-1 -mt-2 -mr-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpen(machine)}>
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(machine.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potência:</span>{' '}
                <span className="font-medium">{machine.powerWatts || 0}W</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Peças de rep.:</span>{' '}
                <span className="font-medium">{machine.maintenanceItems?.length || 0} itens</span>
              </div>
              <div className="pt-2 mt-2 border-t flex justify-between items-center text-sm font-bold text-primary">
                <span>Custo p/ Hora Total:</span>
                <span>R$ {machine.depreciationRate.toFixed(2)}/h</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {machines.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            Nenhuma máquina registrada. Adicione sua primeira impressora.
          </div>
        )}
      </div>
    </div>
  )
}

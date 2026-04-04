import { useState } from 'react'
import { useApp, Machine } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Edit, Trash2, Plus, Calculator } from 'lucide-react'

export default function Machines() {
  const { machines, addMachine, updateMachine, deleteMachine } = useApp()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({ name: '', purchaseValue: '', usefulLifeHours: '' })

  const handleOpen = (machine?: Machine) => {
    if (machine) {
      setEditingId(machine.id)
      setFormData({
        name: machine.name,
        purchaseValue: machine.purchaseValue.toString(),
        usefulLifeHours: machine.usefulLifeHours.toString(),
      })
    } else {
      setEditingId(null)
      setFormData({ name: '', purchaseValue: '', usefulLifeHours: '' })
    }
    setOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pVal = parseFloat(formData.purchaseValue) || 0
    const uLife = parseFloat(formData.usefulLifeHours) || 1
    const depRate = pVal / uLife

    if (editingId)
      updateMachine(editingId, {
        name: formData.name,
        purchaseValue: pVal,
        usefulLifeHours: uLife,
        depreciationRate: depRate,
      })
    else
      addMachine({
        id: Date.now().toString(),
        name: formData.name,
        purchaseValue: pVal,
        usefulLifeHours: uLife,
        depreciationRate: depRate,
      })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Minhas Máquinas (Frota)</h2>
          <p className="text-muted-foreground text-sm">
            Gerencie suas impressoras e calcule custos de depreciação.
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Nova Máquina
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Máquina' : 'Nova Máquina'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Modelo / Nome da Máquina</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            <div className="bg-muted p-3 rounded-lg flex items-center gap-3 text-sm border">
              <Calculator className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-semibold text-foreground">
                  Depreciação por Hora: R${' '}
                  {(
                    (parseFloat(formData.purchaseValue) || 0) /
                    (parseFloat(formData.usefulLifeHours) || 1)
                  ).toFixed(2)}
                  /h
                </p>
                <p className="text-muted-foreground text-xs">
                  Calculado automaticamente (Valor / Horas).
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Salvar
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
                    onClick={() => deleteMachine(machine.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor pago:</span>{' '}
                <span className="font-medium">R$ {machine.purchaseValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vida útil:</span>{' '}
                <span className="font-medium">{machine.usefulLifeHours} horas</span>
              </div>
              <div className="pt-2 mt-2 border-t flex justify-between items-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                <span>Custo por Hora (Depreciação):</span>
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

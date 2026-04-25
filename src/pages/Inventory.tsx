import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Edit2 } from 'lucide-react'

export default function Inventory() {
  const { filaments, addFilament, updateFilament, updateFilamentWeight, deleteFilament } = useApp()
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (location.state?.openNew) {
      handleOpenNew()
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state])

  const [formData, setFormData] = useState({
    name: '',
    type: 'PLA',
    colorHex: '#000000',
    weight: '1000',
    currentWeight: '1000',
    brand: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    costPerKg: '150',
  })

  const handleOpenNew = () => {
    setEditingId(null)
    setFormData({
      name: '',
      type: 'PLA',
      colorHex: '#000000',
      weight: '1000',
      currentWeight: '1000',
      brand: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      costPerKg: '150',
    })
    setOpen(true)
  }

  const handleOpenEdit = (fil: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(fil.id)
    setFormData({
      name: fil.name,
      type: fil.type,
      colorHex: fil.colorHex,
      weight: fil.initialWeight.toString(),
      currentWeight: fil.currentWeight.toString(),
      brand: fil.brand || '',
      purchaseDate: fil.purchaseDate || new Date().toISOString().split('T')[0],
      costPerKg: fil.costPerKg?.toString() || '150',
    })
    setOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateFilament(editingId, {
        name: formData.name,
        type: formData.type,
        colorHex: formData.colorHex,
        initialWeight: parseFloat(formData.weight),
        currentWeight: parseFloat(formData.currentWeight),
        brand: formData.brand,
        purchaseDate: formData.purchaseDate,
        costPerKg: parseFloat(formData.costPerKg),
      })
      toast({ title: 'Filamento Atualizado', description: 'As alterações foram salvas.' })
    } else {
      addFilament({
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        colorHex: formData.colorHex,
        initialWeight: parseFloat(formData.weight),
        currentWeight: parseFloat(formData.currentWeight),
        brand: formData.brand,
        purchaseDate: formData.purchaseDate,
        costPerKg: parseFloat(formData.costPerKg),
      })
      toast({ title: 'Filamento Adicionado', description: 'O estoque foi atualizado.' })
    }
    setOpen(false)
  }

  const handleAdjustWeight = (id: string, current: number) => {
    const newVal = prompt('Novo peso atual (gramas):', current.toString())
    if (newVal && !isNaN(parseFloat(newVal))) {
      updateFilamentWeight(id, parseFloat(newVal))
      toast({ title: 'Peso Atualizado', description: 'Ajuste manual concluído.' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Estoque de Filamentos</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} className="w-full sm:w-auto gap-2">
              <Plus className="w-4 h-4" /> Novo Rolo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Filamento' : 'Adicionar Filamento'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nome / Modelo</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: PLA Premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ex: 3D Fila"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Input
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="PLA, ABS..."
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Cor Visual</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      required
                      value={formData.colorHex}
                      onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                      className="p-1 w-12 h-10"
                    />
                    <Input
                      required
                      value={formData.colorHex}
                      onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Peso Total (g)</Label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso Atual (g)</Label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={formData.currentWeight}
                    onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Compra</Label>
                  <Input
                    type="date"
                    required
                    className="dark:[color-scheme:dark]"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo por Kg (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formData.costPerKg}
                    onChange={(e) => setFormData({ ...formData, costPerKg: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {editingId && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir este filamento?')) {
                        deleteFilament(editingId)
                        setOpen(false)
                      }
                    }}
                  >
                    Excluir
                  </Button>
                )}
                <Button type="submit" className="flex-1">
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filaments.map((fil) => {
          const percent = Math.max(0, Math.min(100, (fil.currentWeight / fil.initialWeight) * 100))
          const isLow = fil.currentWeight < 100

          return (
            <Card
              key={fil.id}
              className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group relative bg-card"
              onClick={() => handleAdjustWeight(fil.id, fil.currentWeight)}
            >
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 bg-background/50 hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation()
                    addFilament({
                      ...fil,
                      id: Date.now().toString(),
                      currentWeight: fil.initialWeight,
                      name: `${fil.name} (Cópia)`,
                    })
                    toast({ title: 'Filamento Duplicado' })
                  }}
                  title="Duplicar"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 bg-background/50 hover:bg-background"
                  onClick={(e) => handleOpenEdit(fil, e)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-full border-4 shadow-inner"
                    style={{ backgroundColor: fil.colorHex, borderColor: 'var(--border)' }}
                  />
                  {isLow && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                    </span>
                  )}
                </div>
                <div className="w-full">
                  <p className="font-bold text-sm text-foreground line-clamp-1">{fil.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {fil.brand} • {fil.type}
                  </p>
                </div>
                <div className="w-full space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                    <span>{fil.currentWeight.toFixed(0)}g rest.</span>
                    <span>{percent.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={percent}
                    className="h-2"
                    indicatorClassName={
                      isLow ? 'bg-rose-500' : percent < 30 ? 'bg-amber-500' : 'bg-primary'
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

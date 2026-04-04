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
import { Plus } from 'lucide-react'

export default function Inventory() {
  const { filaments, addFilament, updateFilamentWeight } = useApp()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [newFilament, setNewFilament] = useState({
    name: '',
    type: 'PLA',
    colorHex: '#000000',
    weight: '1000',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addFilament({
      id: Date.now().toString(),
      name: newFilament.name,
      type: newFilament.type,
      colorHex: newFilament.colorHex,
      initialWeight: parseFloat(newFilament.weight),
      currentWeight: parseFloat(newFilament.weight),
    })
    toast({ title: 'Filamento Adicionado', description: 'O estoque foi atualizado visualmente.' })
    setOpen(false)
    setNewFilament({ name: '', type: 'PLA', colorHex: '#000000', weight: '1000' })
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
        <h2 className="text-2xl font-bold text-slate-800">Estoque Visual</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto gap-2">
              <Plus className="w-4 h-4" /> Novo Rolo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Filamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome / Marca</Label>
                <Input
                  required
                  value={newFilament.name}
                  onChange={(e) => setNewFilament({ ...newFilament, name: e.target.value })}
                  placeholder="Ex: PLA Premium 3D Fila"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Input
                    required
                    value={newFilament.type}
                    onChange={(e) => setNewFilament({ ...newFilament, type: e.target.value })}
                    placeholder="PLA, ABS..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor Visual</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      required
                      value={newFilament.colorHex}
                      onChange={(e) => setNewFilament({ ...newFilament, colorHex: e.target.value })}
                      className="p-1 w-12 h-10"
                    />
                    <Input
                      required
                      value={newFilament.colorHex}
                      onChange={(e) => setNewFilament({ ...newFilament, colorHex: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Peso Inicial (gramas)</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={newFilament.weight}
                  onChange={(e) => setNewFilament({ ...newFilament, weight: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                Salvar Rolo
              </Button>
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
              className="border-none shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
              onClick={() => handleAdjustWeight(fil.id, fil.currentWeight)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-full border-4 shadow-inner"
                    style={{ backgroundColor: fil.colorHex, borderColor: 'rgba(0,0,0,0.05)' }}
                  />
                  {isLow && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                    </span>
                  )}
                </div>
                <div className="w-full">
                  <p className="font-bold text-sm text-slate-800 line-clamp-1">{fil.name}</p>
                  <p className="text-xs text-slate-500">{fil.type}</p>
                </div>
                <div className="w-full space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-medium text-slate-500">
                    <span>{fil.currentWeight.toFixed(0)}g rest.</span>
                    <span>{percent.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={percent}
                    className="h-2"
                    indicatorClassName={
                      isLow ? 'bg-rose-500' : percent < 30 ? 'bg-amber-500' : 'bg-indigo-500'
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

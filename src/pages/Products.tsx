import { useState } from 'react'
import { useApp, Product, ProductMaterial, ProductComponent } from '@/store/AppContext'
import { Card } from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function Products() {
  const { products, settings, filaments, addProduct, updateProduct, deleteProduct, quotes } =
    useApp()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<{
    name: string
    printTimeMins: string
    prepTimeMins: string
    packagingCost: string
    profitMargin: string
    materials: ProductMaterial[]
    extraComponents: ProductComponent[]
  }>({
    name: '',
    printTimeMins: '',
    prepTimeMins: '',
    packagingCost: '',
    profitMargin: '',
    materials: [],
    extraComponents: [],
  })

  const handleOpen = (prod?: Product) => {
    if (prod) {
      setEditingId(prod.id)
      setFormData({
        name: prod.name,
        printTimeMins: prod.printTimeMins.toString(),
        prepTimeMins: prod.prepTimeMins.toString(),
        packagingCost: prod.packagingCost.toString(),
        profitMargin: prod.profitMargin?.toString() || '',
        materials: [...prod.materials],
        extraComponents: [...prod.extraComponents],
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        printTimeMins: '',
        prepTimeMins: '',
        packagingCost: '',
        profitMargin: '',
        materials: [],
        extraComponents: [],
      })
    }
    setOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      printTimeMins: Number(formData.printTimeMins) || 0,
      prepTimeMins: Number(formData.prepTimeMins) || 0,
      packagingCost: Number(formData.packagingCost) || 0,
      profitMargin: formData.profitMargin ? Number(formData.profitMargin) : null,
      materials: formData.materials,
      extraComponents: formData.extraComponents,
    }
    if (editingId) updateProduct(editingId, payload)
    else addProduct(payload)
    setOpen(false)
  }

  const handleDelete = (id: string) => {
    const isUsed = quotes.some((q) => q.items.some((i) => i.productId === id))
    if (isUsed) {
      if (
        !window.confirm(
          'Este produto já foi usado em orçamentos. Tem certeza que deseja excluí-lo?',
        )
      )
        return
    } else {
      if (!window.confirm('Tem certeza que deseja excluir este produto?')) return
    }
    deleteProduct(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Catálogo de Produtos</h2>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nome do Produto</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tempo Impressão (Mins)</Label>
                <Input
                  type="number"
                  required
                  value={formData.printTimeMins}
                  onChange={(e) => setFormData({ ...formData, printTimeMins: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tempo Preparação (Mins)</Label>
                <Input
                  type="number"
                  required
                  value={formData.prepTimeMins}
                  onChange={(e) => setFormData({ ...formData, prepTimeMins: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Custo Embalagem (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.packagingCost}
                  onChange={(e) => setFormData({ ...formData, packagingCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Margem Lucro Custom (%)</Label>
                <Input
                  type="number"
                  step="1"
                  placeholder={`Padrão: ${settings.profitMargin}%`}
                  value={formData.profitMargin}
                  onChange={(e) => setFormData({ ...formData, profitMargin: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <Label className="font-semibold">Materiais (Filamentos)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      materials: [...formData.materials, { filamentId: '', weight: 0 }],
                    })
                  }
                >
                  + Material
                </Button>
              </div>
              {formData.materials.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Select
                    value={m.filamentId}
                    onValueChange={(v) => {
                      const nm = [...formData.materials]
                      nm[i].filamentId = v
                      setFormData({ ...formData, materials: nm })
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Filamento..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filaments
                        .filter((f) => f.isActive !== false)
                        .map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name} - R${f.costPerKg}/kg
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Peso (g)"
                    className="w-24"
                    value={m.weight || ''}
                    onChange={(e) => {
                      const nm = [...formData.materials]
                      nm[i].weight = Number(e.target.value)
                      setFormData({ ...formData, materials: nm })
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                      const nm = formData.materials.filter((_, idx) => idx !== i)
                      setFormData({ ...formData, materials: nm })
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <Label className="font-semibold">Componentes Extras</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      extraComponents: [...formData.extraComponents, { name: '', cost: 0 }],
                    })
                  }
                >
                  + Extra
                </Button>
              </div>
              {formData.extraComponents.map((c, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Nome (ex: Parafuso)"
                    className="flex-1"
                    value={c.name}
                    onChange={(e) => {
                      const nc = [...formData.extraComponents]
                      nc[i].name = e.target.value
                      setFormData({ ...formData, extraComponents: nc })
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Custo R$"
                    className="w-28"
                    value={c.cost === 0 ? '' : c.cost}
                    onChange={(e) => {
                      const nc = [...formData.extraComponents]
                      nc[i].cost = Number(e.target.value)
                      setFormData({ ...formData, extraComponents: nc })
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                      const nc = formData.extraComponents.filter((_, idx) => idx !== i)
                      setFormData({ ...formData, extraComponents: nc })
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full mt-4">
              Salvar Produto
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nome</TableHead>
                <TableHead>Tempo (Imp/Prep)</TableHead>
                <TableHead>Materiais / Extras</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell className="font-medium">{prod.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {prod.printTimeMins}m / {prod.prepTimeMins}m
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div>{prod.materials.length} Filamento(s)</div>
                    {prod.extraComponents.length > 0 && (
                      <div>{prod.extraComponents.length} Extra(s)</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpen(prod)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(prod.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum produto cadastrado.
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

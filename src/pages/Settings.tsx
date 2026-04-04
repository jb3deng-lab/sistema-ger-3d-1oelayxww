import { useState, useEffect } from 'react'
import { useApp } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { UploadCloud } from 'lucide-react'

export default function Settings() {
  const { settings, updateSettings } = useApp()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    filamentCost: '',
    energyCost: '',
    machineCost: '',
    profitMargin: '',
  })

  useEffect(() => {
    setFormData({
      filamentCost: settings.filamentCost.toString(),
      energyCost: settings.energyCost.toString(),
      machineCost: settings.machineCost.toString(),
      profitMargin: settings.profitMargin.toString(),
    })
  }, [settings])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      filamentCost: parseFloat(formData.filamentCost) || 0,
      energyCost: parseFloat(formData.energyCost) || 0,
      machineCost: parseFloat(formData.machineCost) || 0,
      profitMargin: parseFloat(formData.profitMargin) || 0,
    })
    toast({
      title: 'Sucesso',
      description: 'Configurações salvas. Os próximos orçamentos usarão estes valores.',
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Variáveis de Cálculo</CardTitle>
          <CardDescription>
            Defina os custos base para os cálculos automáticos dos orçamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Custo do Filamento Padrão (R$/kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.filamentCost}
                  onChange={(e) => setFormData({ ...formData, filamentCost: e.target.value })}
                />
                <p className="text-xs text-slate-500">Valor médio de 1kg (1000g)</p>
              </div>
              <div className="space-y-2">
                <Label>Custo de Energia (R$/hora)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.energyCost}
                  onChange={(e) => setFormData({ ...formData, energyCost: e.target.value })}
                />
                <p className="text-xs text-slate-500">Consumo da impressora por hora</p>
              </div>
              <div className="space-y-2">
                <Label>Uso Máquina/Depreciação (R$/hora)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.machineCost}
                  onChange={(e) => setFormData({ ...formData, machineCost: e.target.value })}
                />
                <p className="text-xs text-slate-500">Desgaste do equipamento</p>
              </div>
              <div className="space-y-2">
                <Label>Margem de Lucro Padrão (%)</Label>
                <Input
                  type="number"
                  step="1"
                  required
                  value={formData.profitMargin}
                  onChange={(e) => setFormData({ ...formData, profitMargin: e.target.value })}
                />
                <p className="text-xs text-slate-500">Adicionado sobre o custo total</p>
              </div>
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
              Salvar Configurações
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Personalização de Documentos</CardTitle>
          <CardDescription>Logo para PDFs e orçamentos (Demonstração)</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => toast({ description: 'Funcionalidade de upload simulada' })}
          >
            <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
              <UploadCloud className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-slate-700">Clique para fazer upload</p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG até 2MB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

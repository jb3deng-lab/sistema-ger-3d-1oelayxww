import { useState, useEffect } from 'react'
import { useApp } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { UploadCloud, Building, Calculator, Trash2 } from 'lucide-react'

export default function Settings() {
  const { settings, updateSettings } = useApp()
  const { toast } = useToast()

  const [calcData, setCalcData] = useState({
    energyCost: '',
    machineCost: '',
    profitMargin: '',
    operatorHourCost: '',
  })

  const [categories, setCategories] = useState<string[]>([])
  const [salesMethods, setSalesMethods] = useState<{ name: string; fee: number }[]>([])

  const [empresaData, setEmpresaData] = useState({
    companyName: '',
    companyDocument: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    companyLogo: '',
  })

  useEffect(() => {
    if (settings) {
      setCalcData({
        energyCost: settings.energyCost?.toString() ?? '',
        machineCost: settings.machineCost?.toString() ?? '',
        profitMargin: settings.profitMargin?.toString() ?? '',
        operatorHourCost: settings.operatorHourCost?.toString() ?? '',
      })
      setCategories(settings.categories || [])
      setSalesMethods(settings.salesMethods || [])
      setEmpresaData({
        companyName: settings.companyName ?? '',
        companyDocument: settings.companyDocument ?? '',
        companyEmail: settings.companyEmail ?? '',
        companyPhone: settings.companyPhone ?? '',
        companyAddress: settings.companyAddress ?? '',
        companyLogo: settings.companyLogo ?? '',
      })
    }
  }, [settings])

  const handleSaveCalc = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      ...settings,
      energyCost: parseFloat(calcData.energyCost) || 0,
      machineCost: parseFloat(calcData.machineCost) || 0,
      profitMargin: parseFloat(calcData.profitMargin) || 0,
      operatorHourCost: parseFloat(calcData.operatorHourCost) || 0,
      categories: categories.filter((c) => c.trim() !== ''),
      salesMethods: salesMethods.filter((sm) => sm.name.trim() !== ''),
    })
    toast({
      title: 'Variáveis Salvas',
      description: 'Cálculos padrão e listas atualizados com sucesso.',
    })
  }

  const handleSaveEmpresa = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({ ...settings, ...empresaData })
    toast({
      title: 'Empresa Atualizada',
      description: 'Os dados aparecerão nas próximas notas geradas.',
    })
  }

  const handlePhoneChange = (val: string) => {
    let v = val.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`
    }
    if (v.length > 10) {
      v = `${v.slice(0, 10)}-${v.slice(10)}`
    }
    setEmpresaData({ ...empresaData, companyPhone: v })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) =>
        setEmpresaData({ ...empresaData, companyLogo: ev.target?.result as string })
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Configurações</h2>

      <Tabs defaultValue="empresa" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="empresa" className="gap-2">
            <Building className="w-4 h-4" /> Minha Empresa
          </TabsTrigger>
          <TabsTrigger value="calculos" className="gap-2">
            <Calculator className="w-4 h-4" /> Variáveis Globais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-6">
          <Card className="border-none shadow-sm bg-card">
            <CardHeader>
              <CardTitle>Dados do Negócio</CardTitle>
              <CardDescription>
                Informações que aparecerão no cabeçalho dos orçamentos (Nota Fiscal).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveEmpresa} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome da Empresa / Fantasia</Label>
                      <Input
                        required
                        value={empresaData.companyName}
                        onChange={(e) =>
                          setEmpresaData({ ...empresaData, companyName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CNPJ / CPF</Label>
                      <Input
                        value={empresaData.companyDocument}
                        onChange={(e) =>
                          setEmpresaData({ ...empresaData, companyDocument: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Endereço Completo</Label>
                      <Input
                        value={empresaData.companyAddress}
                        onChange={(e) =>
                          setEmpresaData({ ...empresaData, companyAddress: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={empresaData.companyPhone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input
                          type="email"
                          value={empresaData.companyEmail}
                          onChange={(e) =>
                            setEmpresaData({ ...empresaData, companyEmail: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label>Logotipo da Empresa</Label>
                    <div className="relative w-full flex-1 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer p-4 text-center overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Selecione um logo"
                      />
                      {empresaData.companyLogo ? (
                        <div className="flex flex-col items-center w-full h-full justify-center">
                          <img
                            src={empresaData.companyLogo}
                            alt="Logo"
                            className="max-h-40 object-contain"
                          />
                          <p className="text-xs text-muted-foreground mt-2">Clique para trocar</p>
                        </div>
                      ) : (
                        <>
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                            <UploadCloud className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium">Clique para fazer upload</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Recomendado: PNG, JPG
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  Salvar Dados da Empresa
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculos" className="space-y-6">
          <Card className="border-none shadow-sm bg-card">
            <CardHeader>
              <CardTitle>Custos e Listas Padrão</CardTitle>
              <CardDescription>
                Valores e opções default para cálculos de novos orçamentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveCalc} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Custo Energia (R$/kWh)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={calcData.energyCost}
                      onChange={(e) => setCalcData({ ...calcData, energyCost: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor cobrado pela sua concessionária local.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Custo Máquina Padrão (R$/hora)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={calcData.machineCost}
                      onChange={(e) => setCalcData({ ...calcData, machineCost: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Usado caso uma máquina cadastrada seja excluída posteriormente.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Margem de Lucro Padrão (%)</Label>
                    <Input
                      type="number"
                      step="1"
                      required
                      value={calcData.profitMargin}
                      onChange={(e) => setCalcData({ ...calcData, profitMargin: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Hora Operador (R$/hora)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={calcData.operatorHourCost}
                      onChange={(e) =>
                        setCalcData({ ...calcData, operatorHourCost: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Usado para calcular custo de preparação.
                    </p>
                  </div>

                  <div className="space-y-4 col-span-1 sm:col-span-2 pt-4 border-t">
                    <Label className="text-base font-semibold">
                      Categorias de Orçamentos/Produtos
                    </Label>
                    <div className="space-y-2">
                      {categories.map((cat, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={cat}
                            onChange={(e) => {
                              const newCats = [...categories]
                              newCats[i] = e.target.value
                              setCategories(newCats)
                            }}
                            placeholder="Ex: B2B, B2C, Decoração..."
                            className="max-w-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              setCategories(categories.filter((_, idx) => idx !== i))
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCategories([...categories, ''])}
                      >
                        + Adicionar Categoria
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 col-span-1 sm:col-span-2 pt-4 border-t">
                    <Label className="text-base font-semibold">Métodos de Venda (Taxas)</Label>
                    <div className="space-y-2">
                      {salesMethods.map((sm, i) => (
                        <div key={i} className="flex gap-2 items-center max-w-md">
                          <Input
                            value={sm.name}
                            onChange={(e) => {
                              const newSm = [...salesMethods]
                              newSm[i].name = e.target.value
                              setSalesMethods(newSm)
                            }}
                            placeholder="Nome do Método"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            step="0.1"
                            value={sm.fee === 0 ? '' : sm.fee}
                            onChange={(e) => {
                              const newSm = [...salesMethods]
                              newSm[i].fee = parseFloat(e.target.value) || 0
                              setSalesMethods(newSm)
                            }}
                            placeholder="Taxa (%)"
                            className="w-24"
                          />
                          <span className="text-sm font-medium">%</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              setSalesMethods(salesMethods.filter((_, idx) => idx !== i))
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSalesMethods([...salesMethods, { name: '', fee: 0 }])}
                      >
                        + Adicionar Método
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button type="submit" className="w-full sm:w-auto">
                    Salvar Variáveis e Listas
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

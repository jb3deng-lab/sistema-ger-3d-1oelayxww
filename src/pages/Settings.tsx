import { useState, useEffect } from 'react'
import { useApp } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { UploadCloud, Building, Calculator } from 'lucide-react'

export default function Settings() {
  const { settings, updateSettings } = useApp()
  const { toast } = useToast()

  const [calcData, setCalcData] = useState({
    energyCost: '',
    machineCost: '',
    profitMargin: '',
    operatorHourCost: '',
    categories: '',
    salesMethods: '',
  })
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
        categories: settings.categories?.join(', ') ?? '',
        salesMethods: settings.salesMethods?.map((m) => `${m.name}:${m.fee}`).join('\n') ?? '',
      })
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
      categories: calcData.categories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      salesMethods: calcData.salesMethods
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [name, fee] = line.split(':')
          return { name: name.trim(), fee: parseFloat(fee) || 0 }
        }),
    })
    toast({ title: 'Variáveis Salvas', description: 'Cálculos padrão atualizados com sucesso.' })
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
    // Basic formatting (XX) XXXXX-XXXX
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
              <CardTitle>Custos Base Padrão</CardTitle>
              <CardDescription>Valores default para cálculos de novos orçamentos.</CardDescription>
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
                  <div className="space-y-2 col-span-1 sm:col-span-2">
                    <Label>Categorias de Produtos (separadas por vírgula)</Label>
                    <Input
                      required
                      value={calcData.categories}
                      onChange={(e) => setCalcData({ ...calcData, categories: e.target.value })}
                      placeholder="B2B, B2C, Decoração..."
                    />
                  </div>
                  <div className="space-y-2 col-span-1 sm:col-span-2">
                    <Label>Métodos de Venda (Nome:Taxa%) - 1 por linha</Label>
                    <textarea
                      required
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={calcData.salesMethods}
                      onChange={(e) => setCalcData({ ...calcData, salesMethods: e.target.value })}
                      placeholder="Dinheiro/Pix:0&#10;Cartão Crédito:5"
                    />
                  </div>
                </div>
                <Button type="submit">Salvar Variáveis Globais</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

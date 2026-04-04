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
    filamentCost: '',
    energyCost: '',
    machineCost: '',
    profitMargin: '',
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
        filamentCost: settings.filamentCost?.toString() ?? '',
        energyCost: settings.energyCost?.toString() ?? '',
        machineCost: settings.machineCost?.toString() ?? '',
        profitMargin: settings.profitMargin?.toString() ?? '',
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
      filamentCost: parseFloat(calcData.filamentCost) || 0,
      energyCost: parseFloat(calcData.energyCost) || 0,
      machineCost: parseFloat(calcData.machineCost) || 0,
      profitMargin: parseFloat(calcData.profitMargin) || 0,
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
                          onChange={(e) =>
                            setEmpresaData({ ...empresaData, companyPhone: e.target.value })
                          }
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
                  <div className="space-y-2 flex flex-col items-center justify-center">
                    <Label className="self-start">Logotipo</Label>
                    <div
                      className="w-full flex-1 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer p-4 text-center"
                      onClick={() => {
                        const url = prompt('Cole a URL da imagem (simulação de upload):')
                        if (url) setEmpresaData({ ...empresaData, companyLogo: url })
                      }}
                    >
                      {empresaData.companyLogo ? (
                        <img
                          src={empresaData.companyLogo}
                          alt="Logo"
                          className="max-h-40 object-contain"
                        />
                      ) : (
                        <>
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                            <UploadCloud className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium">Clique para fazer upload</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 2MB</p>
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
              <CardDescription>
                Valores default para novos itens (sobrepostos por seleções específicas).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveCalc} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Custo Filamento (Fallback) (R$/kg)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={calcData.filamentCost}
                      onChange={(e) => setCalcData({ ...calcData, filamentCost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Custo Energia (R$/hora)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={calcData.energyCost}
                      onChange={(e) => setCalcData({ ...calcData, energyCost: e.target.value })}
                    />
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
                      Usado caso não selecione uma máquina da frota.
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

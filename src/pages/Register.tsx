import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Box, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

export default function Register() {
  const [step, setStep] = useState<'form' | 'otp'>('form')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('Brasil')
  const [addressNumber, setAddressNumber] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [otp, setOtp] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  const { signUp, verifyOtp, resendOtp, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setCep(value)

    if (value.length === 8) {
      setIsLoadingCep(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`)
        const data = await response.json()

        if (!data.erro) {
          setStreet(data.logradouro || '')
          setCity(data.localidade || '')
          setState(data.uf || '')
          toast({
            title: 'Endereço encontrado',
            description: 'Campos preenchidos automaticamente pelo CEP.',
          })
        } else {
          toast({
            variant: 'destructive',
            title: 'CEP não encontrado',
            description: 'Verifique o CEP digitado ou preencha os dados manualmente.',
          })
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar CEP',
          description: 'Não foi possível buscar o endereço automaticamente.',
        })
      } finally {
        setIsLoadingCep(false)
      }
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'As senhas não coincidem',
        description: 'Verifique a confirmação da senha.',
      })
      return
    }

    setIsLoading(true)
    try {
      const fullAddress = `${street}${addressNumber ? ', ' + addressNumber : ''} - ${city}/${state} - ${country} (CEP: ${cep})`

      const { error } = await signUp(email, password, name, fullAddress, phone)
      if (error) throw error

      toast({
        title: 'Código enviado!',
        description: 'Verifique seu e-mail para confirmar a conta.',
      })
      setStep('otp')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar conta',
        description: error.message || 'Tente novamente com outros dados.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Código inválido',
        description: 'O código deve ter 6 dígitos.',
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await verifyOtp(email, otp)
      if (error) throw error

      toast({
        title: 'Conta confirmada!',
        description: 'Seja bem-vindo ao sistema.',
      })
      navigate('/')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao validar código',
        description: error.message || 'Verifique se digitou corretamente.',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/800/1200?q=3d%20printer&color=purple&dpr=2')] bg-cover bg-center mix-blend-overlay opacity-40" />
        <div className="relative z-20 flex items-center text-2xl font-bold tracking-tight">
          <Box className="mr-2 h-8 w-8 text-primary" />
          GER-3D
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              "Eleve o nível do seu negócio de impressão 3D. Cadastre-se agora e comece a gerar
              orçamentos profissionais em segundos."
            </p>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center bg-background overflow-y-auto">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[450px]">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Box className="w-8 h-8 text-primary" />
              </div>
            </div>

            {step === 'form' ? (
              <>
                <h1 className="text-3xl font-bold tracking-tight">Criar uma conta</h1>
                <p className="text-sm text-muted-foreground">
                  Preencha os dados abaixo para iniciar sua jornada
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight">Confirme seu e-mail</h1>
                <p className="text-sm text-muted-foreground">
                  Enviamos um código de 6 dígitos para{' '}
                  <span className="font-semibold text-foreground">{email}</span>
                  <br />
                  <span className="mt-2 block text-xs">
                    (Se você recebeu um link de confirmação, basta clicar nele para ativar a conta)
                  </span>
                </p>
              </>
            )}
          </div>

          {step === 'form' ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-background h-11"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="bg-background h-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background h-11"
                    disabled={isLoading}
                  />
                </div>

                <div className="pt-2 border-t mt-4 mb-2">
                  <h3 className="text-sm font-medium mb-4 text-muted-foreground">Endereço</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <div className="relative">
                          <Input
                            id="cep"
                            placeholder="00000-000"
                            value={cep}
                            onChange={handleCepChange}
                            maxLength={9}
                            className="bg-background h-11"
                            disabled={isLoading}
                          />
                          {isLoadingCep && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="street">Rua / Logradouro</Label>
                        <Input
                          id="street"
                          placeholder="Rua Exemplo"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="bg-background h-11"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="number">Número / Comp.</Label>
                        <Input
                          id="number"
                          placeholder="123, Apto 4"
                          value={addressNumber}
                          onChange={(e) => setAddressNumber(e.target.value)}
                          className="bg-background h-11"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="city">Município</Label>
                        <Input
                          id="city"
                          placeholder="Cidade"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="bg-background h-11"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado (UF)</Label>
                        <Input
                          id="state"
                          placeholder="SP"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          maxLength={2}
                          className="bg-background h-11 uppercase"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">País</Label>
                        <Input
                          id="country"
                          placeholder="Brasil"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="bg-background h-11"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t mt-4 mb-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="bg-background h-11 pr-10"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="bg-background h-11 pr-10"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Cadastrar'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center py-6">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isLoading}>
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot
                      index={0}
                      className="w-12 h-14 text-lg bg-background border-input rounded-md"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-12 h-14 text-lg bg-background border-input rounded-md"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-12 h-14 text-lg bg-background border-input rounded-md"
                    />
                    <InputOTPSlot
                      index={3}
                      className="w-12 h-14 text-lg bg-background border-input rounded-md"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-12 h-14 text-lg bg-background border-input rounded-md"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-12 h-14 text-lg bg-background border-input rounded-md"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isLoading || otp.length < 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Confirmar Código
                  </>
                )}
              </Button>

              <div className="flex flex-col space-y-4 items-center pt-4">
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true)
                    try {
                      const { error } = await resendOtp(email)
                      if (error) throw error
                      toast({
                        title: 'Código reenviado',
                        description: 'Verifique sua caixa de entrada.',
                      })
                    } catch (error: any) {
                      toast({
                        variant: 'destructive',
                        title: 'Erro ao reenviar',
                        description: error.message || 'Tente novamente.',
                      })
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  disabled={isLoading}
                >
                  Não recebeu o código? Reenviar
                </button>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4"
                  disabled={isLoading}
                >
                  Voltar para o cadastro
                </button>
              </div>
            </form>
          )}

          <p className="px-8 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="underline underline-offset-4 hover:text-primary font-medium"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

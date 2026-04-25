import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Box, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Register() {
  const { signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      })
    }
    setLoading(true)
    // @ts-expect-error - mantendo a compatibilidade de uso anterior com name e address
    const { error } = await signUp(email, password, name, address)

    if (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message || 'Ocorreu um erro ao criar a conta.',
        variant: 'destructive',
      })
      setLoading(false)
    } else {
      toast({
        title: 'Cadastro realizado!',
        description: 'Foi enviado um email pra confirmação.',
      })
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <div className="hidden md:flex flex-1 bg-muted items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10" />
        <img
          src="https://img.usecurling.com/p/800/1000?q=technology&color=blue"
          alt="Tecnologia"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="relative z-20 p-12 text-center text-white max-w-lg backdrop-blur-sm bg-black/40 rounded-2xl border border-white/10 shadow-2xl">
          <Box className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Junte-se ao GER-3D</h1>
          <p className="text-lg text-white/90">
            Tenha o controle total da sua operação de impressão 3D centralizada em um só lugar.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 pb-safe overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up py-8">
          <div className="text-center md:text-left">
            <Box className="w-12 h-12 mx-auto md:mx-0 mb-4 text-primary md:hidden" />
            <h2 className="text-3xl font-bold tracking-tight">Criar Conta</h2>
            <p className="text-muted-foreground mt-2">Cadastre-se no Sistema de Gestão 3D</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Seu endereço completo"
                className="h-11"
              />
            </div>
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
                    placeholder="••••••••"
                    minLength={6}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium mt-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
          <div className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Faça login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

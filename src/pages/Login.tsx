import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Box, Loader2 } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)

    if (error) {
      let msg = 'Credenciais inválidas.'
      if (error.message.includes('Email not confirmed') || error.message.includes('confirm')) {
        msg = 'Por favor, confirme seu e-mail na sua caixa de entrada antes de fazer login.'
      }
      toast({
        title: 'Erro ao entrar',
        description: msg,
        variant: 'destructive',
      })
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex flex-1 bg-muted items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10" />
        <img
          src="https://img.usecurling.com/p/800/1000?q=3d%20printer&color=blue"
          alt="Impressão 3D"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="relative z-20 p-12 text-center text-white max-w-lg backdrop-blur-sm bg-black/40 rounded-2xl border border-white/10 shadow-2xl">
          <Box className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold mb-4">GER-3D</h1>
          <p className="text-lg text-white/90">
            O sistema definitivo para gerenciar vendas, orçamentos e o estoque da sua produção 3D.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 pb-safe">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center md:text-left">
            <Box className="w-12 h-12 mx-auto md:mx-0 mb-4 text-primary md:hidden" />
            <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h2>
            <p className="text-muted-foreground mt-2">Faça login para gerenciar sua produção</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="h-12"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="text-center text-sm text-muted-foreground mt-6">
            Não tem uma conta?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

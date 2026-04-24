import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const Printer3D = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    className={className}
  >
    <rect x="3" y="17" width="18" height="4" rx="1" />
    <path d="M6 17V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12" />
    <path d="M6 9h12" />
    <rect x="10" y="9" width="4" height="5" rx="1" />
    <path d="M12 14v2" />
    <path d="M8 17v-1h8v1" />
  </svg>
)

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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-8">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Printer3D className="w-8 h-8" />
          </div>
          <div>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>Cadastre-se no Sistema de Gestão 3D</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Seu endereço completo"
              />
            </div>
            <div className="space-y-2 relative">
              <Label>Senha</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Senha</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-pass"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="show-pass" className="text-sm font-normal cursor-pointer">
                Visualizar senhas
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

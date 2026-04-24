import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  LayoutDashboard,
  Users,
  Box,
  Disc3,
  FileText,
  Settings,
  LogOut,
  User as UserIcon,
  PlusCircle,
  Package,
  DollarSign,
} from 'lucide-react'

export default function Layout() {
  const { user, signOut, updateProfile } = useAuth()
  const location = useLocation()
  const { toast } = useToast()
  const [profileOpen, setProfileOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    address: user?.user_metadata?.address || '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && profileOpen) {
      setFormData((prev) => ({
        ...prev,
        name: user.user_metadata?.name || '',
        email: user.email || '',
        address: user.user_metadata?.address || '',
        password: '',
        confirmPassword: '',
      }))
    }
  }, [user, profileOpen])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' })
      return
    }

    setLoading(true)
    const updates: any = {
      name: formData.name,
      address: formData.address,
      email: formData.email,
    }
    if (formData.password) {
      updates.password = formData.password
    }

    const { error } = await updateProfile(updates)

    setLoading(false)
    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title: 'Sucesso',
        description:
          'Perfil atualizado. Se você alterou o e-mail, precisará confirmá-lo através do link enviado.',
      })
      setProfileOpen(false)
    }
  }

  const navItems = [
    { title: 'Dashboard', path: '/', icon: LayoutDashboard },
    { title: 'Orçamentos', path: '/quotes', icon: FileText },
    { title: 'Pedidos', path: '/orders', icon: Package },
    { title: 'Estoque', path: '/inventory', icon: Disc3 },
    { title: 'Clientes', path: '/clients', icon: Users },
    { title: 'Máquinas', path: '/machines', icon: Box },
    { title: 'Financeiro', path: '/financial', icon: DollarSign },
    { title: 'Configurações', path: '/settings', icon: Settings },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 flex items-center justify-between">
          <div className="font-bold text-lg text-primary flex items-center gap-2">
            <Box className="w-5 h-5" /> Ger-3D
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                  <Link to={item.path}>
                    <item.icon className="w-4 h-4 mr-2" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start overflow-hidden">
                <UserIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {user?.user_metadata?.name || user?.email || 'Usuário'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer">
                <UserIcon className="w-4 h-4 mr-2" /> Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 w-full overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
          <SidebarTrigger />
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Novo</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/clients" className="cursor-pointer">
                  Novo Cliente
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/quotes" className="cursor-pointer">
                  Novo Orçamento
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/20">
          <Outlet />
        </main>
      </SidebarInset>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Meu Perfil</DialogTitle>
            <DialogDescription>Atualize suas informações pessoais e de acesso.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço Completo</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="pt-4 border-t space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Alterar Senha</h4>
              <div className="space-y-2">
                <Label>Nova Senha (deixe em branco para não alterar)</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {formData.password && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>Confirmar Nova Senha</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required={!!formData.password}
                  />
                </div>
              )}
            </div>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calculator,
  Box,
  DollarSign,
  Settings,
  Plus,
  Menu,
  Users,
  Cuboid,
  Disc,
  UserCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useApp } from '@/store/AppContext'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/quotes', label: 'Orçamentos', icon: Calculator },
  { path: '/orders', label: 'Pedidos', icon: Box },
  { path: '/inventory', label: 'Estoque', icon: Disc },
  { path: '/financial', label: 'Financeiro', icon: DollarSign },
  { path: '/clients', label: 'Clientes', icon: Users },
  { path: '/machines', label: 'Impressoras 3D', icon: Cuboid },
]

import { ThemeToggle } from './ThemeToggle'

export default function Layout() {
  const location = useLocation()
  const { profile, updateProfile } = useApp()
  const { signOut } = useAuth()
  const { toast } = useToast()

  const [profileOpen, setProfileOpen] = useState(false)
  const [pData, setPData] = useState({ name: profile?.name || '', address: profile?.address || '' })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile(pData)
    toast({ title: 'Perfil atualizado!' })
    setProfileOpen(false)
  }

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground" translate="no">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card fixed inset-y-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Cuboid className="h-6 w-6" />
            <span>3D Vendas</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}>
                <span
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t flex flex-col gap-2">
          <Link to="/settings">
            <span
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                location.pathname === '/settings'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Settings className="h-5 w-5" />
              Configurações
            </span>
          </Link>

          <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
            <DialogTrigger asChild>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
                <UserCircle className="h-5 w-5" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="truncate max-w-[140px]">{profile?.name || 'Usuário'}</span>
                  <span className="text-[10px] opacity-70">Ver Perfil</span>
                </div>
              </span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Meu Perfil</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={pData.name}
                    onChange={(e) => setPData({ ...pData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={pData.address}
                    onChange={(e) => setPData({ ...pData, address: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleLogout}
                  >
                    Sair da Conta
                  </Button>
                  <Button type="submit" className="flex-1">
                    Salvar Dados
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-20">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="h-14 flex items-center px-6 border-b border-border font-bold text-xl text-primary">
              <Cuboid className="h-6 w-6 mr-2" /> 3D Vendas
            </div>
            <nav className="flex flex-col p-4 gap-2">
              {[...navItems, { path: '/settings', label: 'Configurações', icon: Settings }].map(
                (item) => (
                  <Link key={item.path} to={item.path}>
                    <span className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </span>
                  </Link>
                ),
              )}
              <div className="border-t pt-2 mt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground"
                  onClick={() => setProfileOpen(true)}
                >
                  <UserCircle className="h-5 w-5" /> {profile?.name || 'Perfil'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive"
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <span className="font-bold text-lg text-primary">3D Vendas</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 text-primary">
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link to="/quotes">
                <DropdownMenuItem>Novo Orçamento</DropdownMenuItem>
              </Link>
              <Link to="/inventory">
                <DropdownMenuItem>Novo Filamento</DropdownMenuItem>
              </Link>
              <Link to="/clients">
                <DropdownMenuItem>Novo Cliente</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 pt-14 md:pt-0 pb-16 md:pb-0 min-h-screen bg-background">
        {/* Desktop Top Bar */}
        <div className="hidden md:flex h-16 border-b border-border bg-card items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-foreground capitalize">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 rounded-full px-6">
                  <Plus className="h-4 w-4" /> Novo
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Link to="/quotes">
                  <DropdownMenuItem>Novo Orçamento</DropdownMenuItem>
                </Link>
                <Link to="/inventory">
                  <DropdownMenuItem>Novo Filamento</DropdownMenuItem>
                </Link>
                <Link to="/clients">
                  <DropdownMenuItem>Novo Cliente</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="p-4 md:p-8 animate-fade-in-up">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-20 pb-safe overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-1"
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/store/AppContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import Layout from './components/Layout'
import Index from './pages/Index'
import Quotes from './pages/Quotes'
import Orders from './pages/Orders'
import Inventory from './pages/Inventory'
import Financial from './pages/Financial'
import Settings from './pages/Settings'
import Clients from './pages/Clients'
import Machines from './pages/Machines'
import NotFound from './pages/NotFound'

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <AppProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/financial" element={<Financial />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/machines" element={<Machines />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AppProvider>
  </ThemeProvider>
)

export default App

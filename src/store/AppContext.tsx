import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Settings = {
  filamentCost: number
  energyCost: number
  machineCost: number
  profitMargin: number
  companyName: string
  companyDocument: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  companyLogo: string
}

export type Filament = {
  id: string
  name: string
  type: string
  colorHex: string
  initialWeight: number
  currentWeight: number
  brand: string
  purchaseDate: string
  costPerKg: number
}
export type Client = {
  id: string
  name: string
  email: string
  phone: string
  document: string
  address: string
}
export type Machine = {
  id: string
  name: string
  purchaseValue: number
  usefulLifeHours: number
  depreciationRate: number
}

export type QuoteItem = {
  id: string
  pieceName: string
  weight: number
  timeHours: number
  filamentId: string
  machineId: string
  quantity: number
  costs: { material: number; machine: number; energy: number; total: number }
  suggestedPrice: number
}

export type Quote = {
  id: string
  clientId: string
  clientName: string
  items: QuoteItem[]
  totalCosts: { material: number; machine: number; energy: number; total: number }
  suggestedPrice: number
  discount: number
  finalPrice: number
  status: 'Pendente' | 'Aprovado' | 'Recusado'
  date: string
}

export type Order = {
  id: string
  quoteId: string
  status: 'Aguardando' | 'Em produção' | 'Finalizado' | 'Entregue'
  startDate: string
}
export type Transaction = {
  id: string
  description: string
  type: 'Entrada' | 'Saída'
  amount: number
  date: string
}

type AppContextType = {
  settings: Settings
  updateSettings: (s: Settings) => void
  filaments: Filament[]
  addFilament: (f: Filament) => void
  updateFilament: (id: string, data: Partial<Filament>) => void
  updateFilamentWeight: (id: string, weight: number) => void
  clients: Client[]
  addClient: (c: Client) => void
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
  machines: Machine[]
  addMachine: (m: Machine) => void
  updateMachine: (id: string, data: Partial<Machine>) => void
  deleteMachine: (id: string) => void
  quotes: Quote[]
  addQuote: (q: Quote) => void
  updateQuote: (id: string, data: Partial<Quote>) => void
  updateQuoteStatus: (id: string, status: Quote['status']) => void
  orders: Order[]
  addOrder: (o: Order) => void
  updateOrderStatus: (id: string, status: Order['status']) => void
  transactions: Transaction[]
  addTransaction: (t: Transaction) => void
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 98765-4321',
    document: '123.456.789-00',
    address: 'Rua das Flores, 123 - SP',
  },
]

const mockMachines: Machine[] = [
  {
    id: '1',
    name: 'Bambu Lab X1 Carbon',
    purchaseValue: 12000,
    usefulLifeHours: 5000,
    depreciationRate: 2.4,
  },
  {
    id: '2',
    name: 'Creality Ender 3 V2',
    purchaseValue: 1500,
    usefulLifeHours: 4000,
    depreciationRate: 0.375,
  },
]

const mockQuotes: Quote[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'João Silva',
    items: [
      {
        id: 'i1',
        pieceName: 'Action Figure Yoda',
        weight: 150,
        timeHours: 5,
        filamentId: '1',
        machineId: '1',
        quantity: 1,
        costs: { material: 22.5, machine: 12, energy: 7.5, total: 42 },
        suggestedPrice: 63,
      },
    ],
    totalCosts: { material: 22.5, machine: 12, energy: 7.5, total: 42 },
    suggestedPrice: 63,
    discount: 3,
    finalPrice: 60,
    status: 'Aprovado',
    date: new Date().toISOString(),
  },
]

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    filamentCost: 150,
    energyCost: 1.5,
    machineCost: 2.0,
    profitMargin: 50,
    companyName: 'Minha 3D Print',
    companyDocument: '00.000.000/0001-00',
    companyEmail: 'contato@minha3d.com',
    companyPhone: '(11) 99999-9999',
    companyAddress: 'Rua Principal, 1000 - Centro',
    companyLogo: '',
  })
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [machines, setMachines] = useState<Machine[]>(mockMachines)
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes)
  const [orders, setOrders] = useState<Order[]>([
    { id: '1', quoteId: '1', status: 'Em produção', startDate: new Date().toISOString() },
  ])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const updateSettings = (s: Settings) => setSettings(s)

  const addClient = (c: Client) => setClients((p) => [c, ...p])
  const updateClient = (id: string, d: Partial<Client>) =>
    setClients((p) => p.map((c) => (c.id === id ? { ...c, ...d } : c)))
  const deleteClient = (id: string) => setClients((p) => p.filter((c) => c.id !== id))

  const addMachine = (m: Machine) => setMachines((p) => [m, ...p])
  const updateMachine = (id: string, d: Partial<Machine>) =>
    setMachines((p) => p.map((m) => (m.id === id ? { ...m, ...d } : m)))
  const deleteMachine = (id: string) => setMachines((p) => p.filter((m) => m.id !== id))

  const addFilament = (f: Filament) => setFilaments((p) => [f, ...p])
  const updateFilament = (id: string, d: Partial<Filament>) =>
    setFilaments((p) => p.map((f) => (f.id === id ? { ...f, ...d } : f)))
  const updateFilamentWeight = (id: string, w: number) =>
    setFilaments((p) => p.map((f) => (f.id === id ? { ...f, currentWeight: w } : f)))

  const addQuote = (q: Quote) => setQuotes((p) => [q, ...p])
  const updateQuote = (id: string, d: Partial<Quote>) =>
    setQuotes((p) => p.map((q) => (q.id === id ? { ...q, ...d } : q)))

  const updateQuoteStatus = (id: string, s: Quote['status']) => {
    const quote = quotes.find((q) => q.id === id)
    if (!quote || quote.status === s) return

    setQuotes((p) => p.map((q) => (q.id === id ? { ...q, status: s } : q)))

    if (s === 'Aprovado') {
      addOrder({
        id: Date.now().toString(),
        quoteId: id,
        status: 'Aguardando',
        startDate: new Date().toISOString(),
      })

      setFilaments((p) => {
        let newFilaments = [...p]
        quote.items.forEach((item) => {
          const qty = item.quantity || 1
          const totalWeight = item.weight * qty
          newFilaments = newFilaments.map((f) =>
            f.id === item.filamentId
              ? { ...f, currentWeight: Math.max(0, f.currentWeight - totalWeight) }
              : f,
          )
        })
        return newFilaments
      })

      setTransactions((p) => [
        {
          id: Date.now().toString() + '-rev',
          description: `Receita Pedido #${quote.id.slice(-6)} - ${quote.clientName}`,
          type: 'Entrada',
          amount: quote.finalPrice,
          date: new Date().toISOString(),
        },
        {
          id: Date.now().toString() + '-cost',
          description: `Custos Pedido #${quote.id.slice(-6)} - ${quote.clientName}`,
          type: 'Saída',
          amount: quote.totalCosts.total,
          date: new Date().toISOString(),
        },
        ...p,
      ])
    } else if (quote.status === 'Aprovado' && (s === 'Recusado' || s === 'Pendente')) {
      // Revert deductions
      setFilaments((p) => {
        let newFilaments = [...p]
        quote.items.forEach((item) => {
          const qty = item.quantity || 1
          const totalWeight = item.weight * qty
          newFilaments = newFilaments.map((f) =>
            f.id === item.filamentId ? { ...f, currentWeight: f.currentWeight + totalWeight } : f,
          )
        })
        return newFilaments
      })

      // Revert transactions
      setTransactions((p) =>
        p.filter(
          (t) =>
            t.description !== `Receita Pedido #${quote.id.slice(-6)} - ${quote.clientName}` &&
            t.description !== `Custos Pedido #${quote.id.slice(-6)} - ${quote.clientName}`,
        ),
      )

      // Remove order
      setOrders((p) => p.filter((o) => o.quoteId !== id))
    }
  }

  const addOrder = (o: Order) => setOrders((p) => [o, ...p])
  const updateOrderStatus = (id: string, s: Order['status']) =>
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status: s } : o)))
  const addTransaction = (t: Transaction) => setTransactions((p) => [t, ...p])

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        filaments,
        addFilament,
        updateFilament,
        updateFilamentWeight,
        clients,
        addClient,
        updateClient,
        deleteClient,
        machines,
        addMachine,
        updateMachine,
        deleteMachine,
        quotes,
        addQuote,
        updateQuote,
        updateQuoteStatus,
        orders,
        addOrder,
        updateOrderStatus,
        transactions,
        addTransaction,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

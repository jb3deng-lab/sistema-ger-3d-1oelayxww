import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Settings = {
  energyCost: number
  machineCost: number
  profitMargin: number
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

export type QuoteItem = {
  id: string
  pieceName: string
  weight: number
  timeHours: number
  filamentId: string
  costs: { material: number; machine: number; energy: number; total: number }
  suggestedPrice: number
}

export type Quote = {
  id: string
  clientName: string
  items: QuoteItem[]
  totalCosts: { material: number; machine: number; energy: number; total: number }
  suggestedPrice: number
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

const mockFilaments: Filament[] = [
  {
    id: '1',
    name: 'PLA Premium',
    brand: '3D Fila',
    type: 'PLA',
    colorHex: '#000000',
    initialWeight: 1000,
    currentWeight: 850,
    purchaseDate: '2023-09-01',
    costPerKg: 150,
  },
  {
    id: '2',
    name: 'PETG Silk',
    brand: 'Voolt3D',
    type: 'PETG',
    colorHex: '#ffffff',
    initialWeight: 1000,
    currentWeight: 90,
    purchaseDate: '2023-09-10',
    costPerKg: 180,
  },
  {
    id: '3',
    name: 'ABS Plus',
    brand: 'Cliever',
    type: 'ABS',
    colorHex: '#ff0000',
    initialWeight: 1000,
    currentWeight: 1000,
    purchaseDate: '2023-09-15',
    costPerKg: 140,
  },
]

const mockQuotes: Quote[] = [
  {
    id: '1',
    clientName: 'João Silva',
    items: [
      {
        id: 'i1',
        pieceName: 'Action Figure Yoda',
        weight: 150,
        timeHours: 5,
        filamentId: '1',
        costs: { material: 22.5, machine: 10, energy: 7.5, total: 40 },
        suggestedPrice: 60,
      },
    ],
    totalCosts: { material: 22.5, machine: 10, energy: 7.5, total: 40 },
    suggestedPrice: 60,
    finalPrice: 60,
    status: 'Aprovado',
    date: new Date().toISOString(),
  },
]

const mockOrders: Order[] = [
  { id: '1', quoteId: '1', status: 'Em produção', startDate: new Date().toISOString() },
]

const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Compra de Filamentos',
    type: 'Saída',
    amount: 300,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2',
    description: 'Serviço - Troca de bico',
    type: 'Saída',
    amount: 50,
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    description: 'Venda - Vaso decorativo',
    type: 'Entrada',
    amount: 120,
    date: new Date().toISOString(),
  },
]

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    energyCost: 1.5,
    machineCost: 2.0,
    profitMargin: 50,
  })
  const [filaments, setFilaments] = useState<Filament[]>(mockFilaments)
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes)
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)

  const updateSettings = (s: Settings) => setSettings(s)
  const addFilament = (f: Filament) => setFilaments((prev) => [f, ...prev])
  const updateFilament = (id: string, data: Partial<Filament>) =>
    setFilaments((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)))
  const updateFilamentWeight = (id: string, weight: number) =>
    setFilaments((prev) => prev.map((f) => (f.id === id ? { ...f, currentWeight: weight } : f)))

  const addQuote = (q: Quote) => setQuotes((prev) => [q, ...prev])
  const updateQuote = (id: string, data: Partial<Quote>) =>
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)))

  const updateQuoteStatus = (id: string, status: Quote['status']) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)))
    if (status === 'Aprovado') {
      addOrder({
        id: Date.now().toString(),
        quoteId: id,
        status: 'Aguardando',
        startDate: new Date().toISOString(),
      })
    }
  }

  const addOrder = (o: Order) => setOrders((prev) => [o, ...prev])

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id && status === 'Finalizado' && o.status !== 'Finalizado') {
          const quote = quotes.find((q) => q.id === o.quoteId)
          if (quote) {
            quote.items.forEach((item) => {
              const filament = filaments.find((f) => f.id === item.filamentId)
              if (filament) {
                updateFilamentWeight(filament.id, Math.max(0, filament.currentWeight - item.weight))
              }
            })
            addTransaction({
              id: Date.now().toString(),
              description: `Venda - Orçamento ${quote.id} (${quote.clientName})`,
              type: 'Entrada',
              amount: quote.finalPrice,
              date: new Date().toISOString(),
            })
          }
        }
        return o.id === id ? { ...o, status } : o
      }),
    )
  }

  const addTransaction = (t: Transaction) => setTransactions((prev) => [t, ...prev])

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        filaments,
        addFilament,
        updateFilament,
        updateFilamentWeight,
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
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

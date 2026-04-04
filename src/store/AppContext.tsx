import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Settings = {
  filamentCost: number
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
}

export type Quote = {
  id: string
  clientName: string
  pieceName: string
  weight: number
  timeHours: number
  filamentId: string
  costs: { material: number; machine: number; energy: number; total: number }
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
  updateFilamentWeight: (id: string, weight: number) => void
  quotes: Quote[]
  addQuote: (q: Quote) => void
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
    type: 'PLA',
    colorHex: '#000000',
    initialWeight: 1000,
    currentWeight: 850,
  },
  {
    id: '2',
    name: 'PETG Silk',
    type: 'PETG',
    colorHex: '#ffffff',
    initialWeight: 1000,
    currentWeight: 90,
  },
  {
    id: '3',
    name: 'ABS Plus',
    type: 'ABS',
    colorHex: '#ff0000',
    initialWeight: 1000,
    currentWeight: 1000,
  },
]

const mockQuotes: Quote[] = [
  {
    id: '1',
    clientName: 'João Silva',
    pieceName: 'Action Figure Yoda',
    weight: 150,
    timeHours: 5,
    filamentId: '1',
    costs: { material: 22.5, machine: 10, energy: 7.5, total: 40 },
    suggestedPrice: 60,
    finalPrice: 60,
    status: 'Aprovado',
    date: '2023-10-01',
  },
  {
    id: '2',
    clientName: 'Maria Santos',
    pieceName: 'Suporte Headset',
    weight: 80,
    timeHours: 2,
    filamentId: '2',
    costs: { material: 12, machine: 4, energy: 3, total: 19 },
    suggestedPrice: 28.5,
    finalPrice: 30,
    status: 'Pendente',
    date: '2023-10-02',
  },
]

const mockOrders: Order[] = [
  { id: '1', quoteId: '1', status: 'Em produção', startDate: '2023-10-02' },
]

const mockTransactions: Transaction[] = [
  { id: '1', description: 'Compra de Filamentos', type: 'Saída', amount: 300, date: '2023-09-28' },
  {
    id: '2',
    description: 'Serviço - Troca de bico',
    type: 'Saída',
    amount: 50,
    date: '2023-09-29',
  },
  {
    id: '3',
    description: 'Venda - Vaso decorativo',
    type: 'Entrada',
    amount: 120,
    date: '2023-09-30',
  },
]

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    filamentCost: 150,
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
  const updateFilamentWeight = (id: string, weight: number) =>
    setFilaments((prev) => prev.map((f) => (f.id === id ? { ...f, currentWeight: weight } : f)))
  const addQuote = (q: Quote) => setQuotes((prev) => [q, ...prev])

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
            const filament = filaments.find((f) => f.id === quote.filamentId)
            if (filament) {
              updateFilamentWeight(filament.id, Math.max(0, filament.currentWeight - quote.weight))
            }
            addTransaction({
              id: Date.now().toString(),
              description: `Venda - ${quote.pieceName}`,
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
        updateFilamentWeight,
        quotes,
        addQuote,
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

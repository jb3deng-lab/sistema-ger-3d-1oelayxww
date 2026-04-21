import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

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

const AppContext = createContext<AppContextType | undefined>(undefined)

const defaultSettings: Settings = {
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
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      const { data: s } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (s)
        setSettings({
          filamentCost: s.filament_cost,
          energyCost: s.energy_cost,
          machineCost: s.machine_cost,
          profitMargin: s.profit_margin,
          companyName: s.company_name,
          companyDocument: s.company_document,
          companyEmail: s.company_email,
          companyPhone: s.company_phone,
          companyAddress: s.company_address,
          companyLogo: s.company_logo,
        })
      else await supabase.from('settings').insert({ user_id: user.id }).select().single()

      const { data: c } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (c)
        setClients(
          c.map((x) => ({
            id: x.id,
            name: x.name,
            email: x.email || '',
            phone: x.phone || '',
            document: x.document || '',
            address: x.address || '',
          })),
        )

      const { data: m } = await supabase
        .from('machines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (m)
        setMachines(
          m.map((x) => ({
            id: x.id,
            name: x.name,
            purchaseValue: Number(x.purchase_value),
            usefulLifeHours: Number(x.useful_life_hours),
            depreciationRate: Number(x.depreciation_rate),
          })),
        )

      const { data: f } = await supabase
        .from('filaments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (f)
        setFilaments(
          f.map((x) => ({
            id: x.id,
            name: x.name,
            type: x.type,
            colorHex: x.color_hex,
            initialWeight: Number(x.initial_weight),
            currentWeight: Number(x.current_weight),
            brand: x.brand || '',
            purchaseDate: x.purchase_date || '',
            costPerKg: Number(x.cost_per_kg) || 0,
          })),
        )

      const { data: q } = await supabase
        .from('quotes')
        .select('*, quote_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (q)
        setQuotes(
          q.map((x) => ({
            id: x.id,
            clientId: x.client_id,
            clientName: x.client_name,
            totalCosts: {
              material: Number(x.total_material),
              machine: Number(x.total_machine),
              energy: Number(x.total_energy),
              total: Number(x.total_total),
            },
            suggestedPrice: Number(x.suggested_price),
            discount: Number(x.discount),
            finalPrice: Number(x.final_price),
            status: x.status as any,
            date: x.date,
            items: x.quote_items.map((i: any) => ({
              id: i.id,
              pieceName: i.piece_name,
              weight: Number(i.weight),
              timeHours: Number(i.time_hours),
              filamentId: i.filament_id,
              machineId: i.machine_id,
              quantity: Number(i.quantity),
              costs: {
                material: Number(i.costs_material),
                machine: Number(i.costs_machine),
                energy: Number(i.costs_energy),
                total: Number(i.costs_total),
              },
              suggestedPrice: Number(i.suggested_price),
            })),
          })),
        )

      const { data: o } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (o)
        setOrders(
          o.map((x) => ({
            id: x.id,
            quoteId: x.quote_id,
            status: x.status as any,
            startDate: x.start_date,
          })),
        )

      const { data: t } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (t)
        setTransactions(
          t.map((x) => ({
            id: x.id,
            description: x.description,
            type: x.type as any,
            amount: Number(x.amount),
            date: x.date,
          })),
        )

      setLoading(false)
    }
    loadData()
  }, [user])

  const updateSettings = async (s: Settings) => {
    if (!user) return
    setSettings(s)
    await supabase
      .from('settings')
      .update({
        filament_cost: s.filamentCost,
        energy_cost: s.energyCost,
        machine_cost: s.machineCost,
        profit_margin: s.profitMargin,
        company_name: s.companyName,
        company_document: s.companyDocument,
        company_email: s.companyEmail,
        company_phone: s.companyPhone,
        company_address: s.companyAddress,
        company_logo: s.companyLogo,
      })
      .eq('user_id', user.id)
  }

  const addClient = async (c: Client) => {
    setClients((p) => [c, ...p])
    await supabase
      .from('clients')
      .insert({
        user_id: user!.id,
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        document: c.document,
        address: c.address,
      })
  }
  const updateClient = async (id: string, d: Partial<Client>) => {
    setClients((p) => p.map((c) => (c.id === id ? { ...c, ...d } : c)))
    await supabase.from('clients').update(d).eq('id', id)
  }
  const deleteClient = async (id: string) => {
    setClients((p) => p.filter((c) => c.id !== id))
    await supabase.from('clients').delete().eq('id', id)
  }

  const addMachine = async (m: Machine) => {
    setMachines((p) => [m, ...p])
    await supabase
      .from('machines')
      .insert({
        id: m.id,
        user_id: user!.id,
        name: m.name,
        purchase_value: m.purchaseValue,
        useful_life_hours: m.usefulLifeHours,
        depreciation_rate: m.depreciationRate,
      })
  }
  const updateMachine = async (id: string, d: Partial<Machine>) => {
    setMachines((p) => p.map((m) => (m.id === id ? { ...m, ...d } : m)))
    await supabase
      .from('machines')
      .update({
        name: d.name,
        purchase_value: d.purchaseValue,
        useful_life_hours: d.usefulLifeHours,
        depreciation_rate: d.depreciationRate,
      })
      .eq('id', id)
  }
  const deleteMachine = async (id: string) => {
    setMachines((p) => p.filter((m) => m.id !== id))
    await supabase.from('machines').delete().eq('id', id)
  }

  const addFilament = async (f: Filament) => {
    setFilaments((p) => [f, ...p])
    await supabase
      .from('filaments')
      .insert({
        id: f.id,
        user_id: user!.id,
        name: f.name,
        type: f.type,
        color_hex: f.colorHex,
        initial_weight: f.initialWeight,
        current_weight: f.currentWeight,
        brand: f.brand,
        purchase_date: f.purchaseDate,
        cost_per_kg: f.costPerKg,
      })
  }
  const updateFilament = async (id: string, d: Partial<Filament>) => {
    setFilaments((p) => p.map((f) => (f.id === id ? { ...f, ...d } : f)))
    await supabase
      .from('filaments')
      .update({
        name: d.name,
        type: d.type,
        color_hex: d.colorHex,
        initial_weight: d.initialWeight,
        current_weight: d.currentWeight,
        brand: d.brand,
        purchase_date: d.purchaseDate,
        cost_per_kg: d.costPerKg,
      })
      .eq('id', id)
  }
  const updateFilamentWeight = async (id: string, w: number) => {
    setFilaments((p) => p.map((f) => (f.id === id ? { ...f, currentWeight: w } : f)))
    await supabase.from('filaments').update({ current_weight: w }).eq('id', id)
  }

  const addQuote = async (q: Quote) => {
    setQuotes((p) => [q, ...p])
    await supabase
      .from('quotes')
      .insert({
        id: q.id,
        user_id: user!.id,
        client_id: q.clientId,
        client_name: q.clientName,
        total_material: q.totalCosts.material,
        total_machine: q.totalCosts.machine,
        total_energy: q.totalCosts.energy,
        total_total: q.totalCosts.total,
        suggested_price: q.suggestedPrice,
        discount: q.discount,
        final_price: q.finalPrice,
        status: q.status,
        date: q.date,
      })
    if (q.items.length)
      await supabase
        .from('quote_items')
        .insert(
          q.items.map((i) => ({
            id: i.id,
            quote_id: q.id,
            piece_name: i.pieceName,
            weight: i.weight,
            time_hours: i.timeHours,
            filament_id: i.filamentId,
            machine_id: i.machineId,
            quantity: i.quantity,
            costs_material: i.costs.material,
            costs_machine: i.costs.machine,
            costs_energy: i.costs.energy,
            costs_total: i.costs.total,
            suggested_price: i.suggestedPrice,
          })),
        )
  }
  const updateQuote = async (id: string, d: Partial<Quote>) => {
    setQuotes((p) => p.map((q) => (q.id === id ? { ...q, ...d } : q)))
    if (d.items) {
      await supabase.from('quote_items').delete().eq('quote_id', id)
      await supabase
        .from('quote_items')
        .insert(
          d.items.map((i) => ({
            id: i.id,
            quote_id: id,
            piece_name: i.pieceName,
            weight: i.weight,
            time_hours: i.timeHours,
            filament_id: i.filamentId,
            machine_id: i.machineId,
            quantity: i.quantity,
            costs_material: i.costs.material,
            costs_machine: i.costs.machine,
            costs_energy: i.costs.energy,
            costs_total: i.costs.total,
            suggested_price: i.suggestedPrice,
          })),
        )
    }
    const updates: any = {}
    if (d.status) updates.status = d.status
    if (Object.keys(updates).length) await supabase.from('quotes').update(updates).eq('id', id)
  }

  const addOrder = async (o: Order) => {
    setOrders((p) => [o, ...p])
    await supabase
      .from('orders')
      .insert({
        id: o.id,
        user_id: user!.id,
        quote_id: o.quoteId,
        status: o.status,
        start_date: o.startDate,
      })
  }
  const updateOrderStatus = async (id: string, s: Order['status']) => {
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status: s } : o)))
    await supabase.from('orders').update({ status: s }).eq('id', id)
  }
  const addTransaction = async (t: Transaction) => {
    setTransactions((p) => [t, ...p])
    await supabase
      .from('transactions')
      .insert({
        id: t.id,
        user_id: user!.id,
        description: t.description,
        type: t.type,
        amount: t.amount,
        date: t.date,
      })
  }

  const updateQuoteStatus = async (id: string, s: Quote['status']) => {
    const quote = quotes.find((q) => q.id === id)
    if (!quote || quote.status === s) return
    setQuotes((p) => p.map((q) => (q.id === id ? { ...q, status: s } : q)))
    await supabase.from('quotes').update({ status: s }).eq('id', id)

    if (s === 'Aprovado') {
      addOrder({
        id: Date.now().toString(),
        quoteId: id,
        status: 'Aguardando',
        startDate: new Date().toISOString(),
      })
      let newFils = [...filaments]
      for (const item of quote.items) {
        const totalWeight = item.weight * (item.quantity || 1)
        newFils = newFils.map((f) => {
          if (f.id === item.filamentId) {
            const uw = Math.max(0, f.currentWeight - totalWeight)
            supabase.from('filaments').update({ current_weight: uw }).eq('id', f.id).then()
            return { ...f, currentWeight: uw }
          }
          return f
        })
      }
      setFilaments(newFils)
      addTransaction({
        id: Date.now().toString() + '-rev',
        description: `Receita Pedido #${quote.id.slice(-6)} - ${quote.clientName}`,
        type: 'Entrada',
        amount: quote.finalPrice,
        date: new Date().toISOString(),
      })
      addTransaction({
        id: Date.now().toString() + '-cost',
        description: `Custos Pedido #${quote.id.slice(-6)} - ${quote.clientName}`,
        type: 'Saída',
        amount: quote.totalCosts.total,
        date: new Date().toISOString(),
      })
    } else if (quote.status === 'Aprovado' && (s === 'Recusado' || s === 'Pendente')) {
      let newFils = [...filaments]
      for (const item of quote.items) {
        const totalWeight = item.weight * (item.quantity || 1)
        newFils = newFils.map((f) => {
          if (f.id === item.filamentId) {
            const uw = f.currentWeight + totalWeight
            supabase.from('filaments').update({ current_weight: uw }).eq('id', f.id).then()
            return { ...f, currentWeight: uw }
          }
          return f
        })
      }
      setFilaments(newFils)
      setTransactions((p) => {
        const toKeep = p.filter(
          (t) =>
            t.description !== `Receita Pedido #${quote.id.slice(-6)} - ${quote.clientName}` &&
            t.description !== `Custos Pedido #${quote.id.slice(-6)} - ${quote.clientName}`,
        )
        const toDelete = p.filter((t) => !toKeep.includes(t))
        toDelete.forEach((t) => supabase.from('transactions').delete().eq('id', t.id).then())
        return toKeep
      })
      const ord = orders.find((o) => o.quoteId === id)
      if (ord) {
        setOrders((p) => p.filter((o) => o.id !== ord.id))
        supabase.from('orders').delete().eq('id', ord.id).then()
      }
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Sincronizando dados com o servidor...
      </div>
    )

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

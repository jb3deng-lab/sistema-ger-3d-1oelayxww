import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export type Profile = {
  id: string
  name: string
  address: string
}

export type SalesMethod = {
  name: string
  fee: number
}

export type Settings = {
  energyCost: number
  machineCost: number
  profitMargin: number
  operatorHourCost: number
  categories: string[]
  salesMethods: SalesMethod[]
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
  clientType?: string
}

export type MaintenanceItem = {
  id: string
  name: string
  description: string
  code: string
  cost: number
  lifeHours: number
}

export type Machine = {
  id: string
  name: string
  purchaseValue: number
  usefulLifeHours: number
  depreciationRate: number
  powerWatts: number
  maintenanceItems: MaintenanceItem[]
}

export type ProductMaterial = {
  filamentId: string
  weight: number
}

export type ProductComponent = {
  name: string
  cost: number
}

export type Product = {
  id: string
  name: string
  category: string
  printTimeMins: number
  prepTimeMins: number
  packagingCost: number
  profitMargin: number | null
  materials: ProductMaterial[]
  extraComponents: ProductComponent[]
}

export type QuoteItem = {
  id: string
  productId?: string
  pieceName: string
  machineId: string
  quantity: number
  timeHours: number // machine time
  prepTimeHours: number // operator time
  materials: ProductMaterial[]
  extraComponents: ProductComponent[]
  profitMargin?: number
  costs: {
    material: number
    machine: number
    energy: number
    operator: number
    extra: number
    total: number
  }
  suggestedPrice: number
  // Legacy fields
  weight?: number
  filamentId?: string
}

export type Quote = {
  id: string
  clientId: string
  clientName: string
  items: QuoteItem[]
  totalCosts: {
    material: number
    machine: number
    energy: number
    operator: number
    extra: number
    total: number
  }
  suggestedPrice: number
  packagingCost: number
  shippingCost: number
  discount: number
  salesMethod?: string
  salesFeePercent?: number
  salesFeeValue?: number
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
  quoteId?: string
  description: string
  type: 'Entrada' | 'Saída'
  amount: number
  date: string
}

type AppContextType = {
  profile: Profile | null
  updateProfile: (p: Partial<Profile>) => Promise<void>
  settings: Settings
  updateSettings: (s: Settings) => void
  filaments: Filament[]
  addFilament: (f: Filament) => void
  updateFilament: (id: string, data: Partial<Filament>) => void
  updateFilamentWeight: (id: string, weight: number) => void
  deleteFilament: (id: string) => void
  clients: Client[]
  addClient: (c: Client) => void
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
  machines: Machine[]
  addMachine: (m: Machine) => void
  updateMachine: (id: string, data: Partial<Machine>) => void
  deleteMachine: (id: string) => void
  products: Product[]
  addProduct: (p: Product) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  quotes: Quote[]
  addQuote: (q: Quote) => void
  updateQuote: (id: string, data: Partial<Quote>) => void
  deleteQuote: (id: string) => void
  updateQuoteStatus: (id: string, status: Quote['status']) => void
  orders: Order[]
  addOrder: (o: Order) => void
  updateOrderStatus: (id: string, status: Order['status']) => void
  deleteOrder: (id: string) => void
  transactions: Transaction[]
  addTransaction: (t: Transaction) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const defaultSettings: Settings = {
  energyCost: 1.5,
  machineCost: 2.0,
  profitMargin: 50,
  operatorHourCost: 15.0,
  categories: ['B2B', 'B2C'],
  salesMethods: [{ name: 'Dinheiro/Pix', fee: 0 }],
  companyName: 'Minha 3D Print',
  companyDocument: '00.000.000/0001-00',
  companyEmail: 'contato@minha3d.com',
  companyPhone: '(11) 99999-9999',
  companyAddress: 'Rua Principal, 1000 - Centro',
  companyLogo: '',
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) setProfile({ id: p.id, name: p.name, address: p.address })

      const { data: s } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (s) {
        setSettings({
          energyCost: Number(s.energy_cost) || defaultSettings.energyCost,
          machineCost: Number(s.machine_cost) || defaultSettings.machineCost,
          profitMargin: Number(s.profit_margin) || defaultSettings.profitMargin,
          operatorHourCost: Number(s.operator_hour_cost) || defaultSettings.operatorHourCost,
          categories: (s.categories as string[]) || defaultSettings.categories,
          salesMethods: (s.sales_methods as SalesMethod[]) || defaultSettings.salesMethods,
          companyName: s.company_name || '',
          companyDocument: s.company_document || '',
          companyEmail: s.company_email || '',
          companyPhone: s.company_phone || '',
          companyAddress: s.company_address || '',
          companyLogo: s.company_logo || '',
        })
      } else {
        await supabase.from('settings').insert({ user_id: user.id }).select().single()
      }

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
            clientType: x.client_type || '',
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
            powerWatts: Number(x.power_watts || 0),
            maintenanceItems: (x.maintenance_items as any) || [],
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

      const { data: pr } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (pr)
        setProducts(
          pr.map((x) => ({
            id: x.id,
            name: x.name,
            category: x.category || '',
            printTimeMins: Number(x.print_time_mins),
            prepTimeMins: Number(x.prep_time_mins),
            packagingCost: Number(x.packaging_cost),
            profitMargin: x.profit_margin ? Number(x.profit_margin) : null,
            materials: (x.materials as any) || [],
            extraComponents: (x.extra_components as any) || [],
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
              operator: 0,
              extra: 0,
              total: Number(x.total_total),
            },
            suggestedPrice: Number(x.suggested_price),
            packagingCost: Number(x.packaging_cost || 0),
            shippingCost: Number(x.shipping_cost || 0),
            discount: Number(x.discount),
            salesMethod: x.sales_method || '',
            salesFeePercent: Number(x.sales_fee_percent || 0),
            salesFeeValue: Number(x.sales_fee_value || 0),
            finalPrice: Number(x.final_price),
            status: x.status as any,
            date: x.date,
            items: x.quote_items.map((i: any) => ({
              id: i.id,
              productId: i.product_id,
              pieceName: i.piece_name,
              machineId: i.machine_id,
              quantity: Number(i.quantity),
              timeHours: Number(i.time_hours),
              prepTimeHours: Number(i.prep_time_hours || 0),
              profitMargin: i.profit_margin ? Number(i.profit_margin) : undefined,
              materials: (i.materials as any)?.length
                ? i.materials
                : i.filament_id
                  ? [{ filamentId: i.filament_id, weight: Number(i.weight) }]
                  : [],
              extraComponents: (i.extra_components as any) || [],
              costs: {
                material: Number(i.costs_material),
                machine: Number(i.costs_machine),
                energy: Number(i.costs_energy),
                operator: Number(i.costs_operator || 0),
                extra: Number(i.costs_extra || 0),
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
            quoteId: x.quote_id || undefined,
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

  const updateProfile = async (p: Partial<Profile>) => {
    if (!user || !profile) return
    const updated = { ...profile, ...p }
    setProfile(updated)
    await supabase
      .from('profiles')
      .update({ name: updated.name, address: updated.address })
      .eq('id', user.id)
  }

  const updateSettings = async (s: Settings) => {
    if (!user) return
    setSettings(s)
    await supabase
      .from('settings')
      .update({
        energy_cost: s.energyCost,
        machine_cost: s.machineCost,
        profit_margin: s.profitMargin,
        operator_hour_cost: s.operatorHourCost,
        categories: s.categories as any,
        sales_methods: s.salesMethods as any,
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
        client_type: c.clientType,
      })
  }
  const updateClient = async (id: string, d: Partial<Client>) => {
    setClients((p) => p.map((c) => (c.id === id ? { ...c, ...d } : c)))
    await supabase
      .from('clients')
      .update({ ...d, client_type: d.clientType })
      .eq('id', id)
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
        power_watts: m.powerWatts,
        maintenance_items: m.maintenanceItems as any,
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
        power_watts: d.powerWatts,
        maintenance_items: d.maintenanceItems as any,
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
  const deleteFilament = async (id: string) => {
    setFilaments((p) => p.filter((f) => f.id !== id))
    await supabase.from('filaments').delete().eq('id', id)
  }

  const addProduct = async (pr: Product) => {
    setProducts((p) => [pr, ...p])
    await supabase
      .from('products')
      .insert({
        id: pr.id,
        user_id: user!.id,
        name: pr.name,
        category: pr.category,
        print_time_mins: pr.printTimeMins,
        prep_time_mins: pr.prepTimeMins,
        packaging_cost: pr.packagingCost,
        profit_margin: pr.profitMargin,
        materials: pr.materials as any,
        extra_components: pr.extraComponents as any,
      })
  }
  const updateProduct = async (id: string, d: Partial<Product>) => {
    setProducts((p) => p.map((pr) => (pr.id === id ? { ...pr, ...d } : pr)))
    await supabase
      .from('products')
      .update({
        name: d.name,
        category: d.category,
        print_time_mins: d.printTimeMins,
        prep_time_mins: d.prepTimeMins,
        packaging_cost: d.packagingCost,
        profit_margin: d.profitMargin,
        materials: d.materials as any,
        extra_components: d.extraComponents as any,
      })
      .eq('id', id)
  }
  const deleteProduct = async (id: string) => {
    setProducts((p) => p.filter((pr) => pr.id !== id))
    await supabase.from('products').delete().eq('id', id)
  }

  const addQuote = async (q: Quote) => {
    setQuotes((p) => [q, ...p])
    await supabase.from('quotes').insert({
      id: q.id,
      user_id: user!.id,
      client_id: q.clientId,
      client_name: q.clientName,
      total_material: q.totalCosts.material,
      total_machine: q.totalCosts.machine,
      total_energy: q.totalCosts.energy,
      total_total: q.totalCosts.total,
      suggested_price: q.suggestedPrice,
      packaging_cost: q.packagingCost,
      shipping_cost: q.shippingCost,
      discount: q.discount,
      sales_method: q.salesMethod,
      sales_fee_percent: q.salesFeePercent,
      sales_fee_value: q.salesFeeValue,
      final_price: q.finalPrice,
      status: q.status,
      date: q.date,
    })
    if (q.items.length) {
      await supabase.from('quote_items').insert(
        q.items.map((i) => ({
          id: i.id,
          quote_id: q.id,
          product_id: i.productId,
          piece_name: i.pieceName,
          machine_id: i.machineId,
          quantity: i.quantity,
          time_hours: i.timeHours,
          prep_time_hours: i.prepTimeHours,
          profit_margin: i.profitMargin,
          materials: i.materials as any,
          extra_components: i.extraComponents as any,
          costs_material: i.costs.material,
          costs_machine: i.costs.machine,
          costs_energy: i.costs.energy,
          costs_operator: i.costs.operator,
          costs_extra: i.costs.extra,
          costs_total: i.costs.total,
          suggested_price: i.suggestedPrice,
          weight: 0,
          filament_id: i.materials[0]?.filamentId || null,
        })),
      )
    }
  }

  const updateQuote = async (id: string, d: Partial<Quote>) => {
    setQuotes((p) => p.map((q) => (q.id === id ? { ...q, ...d } : q)))
    if (d.items) {
      await supabase.from('quote_items').delete().eq('quote_id', id)
      await supabase.from('quote_items').insert(
        d.items.map((i) => ({
          id: i.id,
          quote_id: id,
          product_id: i.productId,
          piece_name: i.pieceName,
          machine_id: i.machineId,
          quantity: i.quantity,
          time_hours: i.timeHours,
          prep_time_hours: i.prepTimeHours,
          profit_margin: i.profitMargin,
          materials: i.materials as any,
          extra_components: i.extraComponents as any,
          costs_material: i.costs.material,
          costs_machine: i.costs.machine,
          costs_energy: i.costs.energy,
          costs_operator: i.costs.operator,
          costs_extra: i.costs.extra,
          costs_total: i.costs.total,
          suggested_price: i.suggestedPrice,
          weight: 0,
          filament_id: i.materials[0]?.filamentId || null,
        })),
      )
    }
    const updates: any = {}
    if (d.status) updates.status = d.status
    if (d.packagingCost !== undefined) updates.packaging_cost = d.packagingCost
    if (d.shippingCost !== undefined) updates.shipping_cost = d.shippingCost
    if (d.discount !== undefined) updates.discount = d.discount
    if (d.salesMethod !== undefined) updates.sales_method = d.salesMethod
    if (d.salesFeePercent !== undefined) updates.sales_fee_percent = d.salesFeePercent
    if (d.salesFeeValue !== undefined) updates.sales_fee_value = d.salesFeeValue
    if (d.finalPrice !== undefined) updates.final_price = d.finalPrice
    if (d.totalCosts !== undefined) {
      updates.total_material = d.totalCosts.material
      updates.total_machine = d.totalCosts.machine
      updates.total_energy = d.totalCosts.energy
      updates.total_total = d.totalCosts.total
    }
    if (d.suggestedPrice !== undefined) updates.suggested_price = d.suggestedPrice
    if (Object.keys(updates).length) await supabase.from('quotes').update(updates).eq('id', id)
  }

  const deleteQuote = async (id: string) => {
    setQuotes((p) => p.filter((q) => q.id !== id))
    setTransactions((p) => p.filter((t) => t.quoteId !== id))
    await supabase.from('quotes').delete().eq('id', id)
    await supabase.from('transactions').delete().eq('quote_id', id)
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
  const deleteOrder = async (id: string) => {
    const o = orders.find((x) => x.id === id)
    if (o) {
      setOrders((p) => p.filter((x) => x.id !== id))
      await supabase.from('orders').delete().eq('id', id)
      // Removing order implies reverting the quote to pending maybe? That's business logic, but at least we can delete its transactions.
    }
  }

  const addTransaction = async (t: Transaction) => {
    setTransactions((p) => [t, ...p])
    await supabase
      .from('transactions')
      .insert({
        id: t.id,
        user_id: user!.id,
        quote_id: t.quoteId,
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
        const qty = item.quantity || 1
        for (const mat of item.materials) {
          const totalWeight = mat.weight * qty
          newFils = newFils.map((f) => {
            if (f.id === mat.filamentId) {
              const uw = Math.max(0, f.currentWeight - totalWeight)
              supabase.from('filaments').update({ current_weight: uw }).eq('id', f.id).then()
              return { ...f, currentWeight: uw }
            }
            return f
          })
        }
      }
      setFilaments(newFils)
      addTransaction({
        id: Date.now().toString() + '-rev',
        quoteId: id,
        description: `Receita Pedido #${quote.id.slice(-6)} - ${quote.clientName}`,
        type: 'Entrada',
        amount: quote.finalPrice,
        date: new Date().toISOString(),
      })
      addTransaction({
        id: Date.now().toString() + '-cost',
        quoteId: id,
        description: `Custos Pedido #${quote.id.slice(-6)} - ${quote.clientName}`,
        type: 'Saída',
        amount: quote.totalCosts.total,
        date: new Date().toISOString(),
      })
    } else if (quote.status === 'Aprovado' && (s === 'Recusado' || s === 'Pendente')) {
      let newFils = [...filaments]
      for (const item of quote.items) {
        const qty = item.quantity || 1
        for (const mat of item.materials) {
          const totalWeight = mat.weight * qty
          newFils = newFils.map((f) => {
            if (f.id === mat.filamentId) {
              const uw = f.currentWeight + totalWeight
              supabase.from('filaments').update({ current_weight: uw }).eq('id', f.id).then()
              return { ...f, currentWeight: uw }
            }
            return f
          })
        }
      }
      setFilaments(newFils)
      setTransactions((p) => p.filter((t) => t.quoteId !== id))
      supabase.from('transactions').delete().eq('quote_id', id).then()

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
        profile,
        updateProfile,
        settings,
        updateSettings,
        filaments,
        addFilament,
        updateFilament,
        updateFilamentWeight,
        deleteFilament,
        clients,
        addClient,
        updateClient,
        deleteClient,
        machines,
        addMachine,
        updateMachine,
        deleteMachine,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        quotes,
        addQuote,
        updateQuote,
        deleteQuote,
        updateQuoteStatus,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
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

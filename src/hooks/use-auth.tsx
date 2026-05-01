import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (
    email: string,
    password: string,
    name?: string,
    address?: string,
    phone?: string,
  ) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  verifyOtp: (email: string, token: string) => Promise<{ error: any }>
  resendOtp: (email: string) => Promise<{ error: any }>
  updateProfile: (updates: {
    email?: string
    password?: string
    name?: string
    address?: string
    phone?: string
  }) => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (
    email: string,
    password: string,
    name?: string,
    address?: string,
    phone?: string,
  ) => {
    // Limpa estado anterior para evitar cache de sessão
    await supabase.auth.signOut()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, address, phone },
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    })
    return { error }
  }

  const resendOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: undefined,
      },
    })
    return { error }
  }

  const updateProfile = async (updates: {
    email?: string
    password?: string
    name?: string
    address?: string
    phone?: string
  }) => {
    const dataToUpdate: any = {}
    if (updates.email) dataToUpdate.email = updates.email
    if (updates.password) dataToUpdate.password = updates.password
    if (updates.name || updates.address || updates.phone) {
      dataToUpdate.data = {
        name: updates.name || user?.user_metadata?.name,
        address: updates.address || user?.user_metadata?.address,
        phone: updates.phone || user?.user_metadata?.phone,
      }
    }

    const { error } = await supabase.auth.updateUser(dataToUpdate)

    if (!error && user && (updates.name || updates.address || updates.phone)) {
      await supabase
        .from('profiles')
        .update({
          name: updates.name || user.user_metadata?.name,
          address: updates.address || user.user_metadata?.address,
          phone: updates.phone || user.user_metadata?.phone,
        } as any)
        .eq('id', user.id)
    }

    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signUp,
        signIn,
        signOut,
        verifyOtp,
        resendOtp,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

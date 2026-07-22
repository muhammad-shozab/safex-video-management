import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Role = 'Admin' | 'General' | 'Kids'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  kidsMode: boolean
  avatarUrl?: string
}

interface Ctx {
  user: User | null
  signIn: (email: string, password: string) => Promise<User>
  signInAs: (role: Role) => void
  signOut: () => void
  updateProfile: (patch: Partial<User>) => void
}

const AuthCtx = createContext<Ctx>({} as Ctx)

export const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/a/ACg8ocI3TCqAOFDc-cgZVtK7J6a6_lBN1vYfVDlHflT1E1EaByDNvjo=s288-c-no'

const DEFAULT_USER: User = {
  id: 'shozab',
  name: 'Shozab Haider',
  email: 'shozab@safex.io',
  role: 'Admin',
  kidsMode: false,
  avatarUrl: DEFAULT_AVATAR,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return DEFAULT_USER
    const raw = localStorage.getItem('shozab.user')
    return raw ? (JSON.parse(raw) as User) : DEFAULT_USER
  })

  useEffect(() => {
    if (user) localStorage.setItem('shozab.user', JSON.stringify(user))
    else localStorage.removeItem('shozab.user')
  }, [user])

  const signIn = async (email: string, _password: string) => {
    // Demo auth: accepts anything, resolves to a matching or fresh user.
    const role: Role = email.toLowerCase().includes('kid') ? 'Kids'
      : email.toLowerCase().includes('general') ? 'General' : 'Admin'
    const u: User = {
      id: email,
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Shozab Haider',
      email,
      role,
      kidsMode: role === 'Kids',
      avatarUrl: DEFAULT_AVATAR,
    }
    setUser(u)
    return u
  }

  const signInAs = (role: Role) =>
    setUser({
      id: `demo-${role.toLowerCase()}`,
      name: role === 'Admin' ? 'Shozab Haider' : role === 'Kids' ? 'Kid Explorer' : 'General User',
      email: `${role.toLowerCase()}@safex.io`,
      role,
      kidsMode: role === 'Kids',
      avatarUrl: DEFAULT_AVATAR,
    })

  const signOut = () => setUser(null)
  const updateProfile = (patch: Partial<User>) => setUser(u => (u ? { ...u, ...patch } : u))

  return (
    <AuthCtx.Provider value={{ user, signIn, signInAs, signOut, updateProfile }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)

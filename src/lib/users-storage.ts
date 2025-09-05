// Temporary in-memory storage for users
// This will be replaced with database later

export interface User {
  id: string
  name: string
  email: string
  password: string
  phone?: string | null
  cpf?: string | null
  cnpj?: string | null
  role: 'USER' | 'ADMIN' | 'SUPPORT'
  createdAt: string
  updatedAt: string
}

export const users: User[] = [
  // Demo user
  {
    id: 'demo-user',
    name: 'Usuário Demo',
    email: 'demo@querodocumento.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvC2Q7gkUuD0/pO', // 123456
    phone: '(11) 99999-9999',
    cpf: '12345678901',
    cnpj: null,
    role: 'USER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export function findUserByEmail(email: string): User | undefined {
  return users.find(user => user.email === email)
}

export function findUserById(id: string): User | undefined {
  return users.find(user => user.id === id)
}

export function findUserByDocument(document: string): User | undefined {
  return users.find(user => user.cpf === document || user.cnpj === document)
}

export function addUser(user: User): void {
  users.push(user)
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const userIndex = users.findIndex(user => user.id === id)
  if (userIndex === -1) return null
  
  users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() }
  return users[userIndex]
}
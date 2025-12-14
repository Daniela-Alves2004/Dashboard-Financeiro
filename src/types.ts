// Tipos para transações financeiras
export type Person = 'Daniela' | 'Giovani'

export interface Transaction {
  id: string
  dataLancamento: string
  historico: string
  descricao: string
  valor: number
  saldo: number
  pessoa: Person
  categoria?: string
}

export interface Investment {
  id: string
  pessoa: Person
  tipo: string
  titulo?: string
  valor: number
  data: string
  taxaRendimento: number
}

// Categorias pré-definidas
export const CATEGORIAS = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Moradia',
  'Compras',
  'Saúde',
  'Educação',
  'Serviços',
  'Outros'
] as const

export type Categoria = typeof CATEGORIAS[number]


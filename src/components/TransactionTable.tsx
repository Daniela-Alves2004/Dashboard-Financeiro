import { useState, useMemo } from 'react'
import { Transaction, Person, Categoria, CATEGORIAS } from '../types'
import { updateTransaction } from '../utils/storage'
import './TransactionTable.css'

interface TransactionTableProps {
  transactions: Transaction[]
  title: string
  onUpdate?: () => void
}

function TransactionTable({ transactions, title, onUpdate }: TransactionTableProps) {
  const [sortField, setSortField] = useState<'dataLancamento' | 'valor'>('dataLancamento')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterHistorico, setFilterHistorico] = useState('')
  const [filterDescricao, setFilterDescricao] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  // Filtra e ordena as transações
  const filteredAndSorted = useMemo(() => {
    let filtered = [...transactions]

    // Filtros
    if (filterHistorico) {
      filtered = filtered.filter(t =>
        t.historico.toLowerCase().includes(filterHistorico.toLowerCase())
      )
    }

    if (filterDescricao) {
      filtered = filtered.filter(t =>
        t.descricao.toLowerCase().includes(filterDescricao.toLowerCase())
      )
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0

      if (sortField === 'dataLancamento') {
        comparison = new Date(a.dataLancamento).getTime() - new Date(b.dataLancamento).getTime()
      } else if (sortField === 'valor') {
        comparison = Math.abs(a.valor) - Math.abs(b.valor)
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [transactions, sortField, sortDirection, filterHistorico, filterDescricao])

  const handleSort = (field: 'dataLancamento' | 'valor') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleCategoryChange = (transactionId: string, newCategory: Categoria) => {
    updateTransaction(transactionId, { categoria: newCategory })
    setEditingCategory(null)
    if (onUpdate) onUpdate()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const uniqueHistoricos = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.historico))).sort()
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <div className="transaction-table-container">
        <h3>{title}</h3>
        <p className="empty-message">Nenhuma transação encontrada</p>
      </div>
    )
  }

  return (
    <div className="transaction-table-container">
      <h3>{title} ({filteredAndSorted.length} transações)</h3>

      <div className="table-filters">
        <div className="filter-group">
          <label>Filtrar por Histórico:</label>
          <select
            value={filterHistorico}
            onChange={(e) => setFilterHistorico(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos</option>
            {uniqueHistoricos.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filtrar por Descrição:</label>
          <input
            type="text"
            value={filterDescricao}
            onChange={(e) => setFilterDescricao(e.target.value)}
            placeholder="Buscar descrição..."
            className="filter-input"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="transaction-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('dataLancamento')} className="sortable">
                Data {sortField === 'dataLancamento' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Histórico</th>
              <th>Descrição</th>
              <th onClick={() => handleSort('valor')} className="sortable">
                Valor {sortField === 'valor' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Saldo</th>
              <th>Categoria</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map(transaction => (
              <tr key={transaction.id}>
                <td>{formatDate(transaction.dataLancamento)}</td>
                <td>{transaction.historico}</td>
                <td>{transaction.descricao}</td>
                <td className={transaction.valor < 0 ? 'negative' : 'positive'}>
                  {formatCurrency(transaction.valor)}
                </td>
                <td>{formatCurrency(transaction.saldo)}</td>
                <td>
                  {editingCategory === transaction.id ? (
                    <select
                      value={transaction.categoria || 'Outros'}
                      onChange={(e) => handleCategoryChange(transaction.id, e.target.value as Categoria)}
                      onBlur={() => setEditingCategory(null)}
                      autoFocus
                      className="category-select"
                    >
                      {CATEGORIAS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <span
                      onClick={() => setEditingCategory(transaction.id)}
                      className="category-editable"
                      title="Clique para editar"
                    >
                      {transaction.categoria || 'Outros'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TransactionTable


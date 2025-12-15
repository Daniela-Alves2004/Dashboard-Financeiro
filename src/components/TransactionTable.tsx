import { useState, useMemo } from 'react'
import { Transaction, CATEGORIAS } from '../types'
import { updateTransaction, deleteTransaction } from '../utils/storage'
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
  const [editRowId, setEditRowId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Transaction | null>(null)

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

  const startEdit = (t: Transaction) => {
    setEditRowId(t.id)
    setEditDraft({ ...t })
  }

  const cancelEdit = () => {
    setEditRowId(null)
    setEditDraft(null)
  }

  const handleDraftChange = (field: keyof Transaction, value: string) => {
    if (!editDraft) return
    if (field === 'valor' || field === 'saldo') {
      const parsed = value === '' ? NaN : parseFloat(value)
      setEditDraft({ ...editDraft, [field]: parsed })
    } else {
      setEditDraft({ ...editDraft, [field]: value })
    }
  }

  const saveEdit = () => {
    if (!editDraft) return
    if (!editDraft.dataLancamento || !editDraft.historico || !editDraft.descricao || Number.isNaN(editDraft.valor) || Number.isNaN(editDraft.saldo)) {
      return
    }
    updateTransaction(editDraft.id, {
      dataLancamento: editDraft.dataLancamento,
      historico: editDraft.historico,
      descricao: editDraft.descricao,
      valor: editDraft.valor,
      saldo: editDraft.saldo,
      categoria: editDraft.categoria
    })
    cancelEdit()
    if (onUpdate) onUpdate()
  }

  const handleDelete = (transactionId: string) => {
    deleteTransaction(transactionId)
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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map(transaction => (
              <tr key={transaction.id}>
                <td>
                  {editRowId === transaction.id ? (
                    <input
                      type="date"
                      value={editDraft?.dataLancamento || ''}
                      onChange={(e) => handleDraftChange('dataLancamento', e.target.value)}
                    />
                  ) : (
                    formatDate(transaction.dataLancamento)
                  )}
                </td>
                <td>
                  {editRowId === transaction.id ? (
                    <input
                      type="text"
                      value={editDraft?.historico || ''}
                      onChange={(e) => handleDraftChange('historico', e.target.value)}
                    />
                  ) : (
                    transaction.historico
                  )}
                </td>
                <td>
                  {editRowId === transaction.id ? (
                    <input
                      type="text"
                      value={editDraft?.descricao || ''}
                      onChange={(e) => handleDraftChange('descricao', e.target.value)}
                    />
                  ) : (
                    transaction.descricao
                  )}
                </td>
                <td className={transaction.valor < 0 ? 'negative' : 'positive'}>
                  {editRowId === transaction.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editDraft && !Number.isNaN(editDraft.valor) ? editDraft.valor : ''}
                      onChange={(e) => handleDraftChange('valor', e.target.value)}
                    />
                  ) : (
                    formatCurrency(transaction.valor)
                  )}
                </td>
                <td>
                  {editRowId === transaction.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editDraft && !Number.isNaN(editDraft.saldo) ? editDraft.saldo : ''}
                      onChange={(e) => handleDraftChange('saldo', e.target.value)}
                    />
                  ) : (
                    formatCurrency(transaction.saldo)
                  )}
                </td>
                <td>
                  {editRowId === transaction.id ? (
                    <select
                      value={editDraft?.categoria || 'Outros'}
                      onChange={(e) => handleDraftChange('categoria', e.target.value)}
                      className="category-select"
                    >
                      {CATEGORIAS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="category-pill">{transaction.categoria || 'Outros'}</span>
                  )}
                </td>
                <td>
                  {editRowId === transaction.id ? (
                    <div className="action-buttons">
                      <button className="btn-small primary" onClick={saveEdit}>Salvar</button>
                      <button className="btn-small" onClick={cancelEdit}>Cancelar</button>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button className="btn-small" onClick={() => startEdit(transaction)}>Editar</button>
                      <button className="btn-small danger" onClick={() => handleDelete(transaction.id)}>Remover</button>
                    </div>
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


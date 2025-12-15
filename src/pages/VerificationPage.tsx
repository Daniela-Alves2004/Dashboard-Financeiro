import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Transaction, CATEGORIAS, Categoria } from '../types'
import {
  loadPendingTransactions,
  clearPendingTransactions,
  addTransactions
} from '../utils/storage'
import './VerificationPage.css'

type FieldKey = 'dataLancamento' | 'historico' | 'descricao' | 'valor' | 'saldo' | 'categoria'

interface RowError {
  dataLancamento?: string
  historico?: string
  descricao?: string
  valor?: string
  saldo?: string
  categoria?: string
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(value)
  return !Number.isNaN(d.getTime())
}

function VerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [rows, setRows] = useState<Transaction[]>([])
  const [message, setMessage] = useState<{ type: 'info' | 'error'; text: string } | null>(null)

  // Carrega transações pendentes ao montar
  useEffect(() => {
    const pending = loadPendingTransactions()
    setRows(pending)

    if (pending.length === 0) {
      setMessage({
        type: 'info',
        text: 'Nenhuma transação pendente para verificar. Importe um CSV para começar.'
      })
    } else if (location.state && (location.state as any).count) {
      setMessage({
        type: 'info',
        text: `${(location.state as any).count} transações aguardando sua confirmação. Revise antes de salvar.`
      })
    }
  }, [location.state])

  const rowErrors = useMemo<Record<string, RowError>>(() => {
    const errors: Record<string, RowError> = {}

    rows.forEach(row => {
      const rowError: RowError = {}

      if (!row.dataLancamento || !isValidDate(row.dataLancamento)) {
        rowError.dataLancamento = 'Data inválida (use YYYY-MM-DD)'
      }
      if (!row.historico?.trim()) {
        rowError.historico = 'Histórico é obrigatório'
      }
      if (!row.descricao?.trim()) {
        rowError.descricao = 'Descrição é obrigatória'
      }
      if (!row.categoria?.trim()) {
        rowError.categoria = 'Categoria é obrigatória'
      }
      if (Number.isNaN(Number(row.valor))) {
        rowError.valor = 'Valor deve ser numérico'
      }
      if (Number.isNaN(Number(row.saldo))) {
        rowError.saldo = 'Saldo deve ser numérico'
      }

      if (Object.keys(rowError).length > 0) {
        errors[row.id] = rowError
      }
    })

    return errors
  }, [rows])

  const hasErrors = useMemo(() => {
    return rows.length === 0 || Object.keys(rowErrors).length > 0
  }, [rowErrors, rows.length])

  const summary = useMemo(() => {
    const entradas = rows.filter(r => r.valor > 0).reduce((sum, r) => sum + r.valor, 0)
    const saidas = rows.filter(r => r.valor < 0).reduce((sum, r) => sum + Math.abs(r.valor), 0)
    const saldoFinal = rows.length > 0 ? rows[rows.length - 1].saldo : 0

    return { entradas, saidas, saldoFinal, total: rows.length }
  }, [rows])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleFieldChange = (id: string, field: FieldKey, value: string) => {
    setRows(prev =>
      prev.map(row => {
        if (row.id !== id) return row
        if (field === 'valor' || field === 'saldo') {
          const parsed = value === '' ? NaN : Number(value)
          return { ...row, [field]: parsed }
        }
        if (field === 'categoria') {
          return { ...row, categoria: value }
        }
        return { ...row, [field]: value }
      })
    )
  }

  const handleRemove = (id: string) => {
    setRows(prev => prev.filter(row => row.id !== id))
  }

  const handleCancel = () => {
    clearPendingTransactions()
    navigate('/')
  }

  const handleConfirm = () => {
    if (hasErrors) {
      setMessage({
        type: 'error',
        text: 'Corrija os campos inválidos antes de confirmar.'
      })
      return
    }

    addTransactions(rows)
    clearPendingTransactions()
    navigate('/tabelas')
  }

  if (rows.length === 0) {
    return (
      <div className="verification-page">
        <h2>🔎 Verificação de Dados Importados</h2>
        {message && <div className={`banner ${message.type}`}>{message.text}</div>}
        <p>Nenhuma transação pendente. Importe um novo CSV para verificar.</p>
        <div className="actions">
          <button className="btn-secondary" onClick={() => navigate('/')}>Voltar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="verification-page">
      <h2>🔎 Verificação de Dados Importados</h2>
      {message && <div className={`banner ${message.type}`}>{message.text}</div>}

      <div className="verification-summary">
        <div className="summary-item">
          <span>Total de transações</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-item">
          <span>Total de entradas</span>
          <strong className="positive">{formatCurrency(summary.entradas)}</strong>
        </div>
        <div className="summary-item">
          <span>Total de saídas</span>
          <strong className="negative">-{formatCurrency(summary.saidas)}</strong>
        </div>
        <div className="summary-item">
          <span>Saldo final (informado)</span>
          <strong>{formatCurrency(summary.saldoFinal)}</strong>
        </div>
      </div>

      <div className="verification-table-wrapper">
        <table className="verification-table">
          <thead>
            <tr>
              <th>Data lançamento</th>
              <th>Histórico</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Saldo</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const errors = rowErrors[row.id] || {}
              return (
                <tr key={row.id}>
                  <td>
                    <input
                      type="date"
                      value={row.dataLancamento}
                      onChange={(e) => handleFieldChange(row.id, 'dataLancamento', e.target.value)}
                      className={errors.dataLancamento ? 'invalid' : ''}
                    />
                    {errors.dataLancamento && <span className="error">{errors.dataLancamento}</span>}
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.historico}
                      onChange={(e) => handleFieldChange(row.id, 'historico', e.target.value)}
                      className={errors.historico ? 'invalid' : ''}
                    />
                    {errors.historico && <span className="error">{errors.historico}</span>}
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.descricao}
                      onChange={(e) => handleFieldChange(row.id, 'descricao', e.target.value)}
                      className={errors.descricao ? 'invalid' : ''}
                    />
                    {errors.descricao && <span className="error">{errors.descricao}</span>}
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={Number.isNaN(row.valor) ? '' : row.valor}
                      onChange={(e) => handleFieldChange(row.id, 'valor', e.target.value)}
                      className={errors.valor ? 'invalid' : row.valor < 0 ? 'negative' : 'positive'}
                    />
                    {errors.valor && <span className="error">{errors.valor}</span>}
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={Number.isNaN(row.saldo) ? '' : row.saldo}
                      onChange={(e) => handleFieldChange(row.id, 'saldo', e.target.value)}
                      className={errors.saldo ? 'invalid' : ''}
                    />
                    {errors.saldo && <span className="error">{errors.saldo}</span>}
                  </td>
                  <td>
                    <select
                      value={row.categoria || 'Outros'}
                      onChange={(e) => handleFieldChange(row.id, 'categoria', e.target.value)}
                      className={errors.categoria ? 'invalid' : ''}
                    >
                      {CATEGORIAS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.categoria && <span className="error">{errors.categoria}</span>}
                  </td>
                  <td>
                    <button className="btn-link danger" onClick={() => handleRemove(row.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="verification-actions">
        <div className="pending-note">
          ⚠️ Os dados ainda <strong>não foram salvos</strong>. Confirme para aplicar no sistema.
        </div>
        <div className="actions">
          <button className="btn-secondary" onClick={handleCancel}>Cancelar e descartar</button>
          <button
            className="btn-primary"
            onClick={handleConfirm}
            disabled={hasErrors}
            title={hasErrors ? 'Corrija os erros antes de confirmar' : 'Confirmar e salvar'}
          >
            Confirmar dados
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerificationPage



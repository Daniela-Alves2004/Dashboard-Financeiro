import { useState, useEffect } from 'react'
import { Transaction, Person } from '../types'
import { loadTransactions } from '../utils/storage'
import TransactionTable from '../components/TransactionTable'
import './TablesPage.css'

function TablesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [viewMode, setViewMode] = useState<'separate' | 'consolidated'>('separate')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const data = loadTransactions()
    setTransactions(data)
  }

  const danielaTransactions = transactions.filter(t => t.pessoa === 'Daniela')
  const giovaniTransactions = transactions.filter(t => t.pessoa === 'Giovani')

  return (
    <div className="tables-page">
      <div className="page-header">
        <h2>📊 Visualização de Transações</h2>
        <div className="view-toggle">
          <button
            className={viewMode === 'separate' ? 'active' : ''}
            onClick={() => setViewMode('separate')}
          >
            Visualização Separada
          </button>
          <button
            className={viewMode === 'consolidated' ? 'active' : ''}
            onClick={() => setViewMode('consolidated')}
          >
            Visão Consolidada
          </button>
        </div>
      </div>

      {viewMode === 'separate' ? (
        <>
          <TransactionTable
            transactions={danielaTransactions}
            title="💼 Transações - Daniela"
            onUpdate={loadData}
          />
          <TransactionTable
            transactions={giovaniTransactions}
            title="💼 Transações - Giovani"
            onUpdate={loadData}
          />
        </>
      ) : (
        <TransactionTable
          transactions={transactions}
          title="📈 Visão Consolidada (Daniela + Giovani)"
          onUpdate={loadData}
        />
      )}

      {transactions.length === 0 && (
        <div className="empty-state">
          <p>Nenhuma transação encontrada.</p>
          <p>Vá para a página de <strong>Upload</strong> para importar extratos bancários.</p>
        </div>
      )}
    </div>
  )
}

export default TablesPage


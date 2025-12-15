import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Person } from '../types'
import { parseCSV } from '../utils/csvParser'
import { categorizarTransacoes } from '../utils/categorization'
import { savePendingTransactions, clearPendingTransactions } from '../utils/storage'
import './UploadPage.css'

function UploadPage() {
  const [pessoa, setPessoa] = useState<Person>('Daniela')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const navigate = useNavigate()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Por favor, selecione um arquivo CSV' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Parse do CSV
      const transactions = await parseCSV(file, pessoa)
      
      if (transactions.length === 0) {
        setMessage({ type: 'error', text: 'Nenhuma transação encontrada no arquivo' })
        setLoading(false)
        return
      }

      // Categoriza as transações
      const categorizadas = categorizarTransacoes(transactions)

      // Limpa pendências anteriores e salva como pendente para revisão
      clearPendingTransactions()
      savePendingTransactions(categorizadas)

      // Redireciona para página de verificação antes de qualquer persistência
      navigate('/verificacao', { state: { count: categorizadas.length, pessoa } })

      // Limpa o input
      event.target.value = ''
    } catch (error) {
      console.error('Erro ao processar CSV:', error)
      setMessage({
        type: 'error',
        text: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h2>📤 Upload de Extrato Bancário</h2>
        <p className="upload-description">
          Faça upload do arquivo CSV do extrato bancário. O arquivo deve conter as colunas:
          <strong> Data Lançamento, Histórico, Descrição, Valor e Saldo</strong>.
        </p>

        <div className="person-selector">
          <label>Selecione a quem pertence o extrato:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="Daniela"
                checked={pessoa === 'Daniela'}
                onChange={(e) => setPessoa(e.target.value as Person)}
              />
              <span>Daniela</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="Giovani"
                checked={pessoa === 'Giovani'}
                onChange={(e) => setPessoa(e.target.value as Person)}
              />
              <span>Giovani</span>
            </label>
          </div>
        </div>

        <div className="file-upload-area">
          <input
            type="file"
            id="csv-upload"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
            className="file-input"
          />
          <label htmlFor="csv-upload" className="file-label">
            {loading ? '⏳ Processando...' : '📁 Selecionar arquivo CSV'}
          </label>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        <div className="info-box">
          <h3>📋 Formato esperado do CSV:</h3>
          <ul>
            <li><strong>Data Lançamento:</strong> Data da transação (formato: DD/MM/YYYY ou YYYY-MM-DD)</li>
            <li><strong>Histórico:</strong> Tipo de pagamento (Pix, Débito, Crédito, etc.)</li>
            <li><strong>Descrição:</strong> Nome do estabelecimento ou descrição da transação</li>
            <li><strong>Valor:</strong> Valor da transação (aceita formatação brasileira)</li>
            <li><strong>Saldo:</strong> Saldo da conta após a transação</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default UploadPage


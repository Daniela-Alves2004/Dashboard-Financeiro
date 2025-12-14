import { useState, useEffect } from 'react'
import { Investment, Person } from '../types'
import { loadInvestments, addInvestment } from '../utils/storage'
import './InvestmentsPage.css'

const TIPOS_INVESTIMENTO = [
  'Renda Fixa',
  'Ações',
  'Fundos',
  'Cripto',
  'Tesouro Direto',
  'CDB',
  'LCI/LCA',
  'Outros'
]

function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    pessoa: 'Daniela' as Person,
    tipo: 'Renda Fixa',
    titulo: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    taxaRendimento: '10'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const data = loadInvestments()
    setInvestments(data)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newInvestment: Investment = {
      id: `inv-${Date.now()}`,
      pessoa: formData.pessoa,
      tipo: formData.tipo,
      titulo: formData.titulo,
      valor: parseFloat(formData.valor) || 0,
      data: formData.data,
      taxaRendimento: parseFloat(formData.taxaRendimento) || 0
    }

    addInvestment(newInvestment)
    loadData()
    
    // Reset form
    setFormData({
      pessoa: 'Daniela',
      tipo: 'Renda Fixa',
      titulo: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      taxaRendimento: '10'
    })
    setShowForm(false)
  }

  const calculateReturn = (valor: number, taxa: number, anos: number): number => {
    // Juros compostos: M = C * (1 + i)^n
    const taxaDecimal = taxa / 100
    return valor * Math.pow(1 + taxaDecimal, anos)
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

  const totalPorPessoa = (pessoa: Person) => {
    return investments
      .filter(inv => inv.pessoa === pessoa)
      .reduce((sum, inv) => sum + inv.valor, 0)
  }

  return (
    <div className="investments-page">
      <div className="page-header">
        <h2>💼 Área de Investimentos</h2>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '❌ Cancelar' : '➕ Adicionar Investimento'}
        </button>
      </div>

      {showForm && (
        <div className="investment-form-container">
          <h3>Novo Investimento</h3>
          <form onSubmit={handleSubmit} className="investment-form">
            <div className="form-group">
              <label>Quem investiu:</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Daniela"
                    checked={formData.pessoa === 'Daniela'}
                    onChange={(e) => setFormData({ ...formData, pessoa: e.target.value as Person })}
                  />
                  <span>Daniela</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Giovani"
                    checked={formData.pessoa === 'Giovani'}
                    onChange={(e) => setFormData({ ...formData, pessoa: e.target.value as Person })}
                  />
                  <span>Giovani</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Título do Investimento:</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
                placeholder="Ex: CDB Banco XYZ, Ações Petrobras, etc."
              />
            </div>

            <div className="form-group">
              <label>Tipo de Investimento:</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                required
              >
                {TIPOS_INVESTIMENTO.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Valor Investido (R$):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Data do Investimento:</label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Taxa de Rendimento Anual (%):</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.taxaRendimento}
                onChange={(e) => setFormData({ ...formData, taxaRendimento: e.target.value })}
                required
                placeholder="10"
              />
            </div>

            <button type="submit" className="btn-submit">
              Salvar Investimento
            </button>
          </form>
        </div>
      )}

      {/* Resumo */}
      <div className="investments-summary">
        <div className="summary-card">
          <div className="summary-label">Total Investido - Daniela</div>
          <div className="summary-value">{formatCurrency(totalPorPessoa('Daniela'))}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Investido - Giovani</div>
          <div className="summary-value">{formatCurrency(totalPorPessoa('Giovani'))}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Geral</div>
          <div className="summary-value">
            {formatCurrency(totalPorPessoa('Daniela') + totalPorPessoa('Giovani'))}
          </div>
        </div>
      </div>

      {/* Lista de Investimentos */}
      {investments.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum investimento cadastrado ainda.</p>
          <p>Clique em "Adicionar Investimento" para começar.</p>
        </div>
      ) : (
        <div className="investments-list">
          {investments.map(investment => (
            <div key={investment.id} className="investment-card">
              <div className="investment-header">
                <div>
                  <h3>{investment.titulo || investment.tipo}</h3>
                  <p className="investment-person">{investment.pessoa} • {investment.tipo}</p>
                </div>
                <div className="investment-value">
                  {formatCurrency(investment.valor)}
                </div>
              </div>

              <div className="investment-details">
                <div className="detail-item">
                  <span className="detail-label">Data:</span>
                  <span>{formatDate(investment.data)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Taxa Anual:</span>
                  <span>{investment.taxaRendimento}%</span>
                </div>
              </div>

              <div className="investment-projections">
                <h4>Projeção de Rendimento</h4>
                <div className="projections-grid">
                  <div className="projection-item">
                    <div className="projection-label">1 Ano</div>
                    <div className="projection-value">
                      {formatCurrency(calculateReturn(investment.valor, investment.taxaRendimento, 1))}
                    </div>
                    <div className="projection-gain">
                      (+{formatCurrency(calculateReturn(investment.valor, investment.taxaRendimento, 1) - investment.valor)})
                    </div>
                  </div>
                  <div className="projection-item">
                    <div className="projection-label">5 Anos</div>
                    <div className="projection-value">
                      {formatCurrency(calculateReturn(investment.valor, investment.taxaRendimento, 5))}
                    </div>
                    <div className="projection-gain">
                      (+{formatCurrency(calculateReturn(investment.valor, investment.taxaRendimento, 5) - investment.valor)})
                    </div>
                  </div>
                  <div className="projection-item">
                    <div className="projection-label">10 Anos</div>
                    <div className="projection-value">
                      {formatCurrency(calculateReturn(investment.valor, investment.taxaRendimento, 10))}
                    </div>
                    <div className="projection-gain">
                      (+{formatCurrency(calculateReturn(investment.valor, investment.taxaRendimento, 10) - investment.valor)})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default InvestmentsPage


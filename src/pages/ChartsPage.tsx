import { useState, useEffect, useMemo } from 'react'
import { Transaction } from '../types'
import { loadTransactions } from '../utils/storage'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts'
import './ChartsPage.css'

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0']

function ChartsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const data = loadTransactions()
    setTransactions(data)
  }, [])

  // Gastos por categoria
  const gastosPorCategoria = useMemo(() => {
    const gastos: Record<string, number> = {}

    transactions.forEach(t => {
      if (t.valor < 0) {
        const categoria = t.categoria || 'Outros'
        gastos[categoria] = (gastos[categoria] || 0) + Math.abs(t.valor)
      }
    })

    return Object.entries(gastos)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  // Lugares mais frequentes (por descrição)
  const lugaresMaisFrequentes = useMemo(() => {
    const lugares: Record<string, { count: number, total: number }> = {}

    transactions.forEach(t => {
      if (t.valor < 0) {
        const desc = t.descricao || 'Desconhecido'
        if (!lugares[desc]) {
          lugares[desc] = { count: 0, total: 0 }
        }
        lugares[desc].count++
        lugares[desc].total += Math.abs(t.valor)
      }
    })

    return Object.entries(lugares)
      .map(([name, data]) => ({ name, count: data.count, total: data.total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [transactions])

  // Comparação Daniela vs Giovani
  const comparacaoPessoas = useMemo(() => {
    const daniela = transactions
      .filter(t => t.pessoa === 'Daniela' && t.valor < 0)
      .reduce((sum, t) => sum + Math.abs(t.valor), 0)

    const giovani = transactions
      .filter(t => t.pessoa === 'Giovani' && t.valor < 0)
      .reduce((sum, t) => sum + Math.abs(t.valor), 0)

    return [
      { name: 'Daniela', value: daniela },
      { name: 'Giovani', value: giovani }
    ]
  }, [transactions])

  // Evolução de gastos ao longo do tempo
  const evolucaoGastos = useMemo(() => {
    const gastosPorMes: Record<string, { daniela: number, giovani: number }> = {}

    transactions.forEach(t => {
      if (t.valor < 0) {
        try {
          const date = new Date(t.dataLancamento)
          const mesAno = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

          if (!gastosPorMes[mesAno]) {
            gastosPorMes[mesAno] = { daniela: 0, giovani: 0 }
          }

          if (t.pessoa === 'Daniela') {
            gastosPorMes[mesAno].daniela += Math.abs(t.valor)
          } else {
            gastosPorMes[mesAno].giovani += Math.abs(t.valor)
          }
        } catch {
          // Ignora datas inválidas
        }
      }
    })

    return Object.entries(gastosPorMes)
      .map(([mes, gastos]) => ({
        mes,
        Daniela: gastos.daniela,
        Giovani: gastos.giovani
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes))
  }, [transactions])

  // Função para calcular gastos por categoria em um mês específico
  const gastosPorCategoriaNoMes = useMemo(() => {
    const calcularGastos = (ano: number, mes: number): Record<string, number> => {
      const gastos: Record<string, number> = {}
      
      transactions.forEach(t => {
        if (t.valor < 0) {
          try {
            const date = new Date(t.dataLancamento)
            if (date.getFullYear() === ano && date.getMonth() === mes) {
              const categoria = t.categoria || 'Outros'
              gastos[categoria] = (gastos[categoria] || 0) + Math.abs(t.valor)
            }
          } catch {
            // Ignora datas inválidas
          }
        }
      })
      
      return gastos
    }

    const agora = new Date()
    const mesAtual = calcularGastos(agora.getFullYear(), agora.getMonth())
    
    // Mês anterior
    const mesAnteriorDate = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
    const mesAnterior = calcularGastos(mesAnteriorDate.getFullYear(), mesAnteriorDate.getMonth())
    
    // 6 meses atrás
    const seisMesesDate = new Date(agora.getFullYear(), agora.getMonth() - 6, 1)
    const seisMeses = calcularGastos(seisMesesDate.getFullYear(), seisMesesDate.getMonth())

    return { mesAtual, mesAnterior, seisMeses }
  }, [transactions])

  // Comparações de gastos por categoria
  const comparacoesGastos = useMemo(() => {
    const { mesAtual, mesAnterior, seisMeses } = gastosPorCategoriaNoMes
    const categorias = new Set([
      ...Object.keys(mesAtual),
      ...Object.keys(mesAnterior),
      ...Object.keys(seisMeses)
    ])

    return Array.from(categorias).map(categoria => {
      const atual = mesAtual[categoria] || 0
      const anterior = mesAnterior[categoria] || 0
      const seisMesesAtras = seisMeses[categoria] || 0

      const diffMesAnterior = anterior > 0 
        ? ((atual - anterior) / anterior) * 100 
        : (atual > 0 ? 100 : 0)
      
      const diffSeisMeses = seisMesesAtras > 0
        ? ((atual - seisMesesAtras) / seisMesesAtras) * 100
        : (atual > 0 ? 100 : 0)

      return {
        categoria,
        atual,
        anterior,
        seisMesesAtras,
        diffMesAnterior,
        diffSeisMeses,
        tipoComparacaoMes: atual > anterior ? 'aumento' : atual < anterior ? 'reducao' : 'igual',
        tipoComparacaoSeis: atual > seisMesesAtras ? 'aumento' : atual < seisMesesAtras ? 'reducao' : 'igual'
      }
    }).filter(c => c.atual > 0 || c.anterior > 0 || c.seisMesesAtras > 0)
      .sort((a, b) => b.atual - a.atual)
  }, [gastosPorCategoriaNoMes])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  if (transactions.length === 0) {
    return (
      <div className="charts-page">
        <h2>📈 Gráficos e Análises</h2>
        <div className="empty-state">
          <p>Nenhuma transação encontrada para análise.</p>
          <p>Importe extratos bancários na página de <strong>Upload</strong> para ver os gráficos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="charts-page">
      <h2>📈 Gráficos e Análises</h2>

      {/* Resumo estatístico */}
      <div className="stats-summary">
        <h3>📊 Resumo Estatístico</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total de Transações</div>
            <div className="stat-value">{transactions.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total de Gastos (Daniela)</div>
            <div className="stat-value">
              {formatCurrency(
                transactions
                  .filter(t => t.pessoa === 'Daniela' && t.valor < 0)
                  .reduce((sum, t) => sum + Math.abs(t.valor), 0)
              )}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total de Gastos (Giovani)</div>
            <div className="stat-value">
              {formatCurrency(
                transactions
                  .filter(t => t.pessoa === 'Giovani' && t.valor < 0)
                  .reduce((sum, t) => sum + Math.abs(t.valor), 0)
              )}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Categoria com Maior Gasto</div>
            <div className="stat-value">
              {gastosPorCategoria.length > 0
                ? `${gastosPorCategoria[0].name} (${formatCurrency(gastosPorCategoria[0].value)})`
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Comparações de Gastos ao Longo do Tempo */}
      {comparacoesGastos.length > 0 && (
        <div className="comparisons-section">
          <h3>📈 Comparação de Gastos ao Longo do Tempo</h3>
          <div className="comparisons-grid">
            {comparacoesGastos.map(comp => (
              <div key={comp.categoria} className="comparison-card">
                <div className="comparison-header">
                  <h4>{comp.categoria}</h4>
                  <div className="comparison-current">
                    {formatCurrency(comp.atual)}
                  </div>
                </div>
                
                <div className="comparison-details">
                  {/* Comparação com 1 mês anterior */}
                  {comp.anterior > 0 && (
                    <div className="comparison-item">
                      <div className="comparison-label">
                        <span>vs. Mês Anterior:</span>
                        <span className={`comparison-badge ${comp.tipoComparacaoMes}`}>
                          {comp.tipoComparacaoMes === 'aumento' && '📈'}
                          {comp.tipoComparacaoMes === 'reducao' && '📉'}
                          {comp.tipoComparacaoMes === 'igual' && '➡️'}
                          {formatPercent(comp.diffMesAnterior)}
                        </span>
                      </div>
                      <div className="comparison-values">
                        <span className="comparison-value-old">
                          {formatCurrency(comp.anterior)}
                        </span>
                        <span className="comparison-arrow">→</span>
                        <span className="comparison-value-new">
                          {formatCurrency(comp.atual)}
                        </span>
                      </div>
                      <div className="comparison-message">
                        {comp.tipoComparacaoMes === 'aumento' && (
                          <span className="message-aumento">
                            No mês atual, houve um <strong>aumento</strong> de gastos em {comp.categoria} em comparação ao mês anterior.
                          </span>
                        )}
                        {comp.tipoComparacaoMes === 'reducao' && (
                          <span className="message-reducao">
                            No mês atual, houve uma <strong>redução</strong> de gastos em {comp.categoria} em comparação ao mês anterior.
                          </span>
                        )}
                        {comp.tipoComparacaoMes === 'igual' && (
                          <span className="message-igual">
                            Os gastos em {comp.categoria} permaneceram <strong>estáveis</strong> em comparação ao mês anterior.
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Comparação com 6 meses anteriores */}
                  {comp.seisMesesAtras > 0 && (
                    <div className="comparison-item">
                      <div className="comparison-label">
                        <span>vs. 6 Meses Atrás:</span>
                        <span className={`comparison-badge ${comp.tipoComparacaoSeis}`}>
                          {comp.tipoComparacaoSeis === 'aumento' && '📈'}
                          {comp.tipoComparacaoSeis === 'reducao' && '📉'}
                          {comp.tipoComparacaoSeis === 'igual' && '➡️'}
                          {formatPercent(comp.diffSeisMeses)}
                        </span>
                      </div>
                      <div className="comparison-values">
                        <span className="comparison-value-old">
                          {formatCurrency(comp.seisMesesAtras)}
                        </span>
                        <span className="comparison-arrow">→</span>
                        <span className="comparison-value-new">
                          {formatCurrency(comp.atual)}
                        </span>
                      </div>
                      <div className="comparison-message">
                        {comp.tipoComparacaoSeis === 'aumento' && (
                          <span className="message-aumento">
                            No mês atual, houve um <strong>aumento</strong> de gastos em {comp.categoria} em comparação a 6 meses atrás.
                          </span>
                        )}
                        {comp.tipoComparacaoSeis === 'reducao' && (
                          <span className="message-reducao">
                            No mês atual, houve uma <strong>redução</strong> de gastos em {comp.categoria} em comparação a 6 meses atrás.
                          </span>
                        )}
                        {comp.tipoComparacaoSeis === 'igual' && (
                          <span className="message-igual">
                            Os gastos em {comp.categoria} permaneceram <strong>estáveis</strong> em comparação a 6 meses atrás.
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mensagem quando não há dados anteriores */}
                  {comp.anterior === 0 && comp.seisMesesAtras === 0 && (
                    <div className="comparison-item">
                      <div className="comparison-message">
                        <span className="message-info">
                          Primeiro mês com gastos registrados nesta categoria.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="charts-grid">
        {/* Gráfico de Pizza - Gastos por Categoria */}
        <div className="chart-card">
          <h3>Gastos por Categoria</h3>
          {gastosPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gastosPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gastosPorCategoria.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Nenhum dado disponível</p>
          )}
        </div>

        {/* Gráfico de Barras - Lugares mais frequentes */}
        <div className="chart-card">
          <h3>Top 10 Lugares com Maior Gasto</h3>
          {lugaresMaisFrequentes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lugaresMaisFrequentes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  fontSize={10}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Nenhum dado disponível</p>
          )}
        </div>

        {/* Comparação Daniela vs Giovani */}
        <div className="chart-card">
          <h3>Comparação de Gastos: Daniela vs Giovani</h3>
          {comparacaoPessoas.some(p => p.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparacaoPessoas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#764ba2" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Nenhum dado disponível</p>
          )}
        </div>

        {/* Evolução de gastos ao longo do tempo */}
        <div className="chart-card full-width">
          <h3>Evolução de Gastos ao Longo do Tempo</h3>
          {evolucaoGastos.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoGastos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="Daniela" stroke="#667eea" strokeWidth={2} />
                <Line type="monotone" dataKey="Giovani" stroke="#764ba2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Nenhum dado disponível</p>
          )}
        </div>
      </div>


    </div>
  )
}

export default ChartsPage


import Papa from 'papaparse'
import { Transaction, Person } from '../types'

/**
 * Normaliza chaves do CSV:
 * - remove BOM
 * - remove acentos
 * - trim
 * - lowercase
 */
function normalizeKey(key: string): string {
  return key
    .replace(/\uFEFF/g, '') // remove BOM
    .normalize('NFD')       // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .trim()
    .toLowerCase()
}

/**
 * Encontra a linha onde começam os dados reais do CSV
 */
function findHeaderLine(lines: string[]): number {
  const expectedColumns = [
    'data lancamento',
    'historico',
    'descricao',
    'valor',
    'saldo'
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    for (const delimiter of [',', ';']) {
      const columns = line
        .split(delimiter)
        .map(col => normalizeKey(col))

      const hasAll = expectedColumns.every(col =>
        columns.includes(col)
      )

      if (hasAll) return i
    }
  }

  return -1
}

/**
 * Remove cabeçalho descritivo (antes das colunas reais)
 */
function removeDescriptiveHeader(text: string): string {
  const lines = text.split(/\r?\n/)
  const headerIndex = findHeaderLine(lines)

  if (headerIndex === -1) return text

  return lines.slice(headerIndex).join('\n')
}

/**
 * Processa CSV bancário
 */
export async function parseCSV(
  file: File,
  pessoa: Person
): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string

        const cleanedText = removeDescriptiveHeader(text)
        if (!cleanedText.trim()) {
          throw new Error('CSV vazio após limpeza')
        }

        const firstLine = cleanedText.split(/\r?\n/)[0]
        const delimiter = firstLine.includes(';') ? ';' : ','

        Papa.parse(cleanedText, {
          header: true,
          skipEmptyLines: true,
          delimiter,
          complete: (results) => {
            try {
              if (!results.data || results.data.length === 0) {
                throw new Error('Nenhum dado encontrado no CSV')
              }

              const firstRow = results.data[0] as Record<string, any>
              const keys = Object.keys(firstRow)

              // Mapa normalizado → chave original
              const keyMap = keys.reduce<Record<string, string>>((acc, key) => {
                acc[normalizeKey(key)] = key
                return acc
              }, {})

              const dataKey = keyMap['data lancamento']
              const historicoKey = keyMap['historico']
              const descricaoKey = keyMap['descricao']
              const valorKey = keyMap['valor']
              const saldoKey = keyMap['saldo']

              if (!dataKey || !historicoKey || !descricaoKey || !valorKey || !saldoKey) {
                throw new Error(
                  `Colunas obrigatórias não encontradas no CSV. Colunas encontradas: ${keys.join(', ')}`
                )
              }

              const transactions: Transaction[] = results.data
                .filter(row => row && typeof row === 'object')
                .map((row: any, index: number) => {
                  // Valor
                  const valor = parseFloat(
                    String(row[valorKey] || '0')
                      .replace(/\./g, '')
                      .replace(',', '.')
                      .replace(/[^\d.-]/g, '')
                  ) || 0

                  // Saldo
                  const saldo = parseFloat(
                    String(row[saldoKey] || '0')
                      .replace(/\./g, '')
                      .replace(',', '.')
                      .replace(/[^\d.-]/g, '')
                  ) || 0

                  // Data
                  let dataLancamento = String(row[dataKey] || '')
                  if (dataLancamento.includes('/')) {
                    const [d, m, y] = dataLancamento.split('/')
                    if (d && m && y) {
                      dataLancamento = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
                    }
                  }

                  return {
                    id: `${pessoa}-${index}-${Date.now()}`,
                    dataLancamento: dataLancamento || new Date().toISOString().split('T')[0],
                    historico: String(row[historicoKey] || '').trim(),
                    descricao: String(row[descricaoKey] || '').trim(),
                    valor,
                    saldo,
                    pessoa
                  }
                })

              resolve(transactions)
            } catch (err) {
              reject(err)
            }
          },
          error: (err: Error) => reject(err)
        })
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'))
    }

    reader.readAsText(file)
  })
}

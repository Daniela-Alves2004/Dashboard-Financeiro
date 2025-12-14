import { Transaction, Categoria } from '../types'

// Palavras-chave para categorização automática
const CATEGORIA_KEYWORDS: Record<Categoria, string[]> = {
  'Alimentação': [
    'supermercado', 'mercado', 'padaria', 'restaurante', 'lanchonete',
    'ifood', 'uber eats', 'rappi', 'delivery', 'comida', 'alimento',
    'açougue', 'peixaria', 'hortifruti', 'bebida', 'café', 'starbucks',
    'padoka', 'barateira', 'emporio', 'bariloch'
  ],
  'Transporte': [
    'uber', 'taxi', '99', 'inDriver', 'posto', 'combustível', 'gasolina',
    'estacionamento', 'pedágio', 'metro', 'ônibus', 'transporte',
    'auto peças', 'oficina', 'manutenção'
  ],
  'Lazer': [
    'cinema', 'teatro', 'show', 'festa', 'bar', 'balada', 'viagem',
    'hotel', 'pousada', 'turismo', 'parque', 'jogo', 'streaming',
    'netflix', 'spotify', 'amazon prime', 'disney'
  ],
  'Moradia': [
    'aluguel', 'condomínio', 'luz', 'água', 'energia', 'gás', 'internet',
    'telefone', 'iptu', 'reforma', 'construção', 'material de construção',
    'decoração', 'móveis', 'eletrodoméstico'
  ],
  'Compras': [
    'loja', 'shopping', 'amazon', 'magazine luiza', 'americanas',
    'casas bahia', 'extra', 'carrefour', 'walmart', 'compra',
    'e-commerce', 'marketplace', 'atelie', 'atelier', 'tudo 10'
  ],
  'Saúde': [
    'farmácia', 'drogaria', 'hospital', 'clínica', 'médico', 'dentista',
    'laboratório', 'exame', 'plano de saúde', 'unimed', 'amil',
    'medicamento', 'remédio', 'raia'
  ],
  'Educação': [
    'escola', 'faculdade', 'universidade', 'curso', 'livro', 'material escolar',
    'mensalidade', 'matrícula', 'educação'
  ],
  'Serviços': [
    'banco', 'tarifa', 'anuidade', 'seguro', 'consórcio', 'financiamento',
    'serviço', 'assinatura', 'assinatura mensal', 'pagamentos', 'tuna'
  ],
  'Outros': []
}

/**
 * Categoriza automaticamente uma transação baseado na descrição
 */
export function categorizarTransacao(transacao: Transaction): Categoria {
  const descricaoLower = transacao.descricao.toLowerCase()

  // Verifica cada categoria
  for (const [categoria, keywords] of Object.entries(CATEGORIA_KEYWORDS)) {
    if (categoria === 'Outros') continue

    for (const keyword of keywords) {
      if (descricaoLower.includes(keyword.toLowerCase())) {
        return categoria as Categoria
      }
    }
  }

  return 'Outros'
}

/**
 * Aplica categorização automática a um array de transações
 */
export function categorizarTransacoes(transacoes: Transaction[]): Transaction[] {
  return transacoes.map(transacao => ({
    ...transacao,
    categoria: transacao.categoria || categorizarTransacao(transacao)
  }))
}


# 💰 Dashboard Financeiro

Sistema web para controle financeiro pessoal com foco na análise de extratos bancários em formato CSV.

## 🚀 Funcionalidades

### 1. Upload e Leitura de CSV
- Upload de arquivos CSV de extrato bancário
- Suporte para múltiplos formatos de data e valores
- Seleção de proprietário do extrato (Daniela ou Giovani)
- Categorização automática de transações

### 2. Visualização em Tabelas
- Tabelas separadas por pessoa
- Visão consolidada unificada
- Ordenação por data e valor
- Filtros por tipo de pagamento e descrição
- Edição manual de categorias

### 3. Categorização de Gastos
- Categorização automática baseada em palavras-chave
- Categorias: Alimentação, Transporte, Lazer, Moradia, Compras, Saúde, Educação, Serviços, Outros
- Possibilidade de ajuste manual de categoria

### 4. Gráficos e Análises
- **Gastos por Categoria**: Gráfico de pizza
- **Top 10 Lugares com Maior Gasto**: Gráfico de barras
- **Comparação Daniela vs Giovani**: Gráfico de barras comparativo
- **Evolução de Gastos ao Longo do Tempo**: Gráfico de linha
- Resumo estatístico com totais e métricas principais

### 5. Área de Investimentos
- Cadastro de investimentos por pessoa
- Tipos: Renda Fixa, Ações, Fundos, Cripto, Tesouro Direto, CDB, LCI/LCA, Outros
- Simulação de rendimento em 1, 5 e 10 anos
- Taxa de rendimento configurável
- Cálculo de juros compostos

## 📋 Requisitos do CSV

O arquivo CSV deve conter as seguintes colunas (nomes case-insensitive):

- **Data Lançamento**: Data da transação (formato: DD/MM/YYYY ou YYYY-MM-DD)
- **Histórico**: Tipo de pagamento (Pix, Débito, Crédito, etc.)
- **Descrição**: Nome do estabelecimento ou descrição da transação
- **Valor**: Valor da transação (aceita formatação brasileira com vírgula)
- **Saldo**: Saldo da conta após a transação

## 🛠️ Tecnologias

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **React Router** para navegação
- **Recharts** para gráficos
- **PapaParse** para processamento de CSV
- **LocalStorage** para persistência de dados

## 📦 Instalação

1. Clone o repositório ou navegue até a pasta do projeto

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse `http://localhost:5173` no navegador

## 🏗️ Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.

## 📁 Estrutura do Projeto

```
dash-financeiro/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── TransactionTable.tsx
│   │   └── TransactionTable.css
│   ├── pages/               # Páginas da aplicação
│   │   ├── UploadPage.tsx
│   │   ├── TablesPage.tsx
│   │   ├── ChartsPage.tsx
│   │   ├── InvestmentsPage.tsx
│   │   └── *.css
│   ├── utils/               # Utilitários e helpers
│   │   ├── csvParser.ts     # Parser de CSV
│   │   ├── categorization.ts # Categorização automática
│   │   └── storage.ts       # Gerenciamento de localStorage
│   ├── types.ts             # Definições de tipos TypeScript
│   ├── App.tsx              # Componente principal
│   ├── App.css
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 💾 Armazenamento de Dados

Os dados são armazenados localmente no navegador usando `localStorage`:
- Transações: `dash-financeiro-transactions`
- Investimentos: `dash-financeiro-investments`

**Nota**: Os dados são armazenados apenas no navegador local. Para backup, exporte os dados ou use um serviço de sincronização.

## 🎨 Interface

- Design moderno e responsivo
- Gradientes e cores suaves
- Navegação intuitiva
- Compatível com dispositivos móveis

## 📝 Notas

- A categorização automática usa palavras-chave. Transações não categorizadas automaticamente são marcadas como "Outros" e podem ser editadas manualmente.
- Os cálculos de investimento usam juros compostos: M = C × (1 + i)ⁿ
- Valores negativos no CSV são tratados como gastos
- O sistema suporta múltiplos uploads de CSV, acumulando as transações

## 🔄 Próximas Melhorias

- Exportação de dados em CSV/Excel
- Filtros avançados por período
- Metas de gastos por categoria
- Relatórios em PDF
- Sincronização em nuvem
- Múltiplas contas bancárias

## 📄 Licença

Este projeto é de uso pessoal.


import { Transaction, Investment } from '../types'

const STORAGE_KEYS = {
  TRANSACTIONS: 'dash-financeiro-transactions',
  INVESTMENTS: 'dash-financeiro-investments',
  PENDING_TRANSACTIONS: 'dash-financeiro-pending-transactions'
}

/**
 * Salva transações no localStorage
 */
export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
  } catch (error) {
    console.error('Erro ao salvar transações:', error)
  }
}

/**
 * Carrega transações do localStorage
 */
export function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Erro ao carregar transações:', error)
    return []
  }
}

/**
 * Adiciona novas transações às existentes
 */
export function addTransactions(newTransactions: Transaction[]): void {
  const existing = loadTransactions()
  const updated = [...existing, ...newTransactions]
  saveTransactions(updated)
}

/**
 * Fluxo de verificação - transações pendentes
 */
export function savePendingTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_TRANSACTIONS, JSON.stringify(transactions))
  } catch (error) {
    console.error('Erro ao salvar transações pendentes:', error)
  }
}

export function loadPendingTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_TRANSACTIONS)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Erro ao carregar transações pendentes:', error)
    return []
  }
}

export function clearPendingTransactions(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PENDING_TRANSACTIONS)
  } catch (error) {
    console.error('Erro ao limpar transações pendentes:', error)
  }
}

/**
 * Atualiza uma transação específica
 */
export function updateTransaction(transactionId: string, updates: Partial<Transaction>): void {
  const transactions = loadTransactions()
  const updated = transactions.map(t =>
    t.id === transactionId ? { ...t, ...updates } : t
  )
  saveTransactions(updated)
}

/**
 * Remove uma transação específica
 */
export function deleteTransaction(transactionId: string): void {
  const transactions = loadTransactions()
  const updated = transactions.filter(t => t.id !== transactionId)
  saveTransactions(updated)
}

/**
 * Salva investimentos no localStorage
 */
export function saveInvestments(investments: Investment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments))
  } catch (error) {
    console.error('Erro ao salvar investimentos:', error)
  }
}

/**
 * Carrega investimentos do localStorage
 */
export function loadInvestments(): Investment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INVESTMENTS)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Erro ao carregar investimentos:', error)
    return []
  }
}

/**
 * Adiciona um novo investimento
 */
export function addInvestment(investment: Investment): void {
  const existing = loadInvestments()
  const updated = [...existing, investment]
  saveInvestments(updated)
}


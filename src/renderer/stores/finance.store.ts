import { create } from 'zustand'
import type { Transaction, Invoice, InvoiceItem } from '../../shared/types'
import { safeJsonParse } from '../lib/json'

interface FinanceState {
  transactions: Transaction[]
  invoices: Invoice[]
  loading: boolean

  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  removeTransaction: (id: string) => void
  setInvoices: (invoices: Invoice[]) => void
  addInvoice: (invoice: Invoice) => void
  setLoading: (loading: boolean) => void
  fetchTransactions: () => Promise<void>
  createTransaction: (data: Partial<Transaction>) => Promise<Transaction>
  deleteTransaction: (id: string) => Promise<void>
  fetchInvoices: () => Promise<void>
  createInvoice: (data: Partial<Invoice>) => Promise<Invoice>
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  invoices: [],
  loading: false,

  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  setInvoices: (invoices) => set({ invoices }),
  addInvoice: (invoice) =>
    set((state) => ({ invoices: [invoice, ...state.invoices] })),
  setLoading: (loading) => set({ loading }),

  fetchTransactions: async () => {
    set({ loading: true })
    try {
      const result = await window.panorama.finance.listTransactions()
      const transactions = (result as unknown as Array<Record<string, unknown>>).map(mapTransactionFromDb)
      set({ transactions, loading: false })
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      set({ loading: false })
    }
  },

  createTransaction: async (data) => {
    const result = await window.panorama.finance.createTransaction(data)
    const mapped = mapTransactionFromDb(result as unknown as Record<string, unknown>)
    set((state) => ({ transactions: [mapped, ...state.transactions] }))
    return mapped
  },

  deleteTransaction: async (id) => {
    await window.panorama.finance.deleteTransaction(id)
    get().removeTransaction(id)
  },

  fetchInvoices: async () => {
    try {
      const result = await window.panorama.finance.listInvoices()
      const invoices = (result as unknown as Array<Record<string, unknown>>).map(mapInvoiceFromDb)
      set({ invoices })
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    }
  },

  createInvoice: async (data) => {
    const result = await window.panorama.finance.createInvoice(data)
    const mapped = mapInvoiceFromDb(result as unknown as Record<string, unknown>)
    set((state) => ({ invoices: [mapped, ...state.invoices] }))
    return mapped
  },
}))

function mapTransactionFromDb(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    type: row.type as Transaction['type'],
    amount: row.amount as number,
    category: row.category as string | undefined,
    subcategory: row.subcategory as string | undefined,
    description: row.description as string | undefined,
    date: row.date as string,
    projectId: row.project_id as string | undefined,
    customerId: row.customer_id as string | undefined,
    invoiceId: row.invoice_id as string | undefined,
    paymentMethod: row.payment_method as Transaction['paymentMethod'],
    receiptPath: row.receipt_path as string | undefined,
    aiClassified: (row.ai_classified as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapInvoiceFromDb(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    invoiceNo: row.invoice_no as string,
    customerId: row.customer_id as string | undefined,
    projectId: row.project_id as string | undefined,
    amount: row.amount as number,
    tax: (row.tax as number) || 0,
    status: row.status as Invoice['status'],
    issuedDate: row.issued_date as string | undefined,
    dueDate: row.due_date as string | undefined,
    paidDate: row.paid_date as string | undefined,
    items: safeJsonParse<InvoiceItem[]>(row.items, []),
    filePath: row.file_path as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

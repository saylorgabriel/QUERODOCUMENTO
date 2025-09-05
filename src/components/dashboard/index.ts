// Export all dashboard components
export { default as OrderCard } from './OrderCard'
export { default as OrdersList } from './OrdersList'
export { default as OrderStatus } from './OrderStatus'
export { default as QuickStats } from './QuickStats'

// Types that might be useful across components
export interface Order {
  id: string
  orderNumber: string
  serviceType: string
  serviceTypeDisplay: string
  status: string
  statusDisplay: string
  paymentStatus: string
  documentNumber: string
  documentType: string
  invoiceName: string
  amount: number
  paymentMethod?: string
  paidAt?: string
  hasResults: boolean
  resultText?: string
  attachmentUrl?: string
  quotedAmount?: number
  protocolNumber?: string
  state?: string
  city?: string
  notaryOffice?: string
  reason?: string
  createdAt: string
  updatedAt: string
}

export interface OrdersSummary {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  cancelledOrders: number
  totalSpent: number
}

export interface OrdersPagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
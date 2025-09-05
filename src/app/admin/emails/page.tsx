'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Mail, 
  RefreshCw, 
  Trash2,
  Eye,
  Send,
  BarChart3,
  Filter,
  Search,
  Download
} from 'lucide-react'

interface EmailStats {
  totalSent: number
  totalFailed: number
  byProvider: Record<string, number>
  byDay: Array<{ date: string; sent: number; failed: number }>
}

interface EmailQueueStats {
  pending: number
  sending: number
  sent: number
  failed: number
  total: number
  byPriority: {
    high: number
    normal: number
    low: number
  }
  recentFailures: Array<{
    id: string
    to: string
    subject: string
    error: string
    failedAt: Date
  }>
}

interface EmailLog {
  id: string
  to: string
  from: string
  subject: string
  provider: string
  status: 'sent' | 'failed'
  messageId?: string
  error?: string
  retryCount: number
  sentAt?: Date
  createdAt: Date
  metadata?: string
}

interface QueuedEmail {
  id: string
  to: string
  subject: string
  priority: string
  status: string
  attempts: number
  maxAttempts: number
  scheduledFor: Date
  lastAttempt?: Date
  error?: string
  createdAt: Date
}

export default function AdminEmailsPage() {
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [queueStats, setQueueStats] = useState<EmailQueueStats | null>(null)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [queuedEmails, setQueuedEmails] = useState<QueuedEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsResponse, queueStatsResponse, logsResponse, queueResponse] = await Promise.all([
        fetch('/api/admin/emails/stats'),
        fetch('/api/admin/emails/queue/stats'),
        fetch('/api/admin/emails/logs'),
        fetch('/api/admin/emails/queue')
      ])

      if (statsResponse.ok) {
        setEmailStats(await statsResponse.json())
      }
      
      if (queueStatsResponse.ok) {
        setQueueStats(await queueStatsResponse.json())
      }
      
      if (logsResponse.ok) {
        setEmailLogs(await logsResponse.json())
      }
      
      if (queueResponse.ok) {
        setQueuedEmails(await queueResponse.json())
      }
    } catch (error) {
      console.error('Failed to fetch email data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle retry failed emails
  const handleRetryFailedEmails = async (emailIds?: string[]) => {
    try {
      const response = await fetch('/api/admin/emails/queue/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailIds })
      })
      
      if (response.ok) {
        await fetchData()
        alert('Emails requeued successfully!')
      } else {
        alert('Failed to retry emails')
      }
    } catch (error) {
      console.error('Error retrying emails:', error)
      alert('Error retrying emails')
    }
  }

  // Handle cancel emails
  const handleCancelEmails = async (emailIds: string[]) => {
    if (!confirm('Are you sure you want to cancel these emails?')) return
    
    try {
      const response = await fetch('/api/admin/emails/queue/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailIds })
      })
      
      if (response.ok) {
        await fetchData()
        setSelectedEmails([])
        alert('Emails cancelled successfully!')
      } else {
        alert('Failed to cancel emails')
      }
    } catch (error) {
      console.error('Error cancelling emails:', error)
      alert('Error cancelling emails')
    }
  }

  // Process queue manually
  const handleProcessQueue = async () => {
    try {
      const response = await fetch('/api/admin/emails/queue/process', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        await fetchData()
        alert(`Queue processed: ${result.processed} sent, ${result.failed} failed`)
      } else {
        alert('Failed to process queue')
      }
    } catch (error) {
      console.error('Error processing queue:', error)
      alert('Error processing queue')
    }
  }

  // Export email logs
  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/admin/emails/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `email-logs-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to export logs')
      }
    } catch (error) {
      console.error('Error exporting logs:', error)
      alert('Error exporting logs')
    }
  }

  // Filter emails based on search and status
  const filteredLogs = emailLogs.filter(log => {
    const matchesSearch = log.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredQueue = queuedEmails.filter(email => {
    const matchesSearch = email.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600">Monitor and manage email delivery system</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button onClick={handleProcessQueue}>
            <Send className="w-4 h-4 mr-2" />
            Process Queue
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {queueStats?.pending || 0} pending, {queueStats?.failed || 0} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{emailStats?.totalSent || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{emailStats?.totalFailed || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {emailStats ? 
                Math.round((emailStats.totalSent / (emailStats.totalSent + emailStats.totalFailed)) * 100) || 0
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Delivery success rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Email Queue</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Queue Management</CardTitle>
              <CardDescription>
                Manage queued emails, retry failed deliveries, and monitor processing status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by email or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="block w-full rounded-md border-gray-300 shadow-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="sending">Sending</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              {selectedEmails.length > 0 && (
                <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
                  <Button 
                    onClick={() => handleRetryFailedEmails(selectedEmails)}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Selected
                  </Button>
                  <Button 
                    onClick={() => handleCancelEmails(selectedEmails)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Selected
                  </Button>
                </div>
              )}

              {/* Queue Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmails(filteredQueue.map(email => email.id))
                            } else {
                              setSelectedEmails([])
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attempts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scheduled
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredQueue.map((email) => (
                      <tr key={email.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedEmails.includes(email.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmails([...selectedEmails, email.id])
                              } else {
                                setSelectedEmails(selectedEmails.filter(id => id !== email.id))
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {email.to}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {email.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              email.status === 'sent' ? 'default' :
                              email.status === 'failed' ? 'destructive' :
                              email.status === 'sending' ? 'secondary' :
                              'outline'
                            }
                          >
                            {email.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              email.priority === 'high' ? 'destructive' :
                              email.priority === 'normal' ? 'default' :
                              'outline'
                            }
                          >
                            {email.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {email.attempts} / {email.maxAttempts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(email.scheduledFor).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {email.status === 'failed' && (
                            <Button
                              onClick={() => handleRetryFailedEmails([email.id])}
                              size="sm"
                              variant="outline"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                          {(email.status === 'pending' || email.status === 'sending') && (
                            <Button
                              onClick={() => handleCancelEmails([email.id])}
                              size="sm"
                              variant="outline"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Delivery Logs</CardTitle>
              <CardDescription>
                View detailed logs of all email delivery attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Retries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sent At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.to}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {log.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.provider}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={log.status === 'sent' ? 'default' : 'destructive'}
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.retryCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">By Provider</h4>
                    {emailStats?.byProvider && Object.entries(emailStats.byProvider).map(([provider, count]) => (
                      <div key={provider} className="flex justify-between py-1">
                        <span>{provider}</span>
                        <span className="font-mono">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Queue Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {queueStats && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>High Priority:</span>
                      <span className="font-mono">{queueStats.byPriority.high}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Normal Priority:</span>
                      <span className="font-mono">{queueStats.byPriority.normal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Priority:</span>
                      <span className="font-mono">{queueStats.byPriority.low}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Failures */}
          {queueStats?.recentFailures && queueStats.recentFailures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Failures</CardTitle>
                <CardDescription>Last 10 failed email attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {queueStats.recentFailures.map((failure) => (
                    <div key={failure.id} className="border-l-4 border-red-500 pl-4 py-2">
                      <div className="font-semibold">{failure.to}</div>
                      <div className="text-sm text-gray-600">{failure.subject}</div>
                      <div className="text-sm text-red-600">{failure.error}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(failure.failedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Preview and manage email templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Email template management coming soon...
                <br />
                Templates are currently managed through code.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
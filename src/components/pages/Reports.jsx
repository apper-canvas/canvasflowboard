import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Header from '@/components/organisms/Header'
import ReportForm from '@/components/organisms/ReportForm'
import SearchBar from '@/components/molecules/SearchBar'
import Modal from '@/components/molecules/Modal'
import ConfirmDialog from '@/components/molecules/ConfirmDialog'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { reportService } from '@/services/api/reportService'
import { formatDateShort } from '@/utils/dateUtils'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  
  // Report execution
  const [executingReport, setExecutingReport] = useState(null)
  const [reportResults, setReportResults] = useState(null)
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    setLoading(true)
    setError(null)
    try {
      const data = await reportService.getAll()
      setReports(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleCreateReport() {
    setSelectedReport(null)
    setIsFormModalOpen(true)
  }

  function handleEditReport(report) {
    setSelectedReport(report)
    setIsFormModalOpen(true)
  }

  function handleDeleteReport(report) {
    setSelectedReport(report)
    setIsDeleteModalOpen(true)
  }

  async function handleReportSubmit(reportData) {
    setFormLoading(true)
    try {
      if (selectedReport) {
        await reportService.update(selectedReport.Id, reportData)
        toast.success('Report updated successfully')
      } else {
        await reportService.create(reportData)
        toast.success('Report created successfully')
      }
      
      setIsFormModalOpen(false)
      setSelectedReport(null)
      await loadReports()
    } catch (error) {
      toast.error(error.message || 'Failed to save report')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleConfirmDelete() {
    if (!selectedReport) return
    
    try {
      await reportService.delete(selectedReport.Id)
      toast.success('Report deleted successfully')
      setIsDeleteModalOpen(false)
      setSelectedReport(null)
      await loadReports()
    } catch (error) {
      toast.error(error.message || 'Failed to delete report')
    }
  }

  async function handleExecuteReport(report) {
    setExecutingReport(report.Id)
    try {
      const results = await reportService.executeReport(report.Id)
      setReportResults(results)
      setIsResultsModalOpen(true)
      toast.success('Report executed successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to execute report')
    } finally {
      setExecutingReport(null)
    }
  }

  // Filter and search logic
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.dataSource.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || report.reportType.toLowerCase() === filterType.toLowerCase()
    
    return matchesSearch && matchesFilter
  })

  const reportTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'summary', label: 'Summary' },
    { value: 'detailed', label: 'Detailed' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'timesheet', label: 'Timesheet' },
    { value: 'performance', label: 'Performance' }
  ]

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Reports" />
        <div className="flex-1 flex items-center justify-center">
          <Loading />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Reports" />
        <div className="flex-1 flex items-center justify-center">
          <Error message={error} onRetry={loadReports} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Reports">
        <Button onClick={handleCreateReport}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          New Report
        </Button>
      </Header>
      
      <div className="flex-1 p-6 space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search reports..."
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {reportTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Empty
              icon="BarChart3"
              title="No reports found"
              description="Create your first report to get started with analytics"
              action={
                <Button onClick={handleCreateReport}>
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Create Report
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <div
                key={report.Id}
                className="bg-white rounded-lg border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {report.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" size="sm">
                          {report.reportType || 'General'}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {report.dataSource || 'Combined'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExecuteReport(report)}
                        disabled={executingReport === report.Id}
                        loading={executingReport === report.Id}
                      >
                        <ApperIcon name="Play" className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReport(report)}
                      >
                        <ApperIcon name="Edit" className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReport(report)}
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    {report.schedule && (
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Calendar" className="w-4 h-4" />
                        <span>Schedule: {report.schedule}</span>
                      </div>
                    )}
                    {report.displayFormat && (
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Layout" className="w-4 h-4" />
                        <span>Format: {report.displayFormat}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Clock" className="w-4 h-4" />
                      <span>Created: {formatDateShort(report.createdOn)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedReport(null)
        }}
        title={selectedReport ? 'Edit Report' : 'Create New Report'}
        size="lg"
      >
        <ReportForm
          report={selectedReport}
          onSubmit={handleReportSubmit}
          onCancel={() => {
            setIsFormModalOpen(false)
            setSelectedReport(null)
          }}
          isLoading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Report"
        message={`Are you sure you want to delete "${selectedReport?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Report Results Modal */}
      <Modal
        isOpen={isResultsModalOpen}
        onClose={() => {
          setIsResultsModalOpen(false)
          setReportResults(null)
        }}
        title={`Report Results: ${reportResults?.report?.name}`}
        size="xl"
      >
        {reportResults && (
          <div className="space-y-6">
            {/* Summary Section */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportResults.summary).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {typeof value === 'number' ? Math.round(value * 100) / 100 : value}
                    </div>
                    <div className="text-sm text-slate-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Preview */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Data Preview</h3>
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-auto">
                  <pre className="p-4 text-sm text-slate-700">
                    {JSON.stringify(reportResults.data, null, 2).substring(0, 2000)}
                    {JSON.stringify(reportResults.data, null, 2).length > 2000 && '\n... (truncated)'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsResultsModalOpen(false)
                  setReportResults(null)
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  const dataStr = JSON.stringify(reportResults, null, 2)
                  const dataBlob = new Blob([dataStr], { type: 'application/json' })
                  const url = URL.createObjectURL(dataBlob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `${reportResults.report.name}-${new Date().toISOString().split('T')[0]}.json`
                  link.click()
                  URL.revokeObjectURL(url)
                  toast.success('Report exported successfully')
                }}
              >
                <ApperIcon name="Download" className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Reports
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Textarea from '@/components/atoms/Textarea'
import Select from '@/components/atoms/Select'
import FormField from '@/components/molecules/FormField'

const ReportForm = ({ report, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    reportType: '',
    dataSource: '',
    filters: '',
    aggregations: '',
    calculations: '',
    displayFormat: '',
    schedule: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (report) {
      setFormData({
        name: report.name || '',
        reportType: report.reportType || '',
        dataSource: report.dataSource || '',
        filters: report.filters || '',
        aggregations: report.aggregations || '',
        calculations: report.calculations || '',
        displayFormat: report.displayFormat || '',
        schedule: report.schedule || ''
      })
    }
  }, [report])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Report name is required'
    }
    
    if (!formData.reportType.trim()) {
      newErrors.reportType = 'Report type is required'
    }
    
    if (!formData.dataSource.trim()) {
      newErrors.dataSource = 'Data source is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      toast.error(error.message || 'Failed to save report')
    }
  }

  const reportTypes = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'summary', label: 'Summary' },
    { value: 'detailed', label: 'Detailed' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'timesheet', label: 'Timesheet' },
    { value: 'performance', label: 'Performance' }
  ]

  const dataSources = [
    { value: 'projects', label: 'Projects' },
    { value: 'tasks', label: 'Tasks' },
    { value: 'time_entries', label: 'Time Entries' },
    { value: 'combined', label: 'Combined Data' }
  ]

  const displayFormats = [
    { value: 'table', label: 'Table' },
    { value: 'chart', label: 'Chart' },
    { value: 'graph', label: 'Graph' },
    { value: 'summary', label: 'Summary' },
    { value: 'export', label: 'Export' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Report Name"
          error={errors.name}
          required
        >
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter report name"
            className={errors.name ? 'border-red-500' : ''}
          />
        </FormField>

        <FormField
          label="Report Type"
          error={errors.reportType}
          required
        >
          <Select
            value={formData.reportType}
            onChange={(value) => handleInputChange('reportType', value)}
            options={reportTypes}
            placeholder="Select report type"
            className={errors.reportType ? 'border-red-500' : ''}
          />
        </FormField>

        <FormField
          label="Data Source"
          error={errors.dataSource}
          required
        >
          <Select
            value={formData.dataSource}
            onChange={(value) => handleInputChange('dataSource', value)}
            options={dataSources}
            placeholder="Select data source"
            className={errors.dataSource ? 'border-red-500' : ''}
          />
        </FormField>

        <FormField
          label="Display Format"
          error={errors.displayFormat}
        >
          <Select
            value={formData.displayFormat}
            onChange={(value) => handleInputChange('displayFormat', value)}
            options={displayFormats}
            placeholder="Select display format"
          />
        </FormField>

        <FormField
          label="Schedule"
          error={errors.schedule}
          className="md:col-span-2"
        >
          <Input
            value={formData.schedule}
            onChange={(e) => handleInputChange('schedule', e.target.value)}
            placeholder="e.g., Daily, Weekly, Monthly"
          />
        </FormField>
      </div>

      <div className="space-y-4">
        <FormField
          label="Filters"
          error={errors.filters}
        >
          <Textarea
            value={formData.filters}
            onChange={(e) => handleInputChange('filters', e.target.value)}
            placeholder="Define filters for the report (e.g., status=completed, date_range=last_month)"
            rows={3}
          />
        </FormField>

        <FormField
          label="Aggregations"
          error={errors.aggregations}
        >
          <Textarea
            value={formData.aggregations}
            onChange={(e) => handleInputChange('aggregations', e.target.value)}
            placeholder="Define aggregations (e.g., count, sum, average, group_by)"
            rows={3}
          />
        </FormField>

        <FormField
          label="Calculations"
          error={errors.calculations}
        >
          <Textarea
            value={formData.calculations}
            onChange={(e) => handleInputChange('calculations', e.target.value)}
            placeholder="Define custom calculations and formulas"
            rows={3}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
        >
          {report ? 'Update Report' : 'Create Report'}
        </Button>
      </div>
    </form>
  )
}

export default ReportForm
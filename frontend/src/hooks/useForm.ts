import { useState, useCallback } from 'react'
import { FormErrors } from '../types/common'

export function useForm<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field as string]: false }))
  }, [])

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const validateFields = useCallback((requiredFields: (keyof T)[]) => {
    const newErrors: FormErrors = {}
    requiredFields.forEach(field => {
      const value = formData[field]
      if (!value || (typeof value === 'string' && !value.trim())) {
        newErrors[field as string] = true
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData(initialState)
    setErrors({})
  }, [initialState])

  const setFormState = useCallback((data: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }, [])

  return {
    formData,
    errors,
    handleChange,
    setFieldValue,
    validateFields,
    resetForm,
    setFormState
  }
}

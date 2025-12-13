import { useState, useCallback } from 'react'
import axios, { AxiosError } from 'axios'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useApi<T = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(
    async (
      apiCall: () => Promise<any>,
      options?: UseApiOptions
    ) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiCall()
        const responseData = response.data
        setData(responseData)

        if (options?.onSuccess) {
          options.onSuccess(responseData)
        }

        return responseData
      } catch (err) {
        const errorMessage = err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : 'An error occurred'

        setError(errorMessage)

        if (options?.onError) {
          options.onError(errorMessage)
        }

        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}

import { useState, useCallback } from 'react'

interface ErrorModalState {
  show: boolean
  title: string
  message: string
}

interface DeleteConfirmState {
  show: boolean
  id: number | string | null
}

export function useErrorModal() {
  const [modal, setModal] = useState<ErrorModalState>({
    show: false,
    title: '',
    message: ''
  })

  const showError = useCallback((title: string, message: string) => {
    setModal({ show: true, title, message })
  }, [])

  const hideError = useCallback(() => {
    setModal({ show: false, title: '', message: '' })
  }, [])

  return {
    errorModal: modal,
    showError,
    hideError
  }
}

export function useDeleteConfirm() {
  const [confirm, setConfirm] = useState<DeleteConfirmState>({
    show: false,
    id: null
  })

  const showConfirm = useCallback((id: number | string) => {
    setConfirm({ show: true, id })
  }, [])

  const hideConfirm = useCallback(() => {
    setConfirm({ show: false, id: null })
  }, [])

  return {
    deleteConfirm: confirm,
    showConfirm,
    hideConfirm
  }
}

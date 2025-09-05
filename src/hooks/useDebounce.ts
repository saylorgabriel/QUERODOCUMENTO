'use client'

import { useState, useEffect } from 'react'

/**
 * Hook para debounce de valores
 * Atrasa a atualização do valor até que tenha passado um período especificado
 * sem mudanças
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Configura o timer
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpa o timeout se o valor mudar antes do delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para debounce de callbacks
 * Atrasa a execução de uma função até que tenha passado um período especificado
 * sem chamadas
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const debouncedCallback = ((...args: any[]) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      callback(...args)
    }, delay)

    setDebounceTimer(timer)
  }) as T

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  return debouncedCallback
}
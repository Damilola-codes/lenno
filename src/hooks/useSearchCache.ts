import { useState, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

/**
 * Custom hook for caching search results
 * @param expirationTime - Cache expiration time in milliseconds (default: 5 minutes)
 */
export function useSearchCache<T>(expirationTime = 5 * 60 * 1000) {
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map())

  const getCached = useCallback((key: string): T | null => {
    const entry = cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now > entry.timestamp + entry.expiresIn) {
      // Entry expired, remove it
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(key)
        return newCache
      })
      return null
    }

    return entry.data
  }, [cache])

  const setCached = useCallback((key: string, data: T) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.set(key, {
        data,
        timestamp: Date.now(),
        expiresIn: expirationTime
      })
      return newCache
    })
  }, [expirationTime])

  const clearCache = useCallback(() => {
    setCache(new Map())
  }, [])

  const removeCached = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(key)
      return newCache
    })
  }, [])

  return {
    getCached,
    setCached,
    clearCache,
    removeCached,
    cacheSize: cache.size
  }
}
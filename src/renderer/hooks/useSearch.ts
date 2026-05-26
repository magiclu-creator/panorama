import { useState, useCallback, useEffect } from 'react'

interface SearchResult {
  id: string
  type: 'task' | 'customer' | 'project' | 'event' | 'solar'
  title: string
  subtitle?: string
  module: string
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      // Search across all modules in parallel
      const [tasks, customers, projects] = await Promise.all([
        window.panorama.tasks.search(searchQuery).catch(() => []),
        window.panorama.customers.search(searchQuery).catch(() => []),
        window.panorama.projects.list().catch(() => []),
      ])

      const searchResults: SearchResult[] = []

      // Map tasks
      for (const task of tasks as Array<Record<string, unknown>>) {
        searchResults.push({
          id: task.id as string,
          type: 'task',
          title: task.title as string,
          subtitle: task.description as string | undefined,
          module: 'tasks',
        })
      }

      // Map customers
      for (const customer of customers as Array<Record<string, unknown>>) {
        searchResults.push({
          id: customer.id as string,
          type: 'customer',
          title: customer.name as string,
          subtitle: customer.company as string | undefined,
          module: 'customers',
        })
      }

      // Filter projects by name
      for (const project of projects as Array<Record<string, unknown>>) {
        if (
          (project.name as string).toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.description as string || '').toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          searchResults.push({
            id: project.id as string,
            type: 'project',
            title: project.name as string,
            subtitle: project.description as string | undefined,
            module: 'projects',
          })
        }
      }

      setResults(searchResults)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query)
    }, 300) // Debounce 300ms
    return () => clearTimeout(timer)
  }, [query, search])

  return { query, setQuery, results, loading }
}

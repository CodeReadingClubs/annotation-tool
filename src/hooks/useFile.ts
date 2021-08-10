import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import * as github from '../github'

export function useFilePath(): string | null {
  const { hash } = useParams<{ hash?: string }>()
  if (!hash) {
    return null
  }
  return github.parseFileHash(hash)
}

export function useFile(): github.File | null {
  const filePath = useFilePath()
  if (!filePath) {
    return null
  }

  return useMemo(() => github.parsePath(filePath), [filePath])
}

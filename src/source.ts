import LZString from 'lz-string'
import { File, parsePath, pathForFile } from './github'

export type Source = {
  type: 'githubPermalink'
  file: File
}

export function parseHash(hash: string): Source | null {
  const githubPath = LZString.decompressFromEncodedURIComponent(hash)
  if (!githubPath) {
    return null
  }

  const file = parsePath(githubPath)
  if (!file) {
    return null
  }

  return { type: 'githubPermalink', file }
}

export function sourceHash(source: Source): string {
  return LZString.compressToEncodedURIComponent(pathForFile(source.file))
}

export function localStorageKey(source: Source): string {
  return `github:${pathForFile(source.file)}`
}

import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { parseHash, Source } from '../source'

export default function useSource(): Source {
  const { hash } = useParams<{ hash?: string }>()
  if (!hash) {
    throw new Error(`url is missing a hash param. Can't determine code source`)
  }
  const source = useMemo(() => parseHash(hash), [hash])
  if (!source) {
    throw new Error(`Can't parse source from the url hash param`)
  }
  return source
}

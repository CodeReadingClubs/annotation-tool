import LZString from 'lz-string'

export type File = {
  owner: string
  repo: string
  commitSha: string
  path: string
}

// captures a github url (or just the path) of a permalink file on github:
// <optional github.com stuff>/<author>/<repo>/blob/<a commit sha>/<file path>
// the author, repo, sha, and file path are captured
const pathRegex =
  /^(?:(?:https?:\/\/)(?:www\.)?github\.com)?\/?([^\/]+)\/([^\/]+)\/blob\/([a-fA-F0-9]{5,40})\/(.*)\/?$/

// extracts info from a GitHub file permalink using pathRegex (defined above).
// Returns null if the path doesn't match the expected pattern
export function parsePath(path: string): File | null {
  const match = path.match(pathRegex)

  if (!match) {
    return null
  }

  const [_, owner, repo, commitSha, codePath] = match
  return { owner, repo, commitSha, path: codePath }
}

// fetches the raw (text) contents of a file on GitHub
export async function fetchCode({
  owner,
  repo,
  commitSha,
  path,
}: File): Promise<string> {
  const contentsResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${commitSha}`,
  )

  const contentsJson = await contentsResponse.json()
  const downloadUrl = contentsJson.download_url
  if (!downloadUrl) {
    throw new Error(`There was a problem fetching the code from GitHub`)
  }
  const codeResponse = await fetch(downloadUrl)
  return await codeResponse.text()
}

function pathForFile(file: File): string {
  return `${file.owner}/${file.repo}/blob/${file.commitSha}/${file.path}`
}

export function fileHash(file: File): string {
  return LZString.compressToEncodedURIComponent(pathForFile(file))
}

export function parseFileHash(hash: string): string | null {
  return LZString.decompressFromEncodedURIComponent(hash)
}

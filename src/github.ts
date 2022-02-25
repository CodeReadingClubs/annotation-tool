export type File = {
  owner: string
  repo: string
  commitSha: string
  path: string
}

export type ParseError =
  | { type: 'notGithubUrl'; hostname: string }
  | { type: 'notGithubPermalink'; pathname: string }

type ParseResult =
  | { type: 'success'; file: File }
  | { type: 'failure'; error: ParseError }

// extracts info from a GitHub url:
// https://github.com/<owner>/<repo>/blob/<a commit sha>/<file path>
// Throws a ParseError if the url doesn't match the expected pattern
export function parsePath(path: string): ParseResult {
  const url = new URL(path, 'https://github.com')
  if (url.hostname !== 'github.com') {
    return {
      type: 'failure',
      error: { type: 'notGithubUrl', hostname: url.hostname },
    }
  }
  const [, owner, repo, theWordBlob, commitSha, ...filePathComponents] =
    url.pathname.split('/')

  if (
    theWordBlob !== 'blob' ||
    filePathComponents.length === 0 ||
    !/^[a-fA-F0-9]{5,40}$/.test(commitSha)
  ) {
    return {
      type: 'failure',
      error: { type: 'notGithubPermalink', pathname: url.pathname },
    }
  }

  return {
    type: 'success',
    file: { owner, repo, commitSha, path: filePathComponents.join('/') },
  }
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

export function pathForFile(file: File): string {
  return `${file.owner}/${file.repo}/blob/${file.commitSha}/${file.path}`
}

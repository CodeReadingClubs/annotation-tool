import React from 'react'
import useExport, { CopyState, DownloadState } from '../hooks/useExport'

export default function Export() {
  const { copy, download, copyState, downloadState } = useExport()

  return (
    <div>
      {navigator.clipboard.write !== undefined && (
        <button
          disabled={copyState === 'preparing' || copyState === 'success'}
          onClick={copy}
        >
          {copyButtonTitle(copyState)}
        </button>
      )}
      <button disabled={downloadState === 'preparing'} onClick={download}>
        {downloadButtonTitle(downloadState)}
      </button>
      {(copyState === 'failure' || downloadState === 'failure') && (
        <p role='alert'>Something went wrong. Try again later</p>
      )}
    </div>
  )
}

function copyButtonTitle(copyState: CopyState): string {
  switch (copyState) {
    case 'idle': {
      return 'copy as png'
    }
    case 'preparing': {
      return 'preparing...'
    }
    case 'failure': {
      return 'copy as png'
    }
    case 'success': {
      return 'copied!'
    }
  }
}

function downloadButtonTitle(downloadState: DownloadState): string {
  switch (downloadState) {
    case 'idle': {
      return 'download as png'
    }
    case 'preparing': {
      return 'preparing...'
    }
    case 'failure': {
      return 'download as png'
    }
  }
}

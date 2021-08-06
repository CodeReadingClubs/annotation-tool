import html2canvas from 'html2canvas'
import { useCallback, useState } from 'react'

export type CopyState = 'idle' | 'preparing' | 'success' | 'failure'

export type DownloadState = 'idle' | 'preparing' | 'failure'

type ReturnType = {
  copy: () => void
  download: () => void
  copyState: CopyState
  downloadState: DownloadState
}

export default function useExport(): ReturnType {
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [downloadState, setDownloadState] = useState<DownloadState>('idle')

  const copy = useCallback(() => {
    setCopyState('preparing')
    copyContainer()
      .then(() => setCopyState('success'))
      .then(() => wait(1000))
      .then(() => setCopyState('idle'))
      .catch(() => setCopyState('failure'))
  }, [])

  const download = useCallback(() => {
    setDownloadState('preparing')
    downloadContainer()
      .then(() => setDownloadState('idle'))
      .catch(() => setDownloadState('failure'))
  }, [])

  return { copy, download, copyState, downloadState }
}

async function copyContainer() {
  if (!navigator.clipboard.write) {
    throw new Error(`Can't use clipboard API`)
  }
  try {
    const clipboardItem = new ClipboardItem({
      'image/png': containerAsCanvas().then(canvasToBlob),
    })
    await navigator.clipboard.write([clipboardItem])
  } catch (error) {
    // Safari only allows access to the clipboard in user events, but async
    // functions inside user events (like awaiting the creation of a
    // canvas-image blob) aren't considered user-event context,
    // even if those promises were fired in an event handler.
    // The way to work around this is to initialize ClipboardItem with a
    // Promise<Blob>. HOWEVER, this doesn't work in Chromium, so we need this
    // highly fragile workaround.
    if (
      error.message ===
      "Failed to construct 'ClipboardItem': Failed to convert value to 'Blob'."
    ) {
      const blob = await containerAsCanvas().then(canvasToBlob)
      const clipboardItem = new ClipboardItem({
        'image/png': blob,
      })
      await navigator.clipboard.write([clipboardItem])
    } else {
      throw error
    }
  }
}

async function downloadContainer() {
  const canvas = await containerAsCanvas()
  const blob = await canvasToBlob(canvas)
  downloadBlob(blob, 'code.png')
}

async function containerAsCanvas(): Promise<HTMLCanvasElement> {
  const container = document.getElementsByClassName(
    'container',
  )[0] as HTMLElement
  if (!container) {
    throw new Error(`Couldn't find container element`)
  }
  const padding = 20
  const windowWidth = container.scrollWidth + 2 * padding
  const canvas = await html2canvas(container, {
    logging: false,
    onclone: (document, element) => {
      document.body.style.margin = '0'
      element.style.border = `${padding}px solid white`
      const svg = document.getElementsByTagName('svg')[0]
      svg.style.width = `${windowWidth}px`
      svg.style.inlineSize = `${windowWidth}px`
    },
    windowWidth,
  })

  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error(`Couldn't convert canvas to blob`))
      } else {
        resolve(blob)
      }
    }, 'image/png')
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

async function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration)
  })
}

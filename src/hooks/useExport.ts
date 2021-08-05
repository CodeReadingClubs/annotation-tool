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
  if (navigator.clipboard.write) {
    const clipboardItem = new ClipboardItem({
      'image/png': containerAsCanvas().then(canvasToBlob),
    })
    await navigator.clipboard.write([clipboardItem])
  } else {
    throw new Error(`Can't use clipboard API`)
  }
}

async function downloadContainer() {
  const canvas = await containerAsCanvas()
  await downloadCanvas(canvas)
}

async function containerAsCanvas(): Promise<HTMLCanvasElement> {
  const container = document.getElementsByClassName(
    'container',
  )[0] as HTMLElement
  if (!container) {
    throw new Error(`Couldn't find container element`)
  }
  const canvas = await html2canvas(container)
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

async function downloadCanvas(canvas: HTMLCanvasElement) {
  const image = canvas.toDataURL('image/png')
  const href = image.replace('image/png', 'octet/stream')
  const a = document.createElement('a')
  a.href = href
  a.download = 'code.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

async function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration)
  })
}

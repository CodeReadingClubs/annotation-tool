import html2canvas from 'html2canvas'
import React, { useState } from 'react'

export default function Export() {
  const copyImage = () => {
    copyContainer().catch((error) => console.error(error))
  }
  const saveImage = () => {
    downloadContainer().catch((error) => console.error(error))
  }
  return (
    <div>
      {navigator.clipboard.write && (
        <button onClick={copyImage}>copy as image</button>
      )}
      <button onClick={saveImage}>save as image</button>
    </div>
  )
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

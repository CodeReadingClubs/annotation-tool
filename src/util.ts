import { MouseEvent } from 'react'

export function minBy<T>(
  array: T[],
  value: (item: T) => number,
): [T, number] | null {
  if (array.length === 0) {
    return null
  }

  let minIndex = 0
  let minItem = array[minIndex]
  let minValue = value(minItem)

  array.slice(1).forEach((item, index) => {
    const currentValue = value(item)
    if (currentValue < minValue) {
      minValue = currentValue
      minItem = item
      minIndex = index
    }
  })

  return [minItem, minIndex]
}

export function isMonotonous(a: number, b: number, c: number): boolean {
  return (a <= b && b <= c) || (a >= b && b >= c)
}

export function findLast<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean,
): [T, number] | null {
  for (let index = array.length - 1; index >= 0; index--) {
    const item = array[index]
    if (predicate(item, index)) {
      return [item, index]
    }
  }

  return null
}

export function pointFromEvent(
  event: MouseEvent,
  container: HTMLElement | SVGSVGElement,
) {
  const containerRect = container.getBoundingClientRect()
  return {
    x: event.clientX - containerRect.left,
    y: event.clientY - containerRect.top,
  }
}

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

  range(1, array.length).map((index) => {
    const currentValue = value(array[index])
    if (currentValue < minValue) {
      minValue = currentValue
      minItem = array[index]
      minIndex = index
    }
  })

  return [minItem, minIndex]
}

export function pairs<T>(array: T[]): [T, T][] {
  return range(0, array.length - 1).map((index) => [
    array[index],
    array[index + 1],
  ])
}

function range(min: number, max: number): number[] {
  if (max < min) {
    return []
  }
  return new Array(max - min).fill(0).map((_, index) => min + index)
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

// via https://stackoverflow.com/a/51399781/3813902
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

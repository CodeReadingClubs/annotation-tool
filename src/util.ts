export function minBy<T>(array: T[], value: (item: T) => number): T | null {
  if (array.length === 0) {
    return null
  }

  let minItem = array[0]
  let minValue = value(array[0])

  array.slice(1).forEach((item) => {
    const currentValue = value(item)
    if (currentValue < minValue) {
      minValue = currentValue
      minItem = item
    }
  })

  return minItem
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

import React from 'react'
import { Color } from '../colors'
import useCssColor from '../hooks/useCssColor'

type Props = {
  colors: Color[]
  onSelect: (color: Color) => void
  selectedColor?: Color
}

export default function ColorPicker({
  colors,
  onSelect,
  selectedColor,
}: Props) {
  return (
    <div className='color-picker'>
      {colors.map((color) => (
        <ColorButton
          color={color}
          onClick={() => onSelect(color)}
          selected={selectedColor === color}
          key={color}
        />
      ))}
    </div>
  )
}

function ColorButton({
  color,
  onClick,
  selected,
}: {
  color: Color
  onClick: () => void
  selected: boolean
}) {
  const cssColor = useCssColor(color)
  return (
    <button
      className={`color-button ${selected ? 'color-button--selected' : ''}`}
      onClick={onClick}
      style={{ '--color': cssColor } as React.CSSProperties}
    />
  )
}

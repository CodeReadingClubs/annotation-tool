import React from 'react'

type Props = {
  colors: string[]
  onSelect: (color: string) => void
  selectedColor?: string
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
  color: string
  onClick: () => void
  selected: boolean
}) {
  return (
    <button
      className={`color-button ${selected ? 'color-button--selected' : ''}`}
      onClick={onClick}
      style={{ '--color': color } as React.CSSProperties}
    />
  )
}

import React from 'react'

type Props = {
  colors: string[]
  onSelect: (color: string) => void
}

export default function ColorPicker({ colors, onSelect }: Props) {
  return (
    <div className='color-picker'>
      {colors.map((color) => (
        <ColorButton
          color={color}
          onClick={() => onSelect(color)}
          key={color}
        />
      ))}
    </div>
  )
}

function ColorButton({
  color,
  onClick,
}: {
  color: string
  onClick: () => void
}) {
  return (
    <button
      className='color-button'
      onClick={onClick}
      style={{ '--color': color } as React.CSSProperties}
    />
  )
}

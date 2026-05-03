/**
 * Material Symbols Outlined — names: https://fonts.google.com/icons
 */
export default function Icon({ name, size = 20, className = '', label, filled = false }) {
  const cls = `material-symbols-outlined icon-ms${filled ? ' icon-ms--filled' : ''}${className ? ` ${className}` : ''}`
  return (
    <span
      className={cls}
      style={{
        fontSize: size,
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        fontVariationSettings: filled ? '"FILL" 1' : '"FILL" 0',
      }}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
    >
      {name}
    </span>
  )
}

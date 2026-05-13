import { useLoomDesigner } from '@/context/LoomDesignerContext'

export function WarningPanel() {
  const { validationMessages } = useLoomDesigner()
  if (!validationMessages.length) {
    return (
      <section className="panel panel--compact">
        <h2 className="panel__title">Design checks</h2>
        <p className="panel__hint text-muted">No warnings - looking good.</p>
      </section>
    )
  }

  return (
    <section className="panel panel--compact">
      <h2 className="panel__title">Design checks</h2>
      <ul className="warn-list">
        {validationMessages.map((m) => (
          <li key={m.id} className={`warn warn--${m.severity}`}>
            {m.text}
          </li>
        ))}
      </ul>
    </section>
  )
}

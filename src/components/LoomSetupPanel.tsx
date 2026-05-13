import { GAUGE_PRESETS } from '@/presets/gaugePresets'
import { useLoomDesigner } from '@/context/LoomDesignerContext'
import type { GaugeStyleId, LoomShape } from '@/types/loom'

const SHAPES: { id: LoomShape; label: string; note?: string; disabled?: boolean }[] = [
  { id: 'round', label: 'Round' },
  { id: 'oval', label: 'Oval', disabled: true, note: 'Planned' },
  { id: 'rectangular', label: 'Rectangle frame' },
  { id: 'rake', label: 'Straight row' },
]

export function LoomSetupPanel() {
  const { state, dispatch } = useLoomDesigner()

  return (
    <section className="panel panel--loom-setup">
      <h2 className="panel__title">Loom</h2>
      <p className="panel__hint panel__hint--tight">
        Shape and yarn gauge. Fine-tune counts, spacing, and the board in the parameters panel.
      </p>

      <div className="loom-setup__section">
        <div className="loom-setup__label">Shape</div>
        <div className="shape-row shape-row--setup">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`shape-chip ${state.params.shape === s.id ? 'is-active' : ''}`}
              disabled={s.disabled}
              title={s.note}
              onClick={() => !s.disabled && dispatch({ type: 'set_shape', shape: s.id })}
            >
              {s.label}
              {s.disabled ? <span className="shape-chip__soon">soon</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="loom-setup__section loom-setup__section--gauge">
        <div className="loom-setup__label">Gauge</div>
        <p className="loom-setup__micro">Suggested peg size - overrides stay in parameters.</p>
        <div className="gauge-list gauge-list--compact">
          {GAUGE_PRESETS.map((g) => {
            const active = state.gaugeStyle === g.id
            return (
              <button
                key={g.id}
                type="button"
                className={`gauge-tile gauge-tile--compact ${active ? 'is-active' : ''}`}
                onClick={() => dispatch({ type: 'set_gauge_style', gauge: g.id as GaugeStyleId })}
              >
                <div className="gauge-tile__label">{g.label}</div>
                <div className="gauge-tile__desc">{g.description}</div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

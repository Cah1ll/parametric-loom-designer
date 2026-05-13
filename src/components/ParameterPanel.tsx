import { useLoomDesigner } from '@/context/LoomDesignerContext'
import { formatLength } from '@/utils/unitConversion'
import { getGaugePreset } from '@/presets/gaugePresets'
import {
  getPegPitchRadiusMm,
  getRakePitchSpanTargetMm,
  getRectangularPitchHalfExtentsMm,
  getRectangularPitchPerimeterMm,
  getRectangularSlabInnerVoidHalfExtentsMm,
  getSlabPegPathLengthMm,
  isRakeSlab,
  isRectangularFrameSlab,
  isSlabBoardShape,
  spacingFromCount,
} from '@/utils/pegSpacing'

function NumField({
  label,
  valueMm,
  unit,
  min,
  max,
  step,
  onChangeMm,
  hint,
  disabled,
}: {
  label: string
  valueMm: number
  unit: 'mm' | 'in'
  min: number
  max: number
  step: number
  onChangeMm: (mm: number) => void
  hint?: string
  disabled?: boolean
}) {
  const display = unit === 'mm' ? valueMm : valueMm / 25.4
  const stepDisp = unit === 'mm' ? step : step / 25.4
  return (
    <label className="field">
      <div className="field__head">
        <span>{label}</span>
        <span className="field__value mono">{formatLength(valueMm, unit, 2)}</span>
      </div>
      <div className="field__row">
        <input
          type="range"
          min={unit === 'mm' ? min : min / 25.4}
          max={unit === 'mm' ? max : max / 25.4}
          step={stepDisp}
          value={display}
          disabled={disabled}
          onChange={(e) => {
            const v = Number(e.target.value)
            const mm = unit === 'mm' ? v : v * 25.4
            onChangeMm(mm)
          }}
        />
        <input
          className="field__num mono"
          type="number"
          value={Number(display.toFixed(3))}
          step={stepDisp}
          disabled={disabled}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (!Number.isFinite(v)) return
            const mm = unit === 'mm' ? v : v * 25.4
            onChangeMm(mm)
          }}
        />
      </div>
      {hint ? <div className="field__hint">{hint}</div> : null}
    </label>
  )
}

function IntField({
  label,
  value,
  min,
  max,
  onChange,
  disabled,
  hint,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (n: number) => void
  disabled?: boolean
  hint?: string
}) {
  return (
    <label className="field">
      <div className="field__head">
        <span>{label}</span>
        <span className="field__value mono">{value}</span>
      </div>
      <div className="field__row">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <input
          className="field__num mono"
          type="number"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(e) => onChange(Math.round(Number(e.target.value)))}
        />
      </div>
      {hint ? <div className="field__hint">{hint}</div> : null}
    </label>
  )
}

function RatioField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  hint,
  formatValue,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  hint?: string
  formatValue: (v: number) => string
}) {
  return (
    <label className="field">
      <div className="field__head">
        <span>{label}</span>
        <span className="field__value mono">{formatValue(value)}</span>
      </div>
      <div className="field__row">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <input
          className="field__num mono"
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (!Number.isFinite(v)) return
            onChange(Math.min(max, Math.max(min, v)))
          }}
        />
      </div>
      {hint ? <div className="field__hint">{hint}</div> : null}
    </label>
  )
}

function SourceChip({ children, tone }: { children: string; tone: 'gauge' | 'calc' | 'manual' }) {
  const cls = tone === 'gauge' ? 'chip chip--gauge' : tone === 'calc' ? 'chip chip--calc' : 'chip chip--manual'
  return <span className={cls}>{children}</span>
}

export function ParameterPanel() {
  const { state, dispatch, innerOpeningDiameterMm } = useLoomDesigner()
  const { params, displayUnit, gaugeStyle, pegDerivationMode, fieldOverrides } = state
  const gauge = getGaugePreset(gaugeStyle)

  const pegDiameterSource: 'gauge' | 'manual' =
    gaugeStyle !== 'custom' && !fieldOverrides.pegDiameter ? 'gauge' : 'manual'
  const pegSpacingSource: 'gauge' | 'calc' | 'manual' =
    pegDerivationMode === 'from_count'
      ? 'calc'
      : fieldOverrides.pegSpacing
        ? 'manual'
        : gaugeStyle !== 'custom'
          ? 'gauge'
          : 'manual'

  const suggestedSpacing = spacingFromCount(params)
  const isSlabBoard = isSlabBoardShape(params.shape)
  const rectHalf = isRectangularFrameSlab(params) ? getRectangularPitchHalfExtentsMm(params) : null
  const rectInnerVoid = isRectangularFrameSlab(params) ? getRectangularSlabInnerVoidHalfExtentsMm(params) : null
  const pegSpacingLabel = isRakeSlab(params)
    ? 'Peg spacing (along row)'
    : isRectangularFrameSlab(params)
      ? 'Peg spacing (avg on frame)'
      : 'Peg spacing (arc)'

  return (
    <section className="panel panel--params">
      <h2 className="panel__title">Parameters</h2>
      <p className="panel-lede">Tune pegs first; open sections for board size, readouts, and extras.</p>

      <div className="field">
        <div className="field__head">
          <span>Peg spacing mode</span>
        </div>
        <div className="segmented segmented--full">
          <button
            type="button"
            className={pegDerivationMode === 'from_count' ? 'is-active' : ''}
            onClick={() => dispatch({ type: 'set_peg_derivation_mode', mode: 'from_count' })}
          >
            From peg count
          </button>
          <button
            type="button"
            className={pegDerivationMode === 'from_spacing' ? 'is-active' : ''}
            onClick={() => dispatch({ type: 'set_peg_derivation_mode', mode: 'from_spacing' })}
          >
            From spacing
          </button>
        </div>
      </div>

      <IntField
        label="Peg count"
        value={params.pegCount}
        min={params.shape === 'rectangular' ? 4 : 3}
        max={240}
        disabled={pegDerivationMode === 'from_spacing'}
        hint={pegDerivationMode === 'from_spacing' ? 'Spacing drives peg count in this mode.' : undefined}
        onChange={(n) => dispatch({ type: 'set_param', key: 'pegCount', value: n })}
      />

      <div className="field">
        <div className="field__head">
          <span>{pegSpacingLabel}</span>
          <SourceChip tone={pegSpacingSource === 'calc' ? 'calc' : pegSpacingSource === 'gauge' ? 'gauge' : 'manual'}>
            {pegSpacingSource === 'calc' ? 'Calculated' : pegSpacingSource === 'gauge' ? 'Gauge' : 'Manual'}
          </SourceChip>
        </div>
        <div className="field__row">
          <input
            type="range"
            min={3}
            max={40}
            step={0.1}
            value={params.pegSpacingMm}
            disabled={pegDerivationMode === 'from_count'}
            onChange={(e) =>
              dispatch({ type: 'set_param', key: 'pegSpacingMm', value: Number(e.target.value) })
            }
          />
          <input
            className="field__num mono"
            type="number"
            value={params.pegSpacingMm}
            disabled={pegDerivationMode === 'from_count'}
            onChange={(e) =>
              dispatch({ type: 'set_param', key: 'pegSpacingMm', value: Number(e.target.value) })
            }
          />
        </div>
        {pegDerivationMode === 'from_count' ? (
          <div className="field__hint">Spacing updates from diameter, peg size, and count.</div>
        ) : null}
      </div>

      <div className="field">
        <div className="field__head">
          <span>Peg diameter</span>
          <SourceChip tone={pegDiameterSource === 'gauge' ? 'gauge' : 'manual'}>
            {pegDiameterSource === 'gauge' ? 'Gauge' : 'Manual'}
          </SourceChip>
        </div>
        <div className="field__row">
          <input
            type="range"
            min={3}
            max={12}
            step={0.05}
            value={params.pegDiameterMm}
            onChange={(e) =>
              dispatch({ type: 'set_param', key: 'pegDiameterMm', value: Number(e.target.value) })
            }
          />
          <input
            className="field__num mono"
            type="number"
            value={params.pegDiameterMm}
            onChange={(e) =>
              dispatch({ type: 'set_param', key: 'pegDiameterMm', value: Number(e.target.value) })
            }
          />
        </div>
        {gauge && gaugeStyle !== 'custom' ? (
          <div className="field__hint">
            {gauge.label} suggested range: {gauge.pegDiameterMm.min}-{gauge.pegDiameterMm.max} mm
          </div>
        ) : null}
      </div>

      <NumField
        label="Peg height"
        valueMm={params.pegHeightMm}
        unit={displayUnit}
        min={8}
        max={50}
        step={0.25}
        onChangeMm={(mm) => dispatch({ type: 'set_param', key: 'pegHeightMm', value: mm })}
      />

      <div className="field">
        <div className="field__head">
          <span>Peg tip</span>
        </div>
        <div className="segmented segmented--full">
          <button
            type="button"
            className={params.pegTipStyle === 'flat' ? 'is-active' : ''}
            onClick={() => dispatch({ type: 'set_param', key: 'pegTipStyle', value: 'flat' })}
          >
            Flat top
          </button>
          <button
            type="button"
            className={params.pegTipStyle === 'rounded' ? 'is-active' : ''}
            onClick={() => dispatch({ type: 'set_param', key: 'pegTipStyle', value: 'rounded' })}
          >
            Rounded
          </button>
          <button
            type="button"
            className={params.pegTipStyle === 'spherical' ? 'is-active' : ''}
            onClick={() => dispatch({ type: 'set_param', key: 'pegTipStyle', value: 'spherical' })}
          >
            Spherical
          </button>
        </div>
        <div className="field__hint">
          {params.pegTipStyle === 'flat'
            ? 'Sharp cylinder top.'
            : params.pegTipStyle === 'rounded'
              ? 'Outer top corner is filleted (no extra slider).'
              : 'Full sphere cap - wider than the shaft for a yarn / material stop.'}
        </div>
      </div>

      {params.pegTipStyle === 'spherical' ? (
        <RatioField
          label="Peg tip dome"
          value={params.pegCapRadiusMultiple}
          min={1.02}
          max={1.35}
          step={0.02}
          formatValue={(v) => {
            const capR = (params.pegDiameterMm / 2) * v
            return `${v.toFixed(2)}xr (${(capR * 2).toFixed(1)} mm dia)`
          }}
          hint="Values above 1x mean the sphere is wider than the peg shaft (typical for a stop lip)."
          onChange={(v) => dispatch({ type: 'set_param', key: 'pegCapRadiusMultiple', value: v })}
        />
      ) : null}

      <details className="panel-details" open>
        <summary>{isSlabBoard ? 'Board size & placement' : 'Ring size & placement'}</summary>
        <NumField
          label={isRakeSlab(params) ? 'Board length (along peg row)' : 'Board length (X, outer)'}
          valueMm={params.baseOuterDiameterMm}
          unit={displayUnit}
          min={40}
          max={520}
          step={0.5}
          hint={
            isRakeSlab(params)
              ? 'Single centered row along X; spacing follows length and peg count.'
              : isRectangularFrameSlab(params)
                ? 'Pegs sit on a rectangular frame inset inside this outer length (X).'
                : undefined
          }
          onChangeMm={(mm) => dispatch({ type: 'set_param', key: 'baseOuterDiameterMm', value: mm })}
        />
        <NumField
          label={isRakeSlab(params) ? 'Board width (across peg row)' : 'Board width (Y, outer)'}
          valueMm={params.baseWidthMm}
          unit={displayUnit}
          min={4}
          max={80}
          step={0.25}
          hint={
            isRectangularFrameSlab(params)
              ? 'Shorter outer side of the board; peg frame runs around the perimeter.'
              : undefined
          }
          onChangeMm={(mm) => dispatch({ type: 'set_param', key: 'baseWidthMm', value: mm })}
        />
        <NumField
          label="Base thickness"
          valueMm={params.baseThicknessMm}
          unit={displayUnit}
          min={3}
          max={20}
          step={0.25}
          onChangeMm={(mm) => dispatch({ type: 'set_param', key: 'baseThicknessMm', value: mm })}
        />
      </details>

      <details className="panel-details">
        <summary>Readouts</summary>
        <div className="calc-block">
          {isRakeSlab(params) ? (
            <>
              <div className="calc-block__row">
                <span className="text-muted">Inner opening</span>
                <span className="mono">Solid board (no center hole)</span>
              </div>
              <div className="calc-block__row">
                <span className="text-muted">Peg row span (outer peg centers)</span>
                <span className="mono">{formatLength(getSlabPegPathLengthMm(params), displayUnit, 2)}</span>
              </div>
              <div className="calc-block__row">
                <span className="text-muted">Target span (inside board ends)</span>
                <span className="mono">{formatLength(getRakePitchSpanTargetMm(params), displayUnit, 2)}</span>
              </div>
            </>
          ) : isRectangularFrameSlab(params) ? (
            <>
              <div className="calc-block__row">
                <span className="text-muted">Inner void (material cutout)</span>
                <span className="mono">
                  {rectInnerVoid
                    ? `${formatLength(rectInnerVoid.ix * 2, displayUnit, 2)} x ${formatLength(rectInnerVoid.iy * 2, displayUnit, 2)}`
                    : 'None (board too small for cutout)'}
                </span>
              </div>
              <div className="calc-block__row">
                <span className="text-muted">Frame perimeter (peg path)</span>
                <span className="mono">{formatLength(getRectangularPitchPerimeterMm(params), displayUnit, 2)}</span>
              </div>
              <div className="calc-block__row">
                <span className="text-muted">Pitch half-length x half-width</span>
                <span className="mono">
                  {rectHalf
                    ? `${formatLength(rectHalf.hx * 2, displayUnit, 2)} x ${formatLength(rectHalf.hy * 2, displayUnit, 2)}`
                    : '-'}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="calc-block__row">
                <span className="text-muted">Inner opening (derived)</span>
                <span className="mono">{formatLength(innerOpeningDiameterMm, displayUnit, 2)}</span>
              </div>
              <div className="calc-block__row">
                <span className="text-muted">Peg pitch radius</span>
                <span className="mono">{formatLength(getPegPitchRadiusMm(params), displayUnit, 2)}</span>
              </div>
            </>
          )}
          <div className="calc-block__row">
            <span className="text-muted">Suggested spacing @ count</span>
            <span className="mono">{suggestedSpacing.toFixed(2)} mm</span>
          </div>
        </div>
      </details>

      <details className="panel-details">
        <summary>Fine tuning</summary>
        <NumField
          label="Edge fillet / bevel"
          valueMm={params.edgeFilletMm}
          unit={displayUnit}
          min={0}
          max={6}
          step={0.05}
          onChangeMm={(mm) => dispatch({ type: 'set_param', key: 'edgeFilletMm', value: mm })}
        />
        <div className="field__hint mono">Peg attach: {params.pegAttachMode} (threaded pegs planned)</div>
      </details>
    </section>
  )
}

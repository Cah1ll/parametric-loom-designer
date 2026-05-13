import { BUILD_PLATE_PRESETS } from '@/presets/buildPlatePresets'
import { useLoomDesigner } from '@/context/LoomDesignerContext'
import { formatLength } from '@/utils/unitConversion'

export function ExportPanel() {
  const { state, dispatch, buildPlate, validationMessages } = useLoomDesigner()
  const plateFits = !validationMessages.some((m) => m.id === 'bed_oversize')

  return (
    <section className="panel panel--compact">
      <h2 className="panel__title">Build plate</h2>
      <label className="field">
        <div className="field__head">
          <span>Printer preset</span>
        </div>
        <select
          className="select"
          value={state.buildPlatePresetId}
          onChange={(e) => dispatch({ type: 'set_build_plate_preset', id: e.target.value })}
        >
          {BUILD_PLATE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} - {p.widthMm}x{p.depthMm} mm
            </option>
          ))}
        </select>
      </label>

      {state.buildPlatePresetId === 'custom' ? (
        <div className="two-col">
          <label className="field">
            <div className="field__head">
              <span>Width (mm)</span>
            </div>
            <input
              className="field__num mono"
              type="number"
              value={state.customBuildPlateWidthMm}
              onChange={(e) =>
                dispatch({
                  type: 'set_custom_build_plate',
                  widthMm: Number(e.target.value),
                  depthMm: state.customBuildPlateDepthMm,
                })
              }
            />
          </label>
          <label className="field">
            <div className="field__head">
              <span>Depth (mm)</span>
            </div>
            <input
              className="field__num mono"
              type="number"
              value={state.customBuildPlateDepthMm}
              onChange={(e) =>
                dispatch({
                  type: 'set_custom_build_plate',
                  widthMm: state.customBuildPlateWidthMm,
                  depthMm: Number(e.target.value),
                })
              }
            />
          </label>
        </div>
      ) : null}

      <label className="toggle">
        <input type="checkbox" checked={state.showBuildPlate} onChange={() => dispatch({ type: 'toggle_build_plate' })} />
        <span>Show build plate in preview</span>
      </label>

      <label className="toggle">
        <input
          type="checkbox"
          checked={state.enforceBuildPlateFit}
          onChange={(e) => dispatch({ type: 'set_enforce_build_plate_fit', value: e.target.checked })}
        />
        <span>Enforce fit (blocks export if too large)</span>
      </label>

      <div className={`fit-pill ${plateFits ? 'fit-pill--ok' : 'fit-pill--bad'}`}>
        {plateFits ? 'Fits selected plate (XY footprint)' : 'Exceeds selected plate footprint'}
      </div>
      <div className="field__hint mono">
        Plate: {buildPlate.widthMm} x {buildPlate.depthMm} mm ({formatLength(buildPlate.widthMm, state.displayUnit, 1)}{' '}
        x {formatLength(buildPlate.depthMm, state.displayUnit, 1)})
      </div>
    </section>
  )
}

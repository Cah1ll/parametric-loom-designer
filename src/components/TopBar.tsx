import { useLoomDesigner } from '@/context/LoomDesignerContext'
import { useTheme } from '@/context/ThemeContext'
import { downloadStl, exportRoundLoomStlBinary } from '@/utils/exportStl'

export function TopBar() {
  const { state, dispatch, exportBlocked, exportBlockedReason } = useLoomDesigner()
  const { theme, toggleTheme } = useTheme()

  const onExport = () => {
    if (exportBlocked) return
    try {
      const buf = exportRoundLoomStlBinary(state.params)
      const shape = state.params.shape
      const name =
        shape === 'rake' || shape === 'rectangular'
          ? `${shape === 'rake' ? 'straight' : 'rect'}-loom.stl`
          : 'round-loom.stl'
      downloadStl(buf, name)
    } catch (e) {
      console.error('STL export failed', e)
      window.alert(e instanceof Error ? e.message : 'STL export failed.')
    }
  }

  return (
    <header className="top-bar">
      <div className="top-bar__brand">
        <span className="top-bar__logo" aria-hidden>
          ◎
        </span>
        <div>
          <div className="top-bar__title">Parametric Loom Designer</div>
          <div className="top-bar__subtitle">3D-printable knitting looms</div>
        </div>
      </div>
      <div className="top-bar__actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              />
            </svg>
          ) : (
            <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <circle cx="12" cy="12" r="4" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeWidth="2"
                d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
              />
            </svg>
          )}
        </button>
        <div className="segmented" role="group" aria-label="Units">
          <button
            type="button"
            className={state.displayUnit === 'mm' ? 'is-active' : ''}
            onClick={() => dispatch({ type: 'set_display_unit', unit: 'mm' })}
          >
            mm
          </button>
          <button
            type="button"
            className={state.displayUnit === 'in' ? 'is-active' : ''}
            onClick={() => dispatch({ type: 'set_display_unit', unit: 'in' })}
          >
            in
          </button>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'reset_all' })}>
          Reset
        </button>
        <div className="top-bar__export">
          <button
            type="button"
            className="btn btn-primary"
            disabled={exportBlocked}
            title={exportBlocked ? exportBlockedReason ?? '' : 'Download binary STL'}
            onClick={onExport}
          >
            Export STL
          </button>
          {exportBlocked && exportBlockedReason ? (
            <span className="top-bar__export-hint" role="status">
              {exportBlockedReason}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  )
}

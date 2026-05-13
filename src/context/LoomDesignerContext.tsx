import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { LoomDesignState } from '@/types/loom'
import { resolveBuildPlate } from '@/presets/buildPlatePresets'
import { canExportStl, validateLoom } from '@/utils/validation'
import { getInnerOpeningDiameterMm } from '@/utils/pegSpacing'
import { createInitialState, loomDesignerReducer, type LoomDesignerAction } from '@/state/loomDesignerReducer'

export interface LoomDesignerContextValue {
  state: LoomDesignState
  dispatch: (a: LoomDesignerAction) => void
  innerOpeningDiameterMm: number
  validationMessages: ReturnType<typeof validateLoom>
  buildPlate: ReturnType<typeof resolveBuildPlate>
  exportBlocked: boolean
  exportBlockedReason: string | null
}

const LoomDesignerContext = createContext<LoomDesignerContextValue | null>(null)

export function LoomDesignerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loomDesignerReducer, undefined as never, createInitialState)

  const buildPlate = useMemo(
    () =>
      resolveBuildPlate(state.buildPlatePresetId, state.customBuildPlateWidthMm, state.customBuildPlateDepthMm),
    [state.buildPlatePresetId, state.customBuildPlateWidthMm, state.customBuildPlateDepthMm],
  )

  const innerOpeningDiameterMm = useMemo(
    () => getInnerOpeningDiameterMm(state.params),
    [state.params],
  )

  const validationMessages = useMemo(
    () =>
      validateLoom(state.params, {
        buildPlatePresetId: state.buildPlatePresetId,
        customBuildPlateWidthMm: state.customBuildPlateWidthMm,
        customBuildPlateDepthMm: state.customBuildPlateDepthMm,
        enforceBuildPlateFit: state.enforceBuildPlateFit,
      }),
    [
      state.params,
      state.buildPlatePresetId,
      state.customBuildPlateWidthMm,
      state.customBuildPlateDepthMm,
      state.enforceBuildPlateFit,
    ],
  )

  const exportBlocked = useMemo(() => {
    if (!canExportStl(state.params)) {
      return { blocked: true as const, reason: 'Fix geometry errors before exporting.' }
    }
    if (state.enforceBuildPlateFit && validationMessages.some((m) => m.id === 'enforce_bed')) {
      return { blocked: true as const, reason: 'Model does not fit the selected build plate with enforcement on.' }
    }
    return { blocked: false as const, reason: null }
  }, [state.params, state.enforceBuildPlateFit, validationMessages])

  const value = useMemo<LoomDesignerContextValue>(
    () => ({
      state,
      dispatch,
      innerOpeningDiameterMm,
      validationMessages,
      buildPlate,
      exportBlocked: exportBlocked.blocked,
      exportBlockedReason: exportBlocked.reason,
    }),
    [state, innerOpeningDiameterMm, validationMessages, buildPlate, exportBlocked],
  )

  return <LoomDesignerContext.Provider value={value}>{children}</LoomDesignerContext.Provider>
}

export function useLoomDesigner(): LoomDesignerContextValue {
  const ctx = useContext(LoomDesignerContext)
  if (!ctx) throw new Error('useLoomDesigner must be used within LoomDesignerProvider')
  return ctx
}

export function useLoomDesignerDispatch(): (a: LoomDesignerAction) => void {
  return useLoomDesigner().dispatch
}

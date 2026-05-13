import { TopBar } from '@/components/TopBar'
import { LoomSetupPanel } from '@/components/LoomSetupPanel'
import { ParameterPanel } from '@/components/ParameterPanel'
import { LoomPreview } from '@/components/LoomPreview'
import { WarningPanel } from '@/components/WarningPanel'
import { ExportPanel } from '@/components/ExportPanel'
export function AppLayout() {
  return (
    <div className="app-root">
      <TopBar />
      <div className="app-body">
        <aside className="sidebar sidebar-left">
          <LoomSetupPanel />
        </aside>
        <main className="main-stage">
          <LoomPreview />
        </main>
        <aside className="sidebar sidebar-right">
          <ParameterPanel />
          <WarningPanel />
          <ExportPanel />
        </aside>
      </div>
    </div>
  )
}

import './styles/global.css'
import { LoomDesignerProvider } from '@/context/LoomDesignerContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppLayout } from '@/components/AppLayout'

export default function App() {
  return (
    <ThemeProvider>
      <LoomDesignerProvider>
        <AppLayout />
      </LoomDesignerProvider>
    </ThemeProvider>
  )
}

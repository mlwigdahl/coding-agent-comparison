import { DataProvider } from './contexts/DataContext'
import { Header } from './components/Header'
import { Timeline } from './components/Timeline'

function App() {
  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Timeline />
      </div>
    </DataProvider>
  )
}

export default App

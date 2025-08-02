import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import GymRoutine from './components/GymRoutine'
import StudyRoutine from './components/StudyRoutine'
import OfficeWork from './components/OfficeWork'

function App() {
  const [activeTab, setActiveTab] = useState('gym')

  const tabs = [
    { id: 'gym', name: '🏋️ Gym Routine', component: GymRoutine },
    { id: 'study', name: '🎓 Study Routine', component: StudyRoutine },
    { id: 'office', name: '💼 Office Work', component: OfficeWork }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 lg:p-4">
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

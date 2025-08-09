import { useState, useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import GymRoutine from './components/GymRoutine'
import StudyRoutine from './components/studyroutine/StudyRoutine'
import OfficeWork from './components/OfficeWork'

function App() {
  // Load active tab from localStorage or default to 'gym'
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab')
    return savedTab || 'gym'
  })

  const tabs = [
    { id: 'gym', name: '🏋️ Gym Routine', component: GymRoutine },
    { id: 'study', name: '🎓 Study Routine', component: StudyRoutine },
    { id: 'office', name: '💼 Office Work', component: OfficeWork }
  ]

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab)
  }, [activeTab])

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Sidebar - Fixed */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 lg:p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg dark:shadow-xl p-4 lg:p-6 border border-gray-200 dark:border-dark-border transition-all duration-300">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

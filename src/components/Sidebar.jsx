import React, { useState } from 'react'
import { 
  Dumbbell, 
  BookOpen, 
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Award
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const tabs = [
    { 
      id: 'gym', 
      name: 'Gym Routine', 
      icon: <Dumbbell className="w-5 h-5" />, 
      description: 'Track your workouts and PRs' 
    },
    { 
      id: 'study', 
      name: 'Study Routine', 
      icon: <BookOpen className="w-5 h-5" />, 
      description: 'Manage your study schedule' 
    },
    { 
      id: 'office', 
      name: 'Office Work', 
      icon: <Briefcase className="w-5 h-5" />, 
      description: 'Organize work tasks and projects' 
    }
  ]

  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeMobileSidebar = () => setIsMobileOpen(false)

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40 backdrop-blur-sm"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:scale-105"
      >
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${isOpen ? 'w-64' : 'w-20'}
        flex flex-col
      `}>
        {/* Header */}
        <div className={`p-4 flex ${isOpen ? 'justify-between' : 'justify-center'} items-center border-b border-gray-200 dark:border-gray-800`}>
          {isOpen ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Student Dashboard</h1>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => {
                    setActiveTab(tab.id)
                    closeMobileSidebar()
                  }}
                  className={`
                    w-full flex items-center rounded-lg p-3 transition-all
                    ${activeTab === tab.id 
                      ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                    ${isOpen ? 'justify-start space-x-3' : 'justify-center'}
                  `}
                >
                  <div className={`${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {tab.icon}
                  </div>
                  {isOpen && (
                    <div className="text-left">
                      <div>{tab.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {tab.description}
                      </div>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-200 dark:border-gray-800 ${isOpen ? 'flex justify-between' : 'flex justify-center'}`}>
          {isOpen ? (
            <>
              <ThemeToggle />
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                SD  
              </div>
            </>
          ) : (
            <ThemeToggle />
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
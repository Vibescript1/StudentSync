import React, { useState } from 'react'

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false)

  const tabs = [
    { id: 'gym', name: 'Gym Routine', icon: '🏋️', description: 'Track your workouts and PRs' },
    { id: 'study', name: 'Study Routine', icon: '🎓', description: 'Manage your study schedule' },
    { id: 'office', name: 'Office Work', icon: '💼', description: 'Organize work tasks and projects' }
  ]

  const closeSidebar = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-lg border border-gray-200"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 flex-shrink-0
      `}>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 flex-shrink-0">
            <div className="flex items-center justify-between lg:justify-start">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Student Dashboard
              </h1>
              {/* Close button for mobile */}
              <button
                onClick={closeSidebar}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Organize your weekly routine
            </p>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 px-6 pb-6 overflow-y-auto">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    closeSidebar()
                  }}
                  className={`w-full text-left p-4 rounded-lg font-medium transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{tab.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{tab.name}</div>
                      <div className={`text-xs mt-1 ${
                        activeTab === tab.id ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                    {activeTab === tab.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 flex-shrink-0 border-t border-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm text-gray-500">
                Stay organized and productive!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
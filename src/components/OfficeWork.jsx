import { useState, useEffect } from 'react'

const OfficeWork = () => {
  const [officeData, setOfficeData] = useState({})

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('officeWork')
    if (savedData) {
      setOfficeData(JSON.parse(savedData))
    }
  }, [])

  // Save data to localStorage whenever officeData changes
  useEffect(() => {
    localStorage.setItem('officeWork', JSON.stringify(officeData))
  }, [officeData])

  const handleTaskToggle = (day, taskIndex) => {
    setOfficeData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        tasks: prev[day]?.tasks?.map((task, index) => 
          index === taskIndex ? { ...task, completed: !task.completed } : task
        ) || []
      }
    }))
  }

  const handleTaskChange = (day, taskIndex, field, value) => {
    setOfficeData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        tasks: prev[day]?.tasks?.map((task, index) => 
          index === taskIndex ? { ...task, [field]: value } : task
        ) || []
      }
    }))
  }

  const addTask = (day) => {
    setOfficeData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        tasks: [...(prev[day]?.tasks || []), { text: '', completed: false, notes: '', status: 'pending' }]
      }
    }))
  }

  const removeTask = (day, taskIndex) => {
    setOfficeData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        tasks: prev[day]?.tasks?.filter((_, index) => index !== taskIndex) || []
      }
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
      case 'in-progress': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
      case 'blocked': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-6 transition-colors duration-300">💼 Weekly Office Work</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {days.map((day) => (
          <div key={day} className={`bg-gray-50 dark:bg-dark-hover rounded-lg p-4 transition-colors duration-300 ${day === 'Sunday' ? 'opacity-60' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text mb-4 transition-colors duration-300">
              {day}
              {day === 'Sunday' && <span className="ml-2 text-sm text-gray-500 dark:text-dark-textSecondary transition-colors duration-300">(Weekend)</span>}
            </h3>
            
            {day === 'Sunday' ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🏠</div>
                <p className="text-gray-600 dark:text-dark-textSecondary font-medium transition-colors duration-300">Weekend</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Time to recharge!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(officeData[day]?.tasks || []).map((task, taskIndex) => (
                  <div key={taskIndex} className="bg-white dark:bg-dark-card rounded-lg p-3 border border-gray-200 dark:border-dark-border transition-colors duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          onChange={() => handleTaskToggle(day, taskIndex)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className={`text-sm font-medium ${
                          task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-dark-text'
                        } transition-colors duration-300`}>
                          Work Task {taskIndex + 1}
                        </span>
                      </label>
                      <button
                        onClick={() => removeTask(day, taskIndex)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Remove Task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Work task description..."
                        value={task.text || ''}
                        onChange={(e) => handleTaskChange(day, taskIndex, 'text', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-text transition-colors duration-300"
                      />
                      
                      <select
                        value={task.status || 'pending'}
                        onChange={(e) => handleTaskChange(day, taskIndex, 'status', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors duration-300"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="in-progress">🔄 In Progress</option>
                        <option value="completed">✅ Completed</option>
                        <option value="blocked">🚫 Blocked</option>
                      </select>
                      
                      <textarea
                        placeholder="Notes, updates, or work status..."
                        value={task.notes || ''}
                        onChange={(e) => handleTaskChange(day, taskIndex, 'notes', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-text transition-colors duration-300"
                      />
                      
                      {task.status && (
                        <div className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)} transition-colors duration-300`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => addTask(day)}
                  className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 text-sm font-medium"
                >
                  + Add Work Task
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default OfficeWork 
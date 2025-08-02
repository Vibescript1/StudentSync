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
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">💼 Weekly Office Work</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {days.map((day) => (
          <div key={day} className={`bg-gray-50 rounded-lg p-4 ${day === 'Sunday' ? 'opacity-60' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {day}
              {day === 'Sunday' && <span className="ml-2 text-sm text-gray-500">(Weekend)</span>}
            </h3>
            
            {day === 'Sunday' ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🏠</div>
                <p className="text-gray-600 font-medium">Weekend</p>
                <p className="text-sm text-gray-500">Time to recharge!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(officeData[day]?.tasks || []).map((task, taskIndex) => (
                  <div key={taskIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          onChange={() => handleTaskToggle(day, taskIndex)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className={`text-sm font-medium ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-700'
                        }`}>
                          Work Task {taskIndex + 1}
                        </span>
                      </label>
                      <button
                        onClick={() => removeTask(day, taskIndex)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Work task description..."
                        value={task.text || ''}
                        onChange={(e) => handleTaskChange(day, taskIndex, 'text', e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      
                      <select
                        value={task.status || 'pending'}
                        onChange={(e) => handleTaskChange(day, taskIndex, 'status', e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                      
                      {task.status && (
                        <div className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => addTask(day)}
                  className="w-full py-2 px-3 text-sm text-purple-600 border border-purple-300 rounded-md hover:bg-purple-50 transition-colors duration-200"
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
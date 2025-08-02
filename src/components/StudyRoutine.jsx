import { useState, useEffect } from 'react'

const StudyRoutine = () => {
  const [studyData, setStudyData] = useState({})

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('studyRoutine')
    if (savedData) {
      setStudyData(JSON.parse(savedData))
    }
  }, [])

  // Save data to localStorage whenever studyData changes
  useEffect(() => {
    localStorage.setItem('studyRoutine', JSON.stringify(studyData))
  }, [studyData])

  const handleTaskToggle = (day, taskIndex) => {
    setStudyData(prev => ({
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
    setStudyData(prev => ({
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
    setStudyData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        tasks: [...(prev[day]?.tasks || []), { text: '', completed: false, goals: '' }]
      }
    }))
  }

  const removeTask = (day, taskIndex) => {
    setStudyData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        tasks: prev[day]?.tasks?.filter((_, index) => index !== taskIndex) || []
      }
    }))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-6 transition-colors duration-300">🎓 Weekly Study Routine</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {days.map((day) => (
          <div key={day} className={`bg-gray-50 dark:bg-dark-hover rounded-lg p-4 transition-colors duration-300 ${day === 'Sunday' ? 'opacity-60' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text mb-4 transition-colors duration-300">
              {day}
              {day === 'Sunday' && <span className="ml-2 text-sm text-gray-500 dark:text-dark-textSecondary transition-colors duration-300">(Rest Day)</span>}
            </h3>
            
            {day === 'Sunday' ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-gray-600 dark:text-dark-textSecondary font-medium transition-colors duration-300">Study Break</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Review and reflect!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(studyData[day]?.tasks || []).map((task, taskIndex) => (
                  <div key={taskIndex} className="bg-white dark:bg-dark-card rounded-lg p-3 border border-gray-200 dark:border-dark-border transition-colors duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          onChange={() => handleTaskToggle(day, taskIndex)}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className={`text-sm font-medium ${
                          task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-dark-text'
                        } transition-colors duration-300`}>
                          Study Task {taskIndex + 1}
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
                    
                    <input
                      type="text"
                      placeholder="What to study?"
                      value={task.text || ''}
                      onChange={(e) => handleTaskChange(day, taskIndex, 'text', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-text transition-colors duration-300 mb-2"
                    />
                    
                    <input
                      type="text"
                      placeholder="Study goals (e.g., Complete Chapter 5)"
                      value={task.goals || ''}
                      onChange={(e) => handleTaskChange(day, taskIndex, 'goals', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-text transition-colors duration-300"
                    />
                  </div>
                ))}
                
                <button
                  onClick={() => addTask(day)}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                >
                  + Add Study Task
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudyRoutine 
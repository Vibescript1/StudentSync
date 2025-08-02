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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎓 Weekly Study Routine</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {days.map((day) => (
          <div key={day} className={`bg-gray-50 rounded-lg p-4 ${day === 'Sunday' ? 'opacity-60' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {day}
              {day === 'Sunday' && <span className="ml-2 text-sm text-gray-500">(Rest Day)</span>}
            </h3>
            
            {day === 'Sunday' ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-gray-600 font-medium">Study Break</p>
                <p className="text-sm text-gray-500">Review and reflect!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(studyData[day]?.tasks || []).map((task, taskIndex) => (
                  <div key={taskIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          onChange={() => handleTaskToggle(day, taskIndex)}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className={`text-sm font-medium ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-700'
                        }`}>
                          Study Task {taskIndex + 1}
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
                        placeholder="What to study? (e.g., React Hooks, Calculus)"
                        value={task.text || ''}
                        onChange={(e) => handleTaskChange(day, taskIndex, 'text', e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      
                      <textarea
                        placeholder="Goals or topics for today..."
                        value={task.goals || ''}
                        onChange={(e) => handleTaskChange(day, taskIndex, 'goals', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => addTask(day)}
                  className="w-full py-2 px-3 text-sm text-green-600 border border-green-300 rounded-md hover:bg-green-50 transition-colors duration-200"
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
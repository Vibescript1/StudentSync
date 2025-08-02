import { useState, useEffect, useRef } from 'react'

const GymRoutine = () => {
  const [gymData, setGymData] = useState({})
  const [currentDate, setCurrentDate] = useState(new Date())
  const [expandedDays, setExpandedDays] = useState({})
  const [showMotivation, setShowMotivation] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastResetDate, setLastResetDate] = useState('')
  const [showResetNotification, setShowResetNotification] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false)
  const [isNewStreak, setIsNewStreak] = useState(false)
  const [notificationProgress, setNotificationProgress] = useState(100)
  const [editingSets, setEditingSets] = useState({})
  const [editingReps, setEditingReps] = useState({})
  const [todayDay, setTodayDay] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [isValidationShowing, setIsValidationShowing] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState({})
  const [newExerciseName, setNewExerciseName] = useState('')
  const [exerciseRoutines, setExerciseRoutines] = useState({
    'Monday': [
      { name: 'Bench Press', sets: 0, reps: '', focus: 'Chest' },
      { name: 'Incline Dumbbell Press', sets: 0, reps: '', focus: 'Upper Chest' },
      { name: 'Dumbbell Flyes', sets: 0, reps: '', focus: 'Chest Isolation' },
      { name: 'Tricep Dips', sets: 0, reps: '', focus: 'Triceps' },
      { name: 'Cardio (Running)', sets: 0, reps: '', focus: 'Endurance' }
    ],
    'Tuesday': [
      { name: 'Squat', sets: 0, reps: '', focus: 'Legs' },
      { name: 'Romanian Deadlift', sets: 0, reps: '', focus: 'Hamstrings' },
      { name: 'Leg Press', sets: 0, reps: '', focus: 'Quadriceps' },
      { name: 'Calf Raises', sets: 0, reps: '', focus: 'Calves' },
      { name: 'Cardio (Cycling)', sets: 0, reps: '', focus: 'Cardio' }
    ],
    'Wednesday': [
      { name: 'Pull-ups', sets: 0, reps: '', focus: 'Back' },
      { name: 'Barbell Rows', sets: 0, reps: '', focus: 'Upper Back' },
      { name: 'Lat Pulldowns', sets: 0, reps: '', focus: 'Lats' },
      { name: 'Bicep Curls', sets: 0, reps: '', focus: 'Biceps' },
      { name: 'Cardio (Rowing)', sets: 0, reps: '', focus: 'Full Body' }
    ],
    'Thursday': [
      { name: 'Overhead Press', sets: 0, reps: '', focus: 'Shoulders' },
      { name: 'Lateral Raises', sets: 0, reps: '', focus: 'Side Delts' },
      { name: 'Rear Delt Flyes', sets: 0, reps: '', focus: 'Rear Delts' },
      { name: 'Upright Rows', sets: 0, reps: '', focus: 'Traps' },
      { name: 'Cardio (Elliptical)', sets: 0, reps: '', focus: 'Low Impact' }
    ],
    'Friday': [
      { name: 'Deadlift', sets: 0, reps: '', focus: 'Full Body' },
      { name: 'Bent Over Rows', sets: 0, reps: '', focus: 'Back' },
      { name: 'Shrugs', sets: 0, reps: '', focus: 'Traps' },
      { name: 'Face Pulls', sets: 0, reps: '', focus: 'Rear Delts' },
      { name: 'Cardio (Stairmaster)', sets: 0, reps: '', focus: 'Legs' }
    ],
    'Saturday': [
      { name: 'Push-ups', sets: 0, reps: '', focus: 'Bodyweight' },
      { name: 'Dumbbell Lunges', sets: 0, reps: '', focus: 'Legs' },
      { name: 'Planks', sets: 0, reps: '', focus: 'Core' },
      { name: 'Burpees', sets: 0, reps: '', focus: 'Full Body' },
      { name: 'Cardio (HIIT)', sets: 0, reps: '', focus: 'High Intensity' }
    ],
    'Sunday': []
  })

  // Streak-related state
  const [isAnimating, setIsAnimating] = useState(false)
  const [streakLoaded, setStreakLoaded] = useState(false)
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    totalStreaks: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    streakHistory: []
  })
  
  // Use ref to access current streakData in functions
  const streakDataRef = useRef(streakData)
  streakDataRef.current = streakData

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  // Motivational messages based on day
  const motivationalMessages = {
    'Monday': {
      title: "💪 Monday Motivation!",
      message: "Start your week strong! Today is chest day - let's build those gains!",
      emoji: "🏋️"
    },
    'Tuesday': {
      title: "🦵 Tuesday Power!",
      message: "Leg day is here! Strong legs, strong foundation. Push through!",
      emoji: "💪"
    },
    'Wednesday': {
      title: "💪 Wednesday Warriors!",
      message: "Back day! Pull your way to greatness. You've got this!",
      emoji: "🔥"
    },
    'Thursday': {
      title: "💪 Thursday Thrive!",
      message: "Shoulder day! Build those boulders and stand tall!",
      emoji: "⚡"
    },
    'Friday': {
      title: "💪 Friday Force!",
      message: "Full body day! End your week with power and strength!",
      emoji: "🚀"
    },
    'Saturday': {
      title: "💪 Saturday Strength!",
      message: "Bodyweight and core day! Functional fitness for life!",
      emoji: "🎯"
    },
    'Sunday': {
      title: "😴 Sunday Rest & Recovery",
      message: "Your body deserves this rest day. Recharge and prepare for another amazing week!",
      emoji: "🧘"
    }
  }
  


  // Get today's information
  const today = new Date()
  const todayDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Get other days (excluding today)
  const getOtherDays = () => {
    return days.filter(day => day !== todayDay)
  }

  const toggleDayExpansion = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }))
  }

  const closeMotivation = () => {
    setShowMotivation(false)
  }



  // Function to reset exercise checkboxes for a new day
  const resetExerciseCheckboxes = (data) => {
    const resetData = {}
    
    Object.keys(data).forEach(day => {
      if (data[day] && data[day].exercises) {
        resetData[day] = {
          ...data[day],
          exercises: {}
        }
        
        // Preserve PR data, custom sets, and reps but reset completed status
        Object.keys(data[day].exercises).forEach(exercise => {
          resetData[day].exercises[exercise] = {
            completed: false,
            pr: data[day].exercises[exercise].pr || '',
            customSets: data[day].exercises[exercise].customSets || null,
            customReps: data[day].exercises[exercise].customReps || null
          }
        })
      }
    })
    
    return resetData
  }

  // Check if we need to reset checkboxes for a new week (Monday)
  const checkAndResetForNewWeek = (data) => {
    const today = new Date()
    const todayString = today.toDateString()
    const currentDayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Check if we need to reset (it's Monday and we haven't reset this week)
    if (lastResetDate) {
      const lastReset = new Date(lastResetDate)
      
      // Reset if it's Monday (day 1) and the last reset wasn't this Monday
      if (currentDayOfWeek === 1) { // Monday
        const thisMonday = new Date(today)
        thisMonday.setDate(today.getDate() - today.getDay() + 1) // Get this Monday
        const lastResetMonday = new Date(lastReset)
        lastResetMonday.setDate(lastReset.getDate() - lastReset.getDay() + 1) // Get last reset's Monday
        
        if (thisMonday.getTime() !== lastResetMonday.getTime()) {
          const resetData = resetExerciseCheckboxes(data)
          setLastResetDate(todayString)
          
          setResetMessage('Weekly Reset Complete! All exercise checkboxes have been reset for the new week.')
          
          setShowResetNotification(true)
          setTimeout(() => setShowResetNotification(false), 5000)
          
          return resetData
        }
      }
    }
    
    return data
  }

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('gymRoutine')
      const savedResetDate = localStorage.getItem('gymRoutineLastWeeklyReset')
      const savedExerciseRoutines = localStorage.getItem('exerciseRoutines')
      
      if (savedResetDate) {
        setLastResetDate(savedResetDate)
      } else {
        // First time loading, set today as reset date
        const today = new Date().toDateString()
        setLastResetDate(today)
        localStorage.setItem('gymRoutineLastWeeklyReset', today)
      }
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        const processedData = checkAndResetForNewWeek(parsedData)
        setGymData(processedData)
      }
      
      if (savedExerciseRoutines) {
        const parsedExerciseRoutines = JSON.parse(savedExerciseRoutines)
        setExerciseRoutines(parsedExerciseRoutines)
      }
    } catch (error) {
      console.error('Error loading gym data from localStorage:', error)
    }
  }, [])

  // Save data to localStorage whenever gymData changes
  useEffect(() => {
    if (Object.keys(gymData).length > 0) {
      try {
        setIsSaving(true)
        localStorage.setItem('gymRoutine', JSON.stringify(gymData))
        localStorage.setItem('gymRoutineLastWeeklyReset', lastResetDate)
        
        // Show saved indicator briefly
        setTimeout(() => setIsSaving(false), 1000)
      } catch (error) {
        setIsSaving(false)
      }
    }
  }, [gymData, lastResetDate])

  // Save exerciseRoutines to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('exerciseRoutines', JSON.stringify(exerciseRoutines))
    } catch (error) {
      console.error('Error saving exercise routines to localStorage:', error)
    }
  }, [exerciseRoutines])

  // Set today's day
  useEffect(() => {
    const today = new Date()
    const currentTodayDay = days[today.getDay()]
    setTodayDay(currentTodayDay)
  }, [])

  // Load streak data from localStorage on component mount
  useEffect(() => {
    try {
      const savedStreakData = localStorage.getItem('exerciseStreak')
      
      if (savedStreakData) {
        const parsedStreakData = JSON.parse(savedStreakData)
        
        // Validate that it has the required structure
        if (parsedStreakData && 
            typeof parsedStreakData.currentStreak === 'number' &&
            typeof parsedStreakData.totalStreaks === 'number' &&
            typeof parsedStreakData.longestStreak === 'number' &&
            Array.isArray(parsedStreakData.streakHistory)) {
          setStreakData(parsedStreakData)
        } else {
          // Reset to 0 if invalid data structure
          resetStreakData()
        }
      } else {
        // First time - start at 0
        resetStreakData()
      }
      
      // Mark as loaded after initialization
      setStreakLoaded(true)
    } catch (error) {
      resetStreakData()
      setStreakLoaded(true)
    }
  }, [])

  // Save streak data to localStorage whenever it changes
  useEffect(() => {
    // Only save if component has finished loading and we have valid data
    if (streakLoaded && streakData.currentStreak >= 0) {
      localStorage.setItem('exerciseStreak', JSON.stringify(streakData))
    }
  }, [streakData, streakLoaded])

  // Animate streak when it changes
  useEffect(() => {
    if (streakData.currentStreak > 0) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }, [streakData.currentStreak])

  // Check if all exercises are completed for today when streak is loaded
  useEffect(() => {
    if (streakLoaded && todayDay && gymData[todayDay]) {
      const exercises = exerciseRoutines[todayDay] || []
      const allCompleted = exercises.every(ex => 
        gymData[todayDay]?.exercises?.[ex.name]?.completed
      )
      
      if (allCompleted && exercises.length > 0) {
        incrementStreak()
      }
    }
  }, [streakLoaded, todayDay, gymData])

  // Check if all exercises for a day are completed
  const checkDayCompletion = (day) => {
    const exercises = exerciseRoutines[day] || []
    if (exercises.length === 0) return false
    
    return exercises.every(exercise => 
      gymData[day]?.exercises?.[exercise.name]?.completed
    )
  }

  // Streak functions
  const resetStreakData = () => {
    const resetData = {
      currentStreak: 0,
      totalStreaks: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      streakHistory: []
    }
    setStreakData(resetData)
  }

  const incrementStreak = () => {
    const today = new Date().toDateString()
    const currentStreakData = streakDataRef.current
    
    // Check if already completed today
    if (currentStreakData.lastCompletedDate === today) {
      return false // Already completed today
    }

    // Check if user missed a day (streak should reset)
    if (currentStreakData.lastCompletedDate) {
      const lastCompleted = new Date(currentStreakData.lastCompletedDate)
      const todayDate = new Date(today)
      const daysDiff = Math.floor((todayDate - lastCompleted) / (1000 * 60 * 60 * 24))
      
      // If more than 1 day has passed, reset streak
      if (daysDiff > 1) {
        const updatedStreakData = {
          ...currentStreakData,
          currentStreak: 1, // Start new streak at 1
          totalStreaks: currentStreakData.totalStreaks + 1,
          longestStreak: Math.max(1, currentStreakData.longestStreak),
          lastCompletedDate: today,
          streakHistory: [
            ...currentStreakData.streakHistory,
            {
              date: today,
              streak: 1,
              type: 'missed_day_reset'
            }
          ]
        }
        
        setStreakData(updatedStreakData)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 1000)
        
        return true // New streak started after missing days
      }
    }

    const newCurrentStreak = currentStreakData.currentStreak + 1
    const newLongestStreak = Math.max(newCurrentStreak, currentStreakData.longestStreak)
    
    const updatedStreakData = {
      ...currentStreakData,
      currentStreak: newCurrentStreak,
      totalStreaks: currentStreakData.totalStreaks + 1,
      longestStreak: newLongestStreak,
      lastCompletedDate: today,
      streakHistory: [
        ...currentStreakData.streakHistory,
        {
          date: today,
          streak: newCurrentStreak,
          type: 'completed'
        }
      ]
    }
    
    setStreakData(updatedStreakData)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 1000)
    
    return true // New streak achieved
  }

  const decrementStreak = () => {
    const today = new Date().toDateString()
    const currentStreakData = streakDataRef.current
    
    // Only decrement if streak was achieved today
    if (currentStreakData.lastCompletedDate === today && currentStreakData.currentStreak > 0) {
      const newCurrentStreak = Math.max(0, currentStreakData.currentStreak - 1)
      
      const updatedStreakData = {
        ...currentStreakData,
        currentStreak: newCurrentStreak,
        totalStreaks: Math.max(0, currentStreakData.totalStreaks - 1),
        lastCompletedDate: null, // Reset lastCompletedDate when decrementing
        streakHistory: currentStreakData.streakHistory.slice(0, -1) // Remove last entry
      }
      
      setStreakData(updatedStreakData)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
      
      return true // Streak decremented
    }
    
    return false // No streak to decrement
  }

  const getStreakEmoji = (streak) => {
    if (streak === 0) return '😴'
    if (streak < 3) return '🔥'
    if (streak < 7) return '⚡'
    if (streak < 14) return '💪'
    if (streak < 30) return '🏆'
    return '👑'
  }

  const toggleAddExercise = (day) => {
    setShowAddExercise(prev => ({
      ...prev,
      [day]: !prev[day]
    }))
    if (!showAddExercise[day]) {
      setNewExerciseName('')
    }
  }

  const addExercise = (day) => {
    if (!newExerciseName.trim()) {
      return
    }

    const newExercise = {
      name: newExerciseName.trim(),
      sets: 0,
      reps: '',
      focus: 'Custom'
    }

    setGymData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        exercises: {
          ...prev[day]?.exercises,
          [newExercise.name]: {
            completed: false,
            pr: '',
            customSets: null,
            customReps: null
          }
        }
      }
    }))

    // Update exerciseRoutines for this day
    setExerciseRoutines(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), newExercise]
    }))

    setNewExerciseName('')
    setShowAddExercise(prev => ({
      ...prev,
      [day]: false
    }))
  }

  const deleteExercise = (day, exerciseName) => {
    setGymData(prev => {
      const newData = { ...prev }
      if (newData[day]?.exercises) {
        delete newData[day].exercises[exerciseName]
      }
      return newData
    })

    // Remove from exerciseRoutines
    setExerciseRoutines(prev => ({
      ...prev,
      [day]: prev[day]?.filter(ex => ex.name !== exerciseName) || []
    }))
  }

    const handleExerciseToggle = (day, exercise) => {
    // Check if trying to complete the exercise
    const currentExerciseData = gymData[day]?.exercises?.[exercise]
    const wasCompleted = currentExerciseData?.completed || false
    const willBeCompleted = !wasCompleted
    
    // If trying to check the box, validate required fields
    if (willBeCompleted) {
      const sets = getExerciseSets(day, exercise)
      const reps = getExerciseReps(day, exercise)
      const pr = currentExerciseData?.pr || ''
      
      // Check if all required fields are filled
      if (!sets || sets === 0 || !reps || reps.trim() === '' || !pr || pr.trim() === '') {
        // Prevent multiple validation notifications
        if (isValidationShowing) {
          return // Don't show another validation notification if one is already showing
        }
        
        // Show validation notification
        setIsValidationShowing(true)
        setShowCompletionAnimation(true)
        setIsNewStreak(false)
        setValidationMessage('Please fill in Sets, Reps, and PR before completing exercise')
        setNotificationProgress(100)
        
        // Start progress bar countdown for validation message
        const startTime = Date.now()
        const duration = 2000 // 2 seconds
        
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
          setNotificationProgress(remaining)
          
          if (remaining <= 0) {
            clearInterval(progressInterval)
            setShowCompletionAnimation(false)
            setValidationMessage('')
            setIsValidationShowing(false)
          }
        }, 30)
        
        return // Don't proceed with checking the box
      }
    }
    
    setGymData(prev => {
      const newData = {
        ...prev,
        [day]: {
          ...prev[day],
          exercises: {
            ...prev[day]?.exercises,
            [exercise]: {
              ...prev[day]?.exercises?.[exercise],
              completed: willBeCompleted
            }
          }
        }
      }
      
      // Check if all exercises for this day are now completed
      const exercises = exerciseRoutines[day] || []
      const allCompleted = exercises.every(ex => 
        newData[day]?.exercises?.[ex.name]?.completed
      )
      
      if (day === todayDay && streakLoaded && todayDay) {
        // Check if this action caused all exercises to become completed
        if (allCompleted && willBeCompleted) {
          // Check if this was the exercise that completed all exercises
          const wasAllCompletedBefore = exercises.every(ex => {
            if (ex.name === exercise) {
              return wasCompleted // This exercise was completed before
            }
            return prev[day]?.exercises?.[ex.name]?.completed || false
          })
          
          if (!wasAllCompletedBefore) {
            // This check caused all exercises to become completed - increment streak
            const isNewStreakAchieved = incrementStreak()
            
            if (isNewStreakAchieved) {
              setShowCompletionAnimation(true)
              setIsNewStreak(true)
              setValidationMessage('')
              setIsValidationShowing(false)
              setNotificationProgress(100)
              
              // Start progress bar countdown
              const startTime = Date.now()
              const duration = 3000 // 3 seconds
              
              const progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime
                const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
                setNotificationProgress(remaining)
                
                if (remaining <= 0) {
                  clearInterval(progressInterval)
                  setShowCompletionAnimation(false)
                  setIsNewStreak(false)
                }
              }, 50) // Update every 50ms for smooth animation
            } else {
              // Show completion notification without incrementing streak
              setShowCompletionAnimation(true)
              setIsNewStreak(false)
              setValidationMessage('')
              setIsValidationShowing(false)
              setNotificationProgress(100)
              
              // Start progress bar countdown
              const startTime = Date.now()
              const duration = 3000 // 3 seconds
              
              const progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime
                const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
                setNotificationProgress(remaining)
                
                if (remaining <= 0) {
                  clearInterval(progressInterval)
                  setShowCompletionAnimation(false)
                  setIsNewStreak(false)
                }
              }, 50) // Update every 50ms for smooth animation
            }
          }
        } else if (!allCompleted && wasCompleted) {
          // Exercise was unchecked - check if this breaks the "all completed" status
          
          // Check if all exercises were completed before this uncheck
          const wasAllCompleted = exercises.every(ex => {
            if (ex.name === exercise) {
              return wasCompleted // This exercise was completed before
            }
            return prev[day]?.exercises?.[ex.name]?.completed || false
          })
          
          if (wasAllCompleted) {
            // This uncheck broke the "all completed" status - decrement streak
            decrementStreak()
          }
        }
      }
      
      return newData
    })
  }

  const handlePRChange = (day, exercise, value) => {
    setGymData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        exercises: {
          ...prev[day]?.exercises,
          [exercise]: {
            ...prev[day]?.exercises?.[exercise],
            pr: value
          }
        }
      }
    }))
  }

  const handleSetsChange = (day, exercise, value) => {
    setGymData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        exercises: {
          ...prev[day]?.exercises,
          [exercise]: {
            ...prev[day]?.exercises?.[exercise],
            customSets: parseInt(value) || 0
          }
        }
      }
    }))
  }

  const handleRepsChange = (day, exercise, value) => {
    setGymData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        exercises: {
          ...prev[day]?.exercises,
          [exercise]: {
            ...prev[day]?.exercises?.[exercise],
            customReps: value
          }
        }
      }
    }))
  }

  const toggleSetsEditing = (day, exercise) => {
    setEditingSets(prev => ({
      ...prev,
      [`${day}-${exercise}`]: !prev[`${day}-${exercise}`]
    }))
  }

  const toggleRepsEditing = (day, exercise) => {
    setEditingReps(prev => ({
      ...prev,
      [`${day}-${exercise}`]: !prev[`${day}-${exercise}`]
    }))
  }

  const getExerciseSets = (day, exercise) => {
    const customSets = gymData[day]?.exercises?.[exercise]?.customSets
    const defaultSets = exerciseRoutines[day]?.find(ex => ex.name === exercise)?.sets || 0
    return customSets !== null && customSets !== undefined ? customSets : (defaultSets || '')
  }

  const getExerciseReps = (day, exercise) => {
    const customReps = gymData[day]?.exercises?.[exercise]?.customReps
    const defaultReps = exerciseRoutines[day]?.find(ex => ex.name === exercise)?.reps || ''
    return customReps !== null && customReps !== undefined ? customReps : (defaultReps || '')
  }

  const otherDays = getOtherDays()
  const todayMotivation = todayDay ? motivationalMessages[todayDay] : null

  return (
    <div>
      {/* Save Indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          💾 Saving...
        </div>
      )}

      {/* Motivational Popup */}
      {showMotivation && todayMotivation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-5xl mb-3 animate-bounce">{todayMotivation.emoji}</div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">{todayMotivation.title}</h2>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{todayMotivation.message}</p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Today's Date</p>
                <p className="text-sm font-semibold text-blue-800">{todayDate}</p>
              </div>
              <button
                onClick={closeMotivation}
                className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-full font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Let's Go!</span>
                  <span className="group-hover:animate-bounce">💪</span>
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-full transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Notification */}
      {showResetNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {resetMessage}
        </div>
      )}

      {/* Completion Notification */}
      {showCompletionAnimation && (
        <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-out">
          <div className={`bg-white rounded-lg shadow-lg border p-3 max-w-xs relative overflow-hidden transform transition-all duration-300 ${
            validationMessage ? 'border-orange-200' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  validationMessage ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  <span className={`text-sm ${validationMessage ? 'text-orange-600' : 'text-green-600'}`}>
                    {validationMessage ? '⚠️' : '✓'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900">
                  {validationMessage ? 'Required' : (isNewStreak ? 'New Streak!' : 'Complete!')}
                </p>
                <p className="text-xs text-gray-500">
                  {validationMessage 
                    ? 'Fill Sets, Reps & PR'
                    : (isNewStreak 
                        ? 'Streak achieved! 🔥'
                        : `${todayDay} done! 💪`
                      )
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCompletionAnimation(false)
                  setValidationMessage('')
                  setIsValidationShowing(false)
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Progress Bar - Bottom */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-100">
              <div 
                className={`h-full transition-all duration-100 ease-linear ${
                  validationMessage ? 'bg-orange-400' : 'bg-blue-500'
                }`}
                style={{ width: `${notificationProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800">🏋️ Weekly Gym Routine</h2>
                      <div className="hidden md:block">
              <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 border ${
                streakLoaded 
                  ? 'bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 border-orange-200' 
                  : 'bg-gray-100 border-gray-200'
              }`}>
                <div className={`text-xl transition-all duration-500 ${isAnimating ? 'scale-125 animate-bounce' : ''}`}>
                  {streakLoaded ? getStreakEmoji(streakData.currentStreak) : '⏳'}
                </div>
                <span className="font-bold text-gray-800">
                  {streakLoaded ? streakData.currentStreak : '...'}
                </span>
                <span className="text-sm text-gray-600">
                  {streakLoaded ? (streakData.currentStreak === 1 ? 'day' : 'days') : 'loading'}
                </span>
              </div>
            </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="hidden md:block">
              <p className="text-sm text-blue-600 font-medium">Today's Date</p>
              <p className="text-lg font-semibold text-blue-800">{todayDate}</p>
            </div>
            <div className="flex items-center justify-between md:justify-end md:space-x-0 md:text-right">
              <div className="md:hidden">
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 border ${
                  streakLoaded 
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 border-orange-200' 
                    : 'bg-gray-100 border-gray-200'
                }`}>
                  <div className={`text-xl transition-all duration-500 ${isAnimating ? 'scale-125 animate-bounce' : ''}`}>
                    {streakLoaded ? getStreakEmoji(streakData.currentStreak) : '⏳'}
                  </div>
                  <span className="font-bold text-gray-800">
                    {streakLoaded ? streakData.currentStreak : '...'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {streakLoaded ? (streakData.currentStreak === 1 ? 'day' : 'days') : 'loading'}
                  </span>
                </div>
              </div>
              <div className="text-right ml-36 md:ml-0">
              <p className="text-sm text-blue-600 font-medium">Today's Focus</p>
              <p className="text-lg font-semibold text-blue-800">{todayDay}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Today's Routine - Prominently Displayed */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">⭐</span>
          {checkDayCompletion(todayDay) ? (
            <span className="text-green-600">✅ Completed Workout - {todayDay}</span>
          ) : (
            `Today's Workout - ${todayDay}`
          )}
        </h3>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          {/* Progress Indicator */}
          {todayDay !== 'Sunday' && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-blue-600 mb-1">
                <span>Today's Progress</span>
                <span>
                  {exerciseRoutines[todayDay]?.filter(ex => 
                    gymData[todayDay]?.exercises?.[ex.name]?.completed
                  ).length || 0} / {exerciseRoutines[todayDay]?.length || 0}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${exerciseRoutines[todayDay]?.length ? 
                      ((exerciseRoutines[todayDay]?.filter(ex => 
                        gymData[todayDay]?.exercises?.[ex.name]?.completed
                      ).length || 0) / exerciseRoutines[todayDay]?.length) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {todayDay === 'Sunday' ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">😴</div>
              <p className="text-gray-600 font-medium text-lg">Rest Day</p>
              <p className="text-sm text-gray-500">Recovery is important!</p>
            </div>
          ) : (
            <>
              {/* Add Exercise Button */}
              <div className="mb-4">
                <button
                  onClick={() => toggleAddExercise(todayDay)}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  <span>+</span>
                  <span>Add Exercise</span>
                </button>
              </div>

              {/* Add Exercise Form */}
              {showAddExercise[todayDay] && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Exercise Name (e.g., Bench Press)"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addExercise(todayDay)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add Exercise
                    </button>
                    <button
                      onClick={() => toggleAddExercise(todayDay)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exerciseRoutines[todayDay]?.map((exercise) => (
                <div key={exercise.name} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm relative">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gymData[todayDay]?.exercises?.[exercise.name]?.completed || false}
                        onChange={() => handleExerciseToggle(todayDay, exercise.name)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className={`font-semibold ${
                        gymData[todayDay]?.exercises?.[exercise.name]?.completed ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}>
                        {exercise.name}
                      </span>
                    </label>
                    <button
                      onClick={() => deleteExercise(todayDay, exercise.name)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Delete Exercise"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <span className="text-xs text-gray-600 block mb-1">Sets:</span>
                        {editingSets[`${todayDay}-${exercise.name}`] ? (
                                                     <input
                             type="number"
                             min="1"
                             value={getExerciseSets(todayDay, exercise.name) || ''}
                             onChange={(e) => handleSetsChange(todayDay, exercise.name, e.target.value)}
                             onBlur={() => toggleSetsEditing(todayDay, exercise.name)}
                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                             placeholder="Enter sets"
                             autoFocus
                           />
                        ) : (
                                                     <div 
                             onClick={() => toggleSetsEditing(todayDay, exercise.name)}
                             className="bg-gray-100 px-2 py-1 rounded text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                           >
                             {getExerciseSets(todayDay, exercise.name) || 'Click to add'}
                           </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-gray-600 block mb-1">Reps:</span>
                        {editingReps[`${todayDay}-${exercise.name}`] ? (
                                                     <input
                             type="text"
                             value={getExerciseReps(todayDay, exercise.name) || ''}
                             onChange={(e) => handleRepsChange(todayDay, exercise.name, e.target.value)}
                             onBlur={() => toggleRepsEditing(todayDay, exercise.name)}
                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                             placeholder="Enter reps"
                             autoFocus
                           />
                        ) : (
                                                     <div 
                             onClick={() => toggleRepsEditing(todayDay, exercise.name)}
                             className="bg-gray-100 px-2 py-1 rounded text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                           >
                             {getExerciseReps(todayDay, exercise.name) || 'Click to add'}
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Personal Record (e.g., 225 lbs)"
                    value={gymData[todayDay]?.exercises?.[exercise.name]?.pr || ''}
                    onChange={(e) => handlePRChange(todayDay, exercise.name, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </div>



      {/* Other Days - Collapsible */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📅 Other Days</h3>
        <div className="space-y-4">
          {otherDays.map((day) => {
            const exercises = exerciseRoutines[day] || []
            const isExpanded = expandedDays[day] || false
            
            return (
              <div key={day} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleDayExpansion(day)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-700">{day}</span>
                    {day === 'Sunday' && <span className="text-sm text-gray-500">(Rest Day)</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
                    </span>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4">
                    {day === 'Sunday' ? (
                      <div className="text-center py-6">
                        <div className="text-3xl mb-2">😴</div>
                        <p className="text-gray-600 font-medium">Rest Day</p>
                        <p className="text-sm text-gray-500">Recovery is important!</p>
                      </div>
                    ) : (
                      <>
                        {/* Add Exercise Button for Other Days */}
                        <div className="mb-3">
                          <button
                            onClick={() => toggleAddExercise(day)}
                            className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm"
                          >
                            <span>+</span>
                            <span>Add Exercise</span>
                          </button>
                        </div>

                        {/* Add Exercise Form for Other Days */}
                        {showAddExercise[day] && (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="mb-2">
                              <input
                                type="text"
                                placeholder="Exercise Name"
                                value={newExerciseName}
                                onChange={(e) => setNewExerciseName(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => addExercise(day)}
                                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => toggleAddExercise(day)}
                                className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {exercises.map((exercise) => (
                          <div key={exercise.name} className="bg-white rounded-lg p-3 border border-gray-200 relative">
                            <div className="flex items-center justify-between mb-2">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={gymData[day]?.exercises?.[exercise.name]?.completed || false}
                                  onChange={() => handleExerciseToggle(day, exercise.name)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className={`text-sm font-medium ${
                                  gymData[day]?.exercises?.[exercise.name]?.completed ? 'line-through text-gray-500' : 'text-gray-700'
                                }`}>
                                  {exercise.name}
                                </span>
                              </label>
                              <button
                                onClick={() => deleteExercise(day, exercise.name)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                title="Delete Exercise"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="mb-2">
                              <div className="flex space-x-1">
                                <div className="flex-1">
                                  <span className="text-xs text-gray-500 block mb-1">Sets:</span>
                                  {editingSets[`${day}-${exercise.name}`] ? (
                                                                         <input
                                       type="number"
                                       min="1"
                                       value={getExerciseSets(day, exercise.name) || ''}
                                       onChange={(e) => handleSetsChange(day, exercise.name, e.target.value)}
                                       onBlur={() => toggleSetsEditing(day, exercise.name)}
                                       className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                       placeholder="Sets"
                                       autoFocus
                                     />
                                  ) : (
                                                                         <div 
                                       onClick={() => toggleSetsEditing(day, exercise.name)}
                                       className="bg-gray-100 px-1 py-1 rounded text-xs cursor-pointer hover:bg-gray-200 transition-colors"
                                     >
                                       {getExerciseSets(day, exercise.name) || 'Click to add'}
                                     </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <span className="text-xs text-gray-500 block mb-1">Reps:</span>
                                  {editingReps[`${day}-${exercise.name}`] ? (
                                                                         <input
                                       type="text"
                                       value={getExerciseReps(day, exercise.name) || ''}
                                       onChange={(e) => handleRepsChange(day, exercise.name, e.target.value)}
                                       onBlur={() => toggleRepsEditing(day, exercise.name)}
                                       className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                       placeholder="Reps"
                                       autoFocus
                                     />
                                  ) : (
                                                                         <div 
                                       onClick={() => toggleRepsEditing(day, exercise.name)}
                                       className="bg-gray-100 px-1 py-1 rounded text-xs cursor-pointer hover:bg-gray-200 transition-colors"
                                     >
                                       {getExerciseReps(day, exercise.name) || 'Click to add'}
                                     </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <input
                              type="text"
                              placeholder="Personal Record"
                              value={gymData[day]?.exercises?.[exercise.name]?.pr || ''}
                              onChange={(e) => handlePRChange(day, exercise.name, e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GymRoutine 
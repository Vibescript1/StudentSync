import { useState, useEffect } from 'react'
import { useStreakLogic } from './useStreakLogic'

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
  const [duplicateExerciseMessage, setDuplicateExerciseMessage] = useState('')
  const [isDuplicateShowing, setIsDuplicateShowing] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState({})
  const [newExerciseName, setNewExerciseName] = useState('')
  const [exerciseRoutines, setExerciseRoutines] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  // Use the streak logic custom hook
  const {
    streakData,
    isAnimating,
    streakLoaded,
    incrementStreak,
    decrementStreak,
    getStreakEmoji,
    addSundayBonus
  } = useStreakLogic()



  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  

  


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
      
      if (savedExerciseRoutines) {
        const parsedExerciseRoutines = JSON.parse(savedExerciseRoutines)
        setExerciseRoutines(parsedExerciseRoutines)
      } else {
        // Set default exercises if no saved data exists
        const defaultExercises = {
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
        }
        setExerciseRoutines(defaultExercises)
        // Save default exercises to localStorage
        localStorage.setItem('exerciseRoutines', JSON.stringify(defaultExercises))
      }
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        const processedData = checkAndResetForNewWeek(parsedData)
        setGymData(processedData)
      }
    } catch (error) {
      console.error('Error loading gym data from localStorage:', error)
    } finally {
      setIsLoading(false)
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
    if (Object.keys(exerciseRoutines).length > 0) {
      try {
        localStorage.setItem('exerciseRoutines', JSON.stringify(exerciseRoutines))
      } catch (error) {
        console.error('Error saving exercise routines to localStorage:', error)
      }
    }
  }, [exerciseRoutines])

  // Initialize missing exercises in gymData when exerciseRoutines change
  useEffect(() => {
    if (Object.keys(exerciseRoutines).length > 0) {
      setGymData(prev => {
        const updatedData = { ...prev }
        
        Object.keys(exerciseRoutines).forEach(day => {
          if (exerciseRoutines[day]) {
            exerciseRoutines[day].forEach(exercise => {
              if (!updatedData[day]) {
                updatedData[day] = { exercises: {} }
              }
              if (!updatedData[day].exercises) {
                updatedData[day].exercises = {}
              }
              if (!updatedData[day].exercises[exercise.name]) {
                updatedData[day].exercises[exercise.name] = {
                  completed: false,
                  pr: '',
                  customSets: null,
                  customReps: null
                }
              }
            })
          }
        })
        
        return updatedData
      })
    }
  }, [exerciseRoutines])

  // Set today's day and handle Sunday streak bonus
  useEffect(() => {
    const today = new Date()
    const currentTodayDay = days[today.getDay()]
    setTodayDay(currentTodayDay)
    
    // Handle Sunday bonus using the custom hook
    addSundayBonus(currentTodayDay, setShowCompletionAnimation, setIsNewStreak, setValidationMessage, setIsValidationShowing, setNotificationProgress)
  }, [streakLoaded])

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
  }, [streakLoaded, todayDay, gymData, exerciseRoutines, incrementStreak])

  // Check if all exercises for a day are completed
  const checkDayCompletion = (day) => {
    const exercises = exerciseRoutines[day] || []
    if (exercises.length === 0) return false
    
    return exercises.every(exercise => 
      gymData[day]?.exercises?.[exercise.name]?.completed
    )
  }

  // Streak functions


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

    const exerciseName = newExerciseName.trim()
    
    // Check if exercise already exists for this day
    const existingExercises = exerciseRoutines[day] || []
    const exerciseExists = existingExercises.some(exercise => 
      exercise.name.toLowerCase() === exerciseName.toLowerCase()
    )
    
    if (exerciseExists) {
      // Show duplicate exercise error notification
      setIsDuplicateShowing(true)
      setShowCompletionAnimation(true)
      setIsNewStreak(false)
      setDuplicateExerciseMessage('Exercise already exists for this day')
      setNotificationProgress(100)
      
      // Start progress bar countdown for error message
      const startTime = Date.now()
      const duration = 3000 // 3 seconds
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
        setNotificationProgress(remaining)
        
        if (remaining <= 0) {
          clearInterval(progressInterval)
          setShowCompletionAnimation(false)
          setDuplicateExerciseMessage('')
          setIsDuplicateShowing(false)
        }
      }, 30)
      
      return // Don't add duplicate exercise
    }

    const newExercise = {
      name: exerciseName,
      sets: 0,
      reps: '',
      focus: 'Custom'
    }

    // Update exerciseRoutines for this day FIRST
    setExerciseRoutines(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), newExercise]
    }))

    // Then update gymData with the new exercise
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
            pr: value,
            completed: false // Uncheck when editing PR
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
            customSets: parseInt(value) || 0,
            completed: false // Uncheck when editing sets
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
            customReps: value,
            completed: false // Uncheck when editing reps
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
    
    // Uncheck the exercise when entering edit mode
    if (!editingSets[`${day}-${exercise}`]) {
      setGymData(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          exercises: {
            ...prev[day]?.exercises,
            [exercise]: {
              ...prev[day]?.exercises?.[exercise],
              completed: false
            }
          }
        }
      }))
    }
  }

  const toggleRepsEditing = (day, exercise) => {
    setEditingReps(prev => ({
      ...prev,
      [`${day}-${exercise}`]: !prev[`${day}-${exercise}`]
    }))
    
    // Uncheck the exercise when entering edit mode
    if (!editingReps[`${day}-${exercise}`]) {
      setGymData(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          exercises: {
            ...prev[day]?.exercises,
            [exercise]: {
              ...prev[day]?.exercises?.[exercise],
              completed: false
            }
          }
        }
      }))
    }
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

  const closeMotivation = () => {
    setShowMotivation(false)
  }

  return (
    <>
      {/* Save Indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          💾 Saving...
        </div>
      )}



      {/* Welcome Popup */}
      {showMotivation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-2xl transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-3xl sm:text-5xl mb-2 sm:mb-3 animate-bounce">🏋️</div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-dark-text mb-2 sm:mb-3 transition-colors duration-300">Welcome to Your Gym Routine</h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 border border-blue-100 dark:border-blue-800/30 transition-colors duration-300">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium transition-colors duration-300">Today's Date</p>
                <p className="text-xs sm:text-sm font-semibold text-blue-800 dark:text-blue-300 transition-colors duration-300">{todayDate}</p>
              </div>
              <button
                onClick={closeMotivation}
                className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                <span className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <span>Get Started</span>
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
          <div className={`bg-white dark:bg-dark-card rounded-lg shadow-lg border p-3 max-w-xs relative overflow-hidden transform transition-all duration-300 ${
            validationMessage || duplicateExerciseMessage ? 'border-orange-200 dark:border-orange-600' : 'border-gray-200 dark:border-dark-border'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  validationMessage || duplicateExerciseMessage ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  <span className={`text-sm ${validationMessage || duplicateExerciseMessage ? 'text-orange-600' : 'text-green-600'}`}>
                    {validationMessage || duplicateExerciseMessage ? '⚠️' : '✓'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-dark-text transition-colors duration-300">
                  {validationMessage ? 'Required' : duplicateExerciseMessage ? 'Duplicate' : (isNewStreak && todayDay === 'Sunday' ? 'Sunday Bonus!' : isNewStreak ? 'New Streak!' : 'Complete!')}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-textSecondary transition-colors duration-300">
                  {validationMessage 
                    ? 'Fill Sets, Reps & PR'
                    : duplicateExerciseMessage
                    ? 'Exercise already exists'
                    : (isNewStreak && todayDay === 'Sunday'
                        ? 'Sunday bonus! +1 streak 🎉'
                        : isNewStreak
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
                  setDuplicateExerciseMessage('')
                  setIsDuplicateShowing(false)
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
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
                  validationMessage || duplicateExerciseMessage ? 'bg-orange-400' : 'bg-blue-500'
                }`}
                style={{ width: `${notificationProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text transition-colors duration-300">🏋️ Weekly Gym Routine</h2>
          <div className="hidden md:block">
            <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 border ${
              streakLoaded 
                ? 'bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 border-orange-200 dark:from-orange-900/20 dark:to-red-900/20 dark:hover:from-orange-800/30 dark:hover:to-red-800/30 dark:border-orange-700' 
                : 'bg-gray-100 border-gray-200 dark:bg-dark-card dark:border-dark-border'
            }`}>
              <div className={`text-xl transition-all duration-500 ${isAnimating ? 'scale-125 animate-bounce' : ''}`}>
                {streakLoaded ? getStreakEmoji(streakData.currentStreak) : '⏳'}
              </div>
              <span className="font-bold text-gray-800 dark:text-dark-text transition-colors duration-300">
                {streakLoaded ? streakData.currentStreak : '...'}
              </span>
              <span className="text-sm text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">
                {streakLoaded ? (streakData.currentStreak === 1 ? 'day' : 'days') : 'loading'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="hidden md:block">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium transition-colors duration-300">Today's Date</p>
              <p className="text-lg font-semibold text-blue-800 dark:text-blue-300 transition-colors duration-300">{todayDate}</p>
            </div>
            <div className="flex items-center justify-between md:justify-end md:space-x-0 md:text-right">
              <div className="md:hidden">
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 border ${
                  streakLoaded 
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 border-orange-200 dark:from-orange-900/20 dark:to-red-900/20 dark:hover:from-orange-800/30 dark:hover:to-red-800/30 dark:border-orange-700' 
                    : 'bg-gray-100 border-gray-200 dark:bg-dark-card dark:border-dark-border'
                }`}>
                  <div className={`text-xl transition-all duration-500 ${isAnimating ? 'scale-125 animate-bounce' : ''}`}>
                    {streakLoaded ? getStreakEmoji(streakData.currentStreak) : '⏳'}
                  </div>
                  <span className="font-bold text-gray-800 dark:text-dark-text transition-colors duration-300">
                    {streakLoaded ? streakData.currentStreak : '...'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">
                    {streakLoaded ? (streakData.currentStreak === 1 ? 'day' : 'days') : 'loading'}
                  </span>
                </div>
              </div>
              <div className="text-right ml-36 md:ml-0">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium transition-colors duration-300">Today's Focus</p>
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-300 transition-colors duration-300">{todayDay}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Today's Routine - Prominently Displayed */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-4 flex items-center transition-colors duration-300">
          <span className="text-2xl mr-2">⭐</span>
          {checkDayCompletion(todayDay) ? (
            <span className="text-green-600 dark:text-green-400 transition-colors duration-300">✅ Completed Workout - {todayDay}</span>
          ) : (
            `Today's Workout - ${todayDay}`
          )}
        </h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800/30 rounded-lg p-6 transition-colors duration-300">
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
              <p className="text-gray-600 dark:text-dark-textSecondary font-medium text-lg transition-colors duration-300">Rest Day</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Recovery is important!</p>
            </div>
          ) : (
            <>
              {/* Floating Add Exercise Button */}
              <div className="fixed bottom-6 right-6 z-40">
                <button
                  onClick={() => toggleAddExercise(todayDay)}
                  className="group bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center"
                  style={{
                    width: '50px',
                    height: '50px'
                  }}
                >
                  <span className="text-xl font-bold leading-none">+</span>
                  {/* Tooltip for desktop */}
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Add Exercise
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
              </div>

              {/* Add Exercise Form */}
              {showAddExercise[todayDay] && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-dark-hover rounded-lg border border-gray-200 dark:border-dark-border transition-colors duration-300">
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Exercise Name (e.g., Bench Press)"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
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

              {isLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">Loading exercises...</p>
                </div>
              ) : exerciseRoutines[todayDay] && exerciseRoutines[todayDay].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exerciseRoutines[todayDay].map((exercise) => (
                    <div key={exercise.name} className="bg-white dark:bg-dark-card rounded-lg p-4 border border-gray-200 dark:border-dark-border shadow-sm relative transition-colors duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={gymData[todayDay]?.exercises?.[exercise.name]?.completed || false}
                            onChange={() => handleExerciseToggle(todayDay, exercise.name)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className={`font-semibold ${
                            gymData[todayDay]?.exercises?.[exercise.name]?.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-dark-text'
                          } transition-colors duration-300`}>
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
                            <span className="text-xs text-gray-600 dark:text-dark-textSecondary block mb-1 transition-colors duration-300">Sets:</span>
                            {editingSets[`${todayDay}-${exercise.name}`] ? (
                              <input
                                type="number"
                                min="1"
                                value={getExerciseSets(todayDay, exercise.name) || ''}
                                onChange={(e) => handleSetsChange(todayDay, exercise.name, e.target.value)}
                                onBlur={() => toggleSetsEditing(todayDay, exercise.name)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Enter sets"
                                autoFocus
                              />
                            ) : (
                              <div 
                                onClick={() => toggleSetsEditing(todayDay, exercise.name)}
                                className="bg-gray-100 dark:bg-dark-hover px-2 py-1 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-dark-text"
                              >
                                {getExerciseSets(todayDay, exercise.name) || 'Click to add'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-xs text-gray-600 dark:text-dark-textSecondary block mb-1 transition-colors duration-300">Reps:</span>
                            {editingReps[`${todayDay}-${exercise.name}`] ? (
                              <input
                                type="text"
                                value={getExerciseReps(todayDay, exercise.name) || ''}
                                onChange={(e) => handleRepsChange(todayDay, exercise.name, e.target.value)}
                                onBlur={() => toggleRepsEditing(todayDay, exercise.name)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Enter reps"
                                autoFocus
                              />
                            ) : (
                              <div 
                                onClick={() => toggleRepsEditing(todayDay, exercise.name)}
                                className="bg-gray-100 dark:bg-dark-hover px-2 py-1 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-dark-text"
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
                        onFocus={() => {
                          // Uncheck when focusing on PR field
                          if (gymData[todayDay]?.exercises?.[exercise.name]?.completed) {
                            setGymData(prev => ({
                              ...prev,
                              [todayDay]: {
                                ...prev[todayDay],
                                exercises: {
                                  ...prev[todayDay]?.exercises,
                                  [exercise.name]: {
                                    ...prev[todayDay]?.exercises?.[exercise.name],
                                    completed: false
                                  }
                                }
                              }
                            }))
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="text-4xl mb-2">🏋️</div>
                  <p className="text-gray-600 dark:text-dark-textSecondary font-medium transition-colors duration-300">No exercises yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Add your first exercise using the + button!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Other Days - Collapsible */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-4 transition-colors duration-300">📅 Other Days</h3>
        <div className="space-y-4">
          {otherDays.map((day) => {
            const exercises = exerciseRoutines[day] || []
            const isExpanded = expandedDays[day] || false
            
            return (
              <div key={day} className="bg-gray-50 dark:bg-dark-hover rounded-lg border border-gray-200 dark:border-dark-border transition-colors duration-300">
                <button
                  onClick={() => toggleDayExpansion(day)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-700 dark:text-dark-text transition-colors duration-300">{day}</span>
                    {day === 'Sunday' && <span className="text-sm text-gray-500 dark:text-dark-textSecondary transition-colors duration-300">(Rest Day)</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-dark-textSecondary transition-colors duration-300">
                      {isLoading ? '...' : `${exercises.length} ${exercises.length === 1 ? 'exercise' : 'exercises'}`}
                    </span>
                    <svg 
                      className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
                          <p className="text-gray-600 dark:text-dark-textSecondary font-medium transition-colors duration-300">Rest Day</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Recovery is important!</p>
                        </div>
                      ) : (
                      <>
                        {/* Add Exercise Button for Other Days */}
                        <div className="mb-3">
                          <button
                            onClick={() => toggleAddExercise(day)}
                            className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-200 text-sm font-bold shadow-md hover:shadow-lg"
                          >
                            <span>+</span>
                          </button>
                        </div>

                        {/* Add Exercise Form for Other Days */}
                        {showAddExercise[day] && (
                          <div className="mb-3 p-3 bg-gray-50 dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border transition-colors duration-300">
                            <div className="mb-2">
                              <input
                                type="text"
                                placeholder="Exercise Name"
                                value={newExerciseName}
                                onChange={(e) => setNewExerciseName(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
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
                            <div key={exercise.name} className="bg-white dark:bg-dark-card rounded-lg p-3 border border-gray-200 dark:border-dark-border relative transition-colors duration-300">
                              <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={gymData[day]?.exercises?.[exercise.name]?.completed || false}
                                    onChange={() => handleExerciseToggle(day, exercise.name)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <span className={`text-sm font-medium ${
                                    gymData[day]?.exercises?.[exercise.name]?.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-dark-text'
                                  } transition-colors duration-300`}>
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
                                    <span className="text-xs text-gray-500 dark:text-dark-textSecondary block mb-1 transition-colors duration-300">Sets:</span>
                                    {editingSets[`${day}-${exercise.name}`] ? (
                                      <input
                                        type="number"
                                        min="1"
                                        value={getExerciseSets(day, exercise.name) || ''}
                                        onChange={(e) => handleSetsChange(day, exercise.name, e.target.value)}
                                        onBlur={() => toggleSetsEditing(day, exercise.name)}
                                        className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-dark-border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder="Sets"
                                        autoFocus
                                      />
                                    ) : (
                                      <div 
                                        onClick={() => toggleSetsEditing(day, exercise.name)}
                                        className="bg-gray-100 dark:bg-dark-hover px-1 py-1 rounded text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-dark-text"
                                      >
                                        {getExerciseSets(day, exercise.name) || 'Click to add'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-xs text-gray-500 dark:text-dark-textSecondary block mb-1 transition-colors duration-300">Reps:</span>
                                    {editingReps[`${day}-${exercise.name}`] ? (
                                      <input
                                        type="text"
                                        value={getExerciseReps(day, exercise.name) || ''}
                                        onChange={(e) => handleRepsChange(day, exercise.name, e.target.value)}
                                        onBlur={() => toggleRepsEditing(day, exercise.name)}
                                        className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-dark-border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder="Reps"
                                        autoFocus
                                      />
                                    ) : (
                                      <div 
                                        onClick={() => toggleRepsEditing(day, exercise.name)}
                                        className="bg-gray-100 dark:bg-dark-hover px-1 py-1 rounded text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-dark-text"
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
                                onFocus={() => {
                                  // Uncheck when focusing on PR field
                                  if (gymData[day]?.exercises?.[exercise.name]?.completed) {
                                    setGymData(prev => ({
                                      ...prev,
                                      [day]: {
                                        ...prev[day],
                                        exercises: {
                                          ...prev[day]?.exercises,
                                          [exercise.name]: {
                                            ...prev[day]?.exercises?.[exercise.name],
                                            completed: false
                                          }
                                        }
                                      }
                                    }))
                                  }
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
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
    </>
  )
}

export default GymRoutine 
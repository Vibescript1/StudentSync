import { useState, useEffect, useRef, useCallback } from 'react'

export const useStudyStreakLogic = () => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [streakLoaded, setStreakLoaded] = useState(false)
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    totalStreaks: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    streakHistory: [],
    lastStudyDate: null // Track when study sessions were last completed
  })
  
  // Use ref to access current streakData in functions
  const streakDataRef = useRef(streakData)
  streakDataRef.current = streakData

  const resetStreakData = () => {
    const resetData = {
      currentStreak: 0,
      totalStreaks: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      streakHistory: [],
      lastStudyDate: null
    }
    setStreakData(resetData)
  }

  // Check if streak should be broken due to missed days
  const checkAndBreakStreak = useCallback(() => {
    const today = new Date().toDateString()
    const currentStreakData = streakDataRef.current
    
    // If no study sessions were ever completed, no streak to break
    if (!currentStreakData.lastStudyDate) {
      return false
    }

    const lastStudy = new Date(currentStreakData.lastStudyDate)
    const todayDate = new Date(today)
    const daysDiff = Math.floor((todayDate - lastStudy) / (1000 * 60 * 60 * 24))
    
    // If more than 1 day has passed since last study completion, break the streak
    // This means if you skip a day, your streak breaks
    if (daysDiff > 1) {
      const updatedStreakData = {
        ...currentStreakData,
        currentStreak: 0, // Reset streak to 0
        lastCompletedDate: null,
        streakHistory: [
          ...currentStreakData.streakHistory,
          {
            date: today,
            streak: 0,
            type: 'streak_broken_missed_day'
          }
        ]
      }
      
      setStreakData(updatedStreakData)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
      
      return true // Streak was broken
    }
    
    return false // Streak is still valid
  }, [])

  const incrementStreak = useCallback(() => {
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
      
      // If more than 1 day has passed, reset streak (no more than 1 day gap allowed)
      if (daysDiff > 1) {
        const updatedStreakData = {
          ...currentStreakData,
          currentStreak: 1, // Start new streak at 1
          totalStreaks: currentStreakData.totalStreaks + 1,
          longestStreak: Math.max(1, currentStreakData.longestStreak),
          lastCompletedDate: today,
          lastStudyDate: today,
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
      lastStudyDate: today,
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
  }, [])

  const decrementStreak = useCallback(() => {
    const today = new Date().toDateString()
    const currentStreakData = streakDataRef.current
    
    // Only decrement if streak was achieved today
    if (currentStreakData.lastCompletedDate === today && currentStreakData.currentStreak > 0) {
      const newCurrentStreak = Math.max(0, currentStreakData.currentStreak - 1)
      
      // Check if the last entry was a Sunday bonus
      const lastEntry = currentStreakData.streakHistory[currentStreakData.streakHistory.length - 1]
      const isSundayBonus = lastEntry && lastEntry.type === 'sunday_bonus'
      
      const updatedStreakData = {
        ...currentStreakData,
        currentStreak: newCurrentStreak,
        totalStreaks: Math.max(0, currentStreakData.totalStreaks - 1),
        lastCompletedDate: isSundayBonus ? currentStreakData.streakHistory[currentStreakData.streakHistory.length - 2]?.date || null : null,
        lastStudyDate: isSundayBonus ? currentStreakData.streakHistory[currentStreakData.streakHistory.length - 2]?.date || null : null,
        streakHistory: currentStreakData.streakHistory.slice(0, -1) // Remove last entry
      }
      
      setStreakData(updatedStreakData)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
      
      return true // Streak decremented
    }
    
    return false // No streak to decrement
  }, [])

  // Function to break streak when study sessions are skipped
  const breakStreakForSkippedDay = useCallback((day) => {
    const today = new Date().toDateString()
    const currentStreakData = streakDataRef.current
    
    // If there's an active streak and study sessions exist for this day but weren't completed
    if (currentStreakData.currentStreak > 0) {
      const updatedStreakData = {
        ...currentStreakData,
        currentStreak: 0, // Reset streak to 0
        lastCompletedDate: null,
        streakHistory: [
          ...currentStreakData.streakHistory,
          {
            date: today,
            streak: 0,
            type: 'streak_broken_skipped_study',
            skippedDay: day
          }
        ]
      }
      
      setStreakData(updatedStreakData)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
      
      return true // Streak was broken
    }
    
    return false // No streak to break
  }, [])

  const getStreakEmoji = useCallback((streak) => {
    if (streak === 0) return '😴'
    if (streak < 3) return '📚'
    if (streak < 7) return '🎯'
    if (streak < 14) return '🧠'
    if (streak < 30) return '🏆'
    return '👑'
  }, [])

  const addSundayBonus = useCallback((todayDay, setShowCompletionAnimation, setIsNewStreak, setValidationMessage, setIsValidationShowing, setNotificationProgress) => {
    if (todayDay === 'Sunday' && streakLoaded) {
      const today = new Date()
      const todayString = today.toDateString()
      const lastSundayBonus = localStorage.getItem('lastSundayStudyStreakBonus')
      
      // Check if we haven't given the Sunday bonus yet today
      if (lastSundayBonus !== todayString) {
        // Add +1 to streak for Sunday consistency
        setStreakData(prev => {
          const updatedStreak = {
            ...prev,
            currentStreak: prev.currentStreak + 1,
            totalStreaks: prev.totalStreaks + 1,
            longestStreak: Math.max(prev.currentStreak + 1, prev.longestStreak),
            lastCompletedDate: todayString,
            lastStudyDate: todayString,
            streakHistory: [
              ...prev.streakHistory,
              {
                date: todayString,
                streak: prev.currentStreak + 1,
                type: 'sunday_bonus'
              }
            ]
          }
          
          // Save the bonus date to localStorage
          localStorage.setItem('lastSundayStudyStreakBonus', todayString)
          
          return updatedStreak
        })
        
        // Show Sunday bonus notification
        setShowCompletionAnimation(true)
        setIsNewStreak(true)
        setValidationMessage('')
        setIsValidationShowing(false)
        setNotificationProgress(100)
        
        // Start progress bar countdown
        const startTime = Date.now()
        const duration = 4000 // 4 seconds for Sunday bonus
        
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
          setNotificationProgress(remaining)
          
          if (remaining <= 0) {
            clearInterval(progressInterval)
            setShowCompletionAnimation(false)
            setIsNewStreak(false)
          }
        }, 50)
      }
    }
  }, [streakLoaded])

  // Load streak data from localStorage on component mount
  useEffect(() => {
    try {
      const savedStreakData = localStorage.getItem('studyStreak')
      
      if (savedStreakData) {
        const parsedStreakData = JSON.parse(savedStreakData)
        
        // Validate that it has the required structure
        if (parsedStreakData && 
            typeof parsedStreakData.currentStreak === 'number' &&
            typeof parsedStreakData.totalStreaks === 'number' &&
            typeof parsedStreakData.longestStreak === 'number' &&
            Array.isArray(parsedStreakData.streakHistory)) {
          
          // Add lastStudyDate if it doesn't exist (for backward compatibility)
          if (!parsedStreakData.lastStudyDate) {
            parsedStreakData.lastStudyDate = parsedStreakData.lastCompletedDate
          }
          
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
      localStorage.setItem('studyStreak', JSON.stringify(streakData))
    }
  }, [streakData, streakLoaded])

  // Animate streak when it changes
  useEffect(() => {
    if (streakData.currentStreak > 0) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }, [streakData.currentStreak])

  return {
    streakData,
    isAnimating,
    streakLoaded,
    incrementStreak,
    decrementStreak,
    getStreakEmoji,
    addSundayBonus,
    checkAndBreakStreak,
    breakStreakForSkippedDay,
    resetStreakData
  }
} 
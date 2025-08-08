import { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaTrash, FaBook, FaPlus, FaExclamationTriangle, FaCheck, FaTrophy, FaCrown, FaBed, FaChartLine, FaSearch, FaPen, FaChartBar, FaBolt, FaMeditation, FaExclamationCircle } from 'react-icons/fa';
import { useStudyStreakLogic } from './useStudyStreakLogic';

const StudyRoutine = () => {
  const [studyData, setStudyData] = useState({});
  const [activeTimer, setActiveTimer] = useState(null); // { day, subjectIndex }
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  const [subjectStartTime, setSubjectStartTime] = useState(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [notificationProgress, setNotificationProgress] = useState(100);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidationShowing, setIsValidationShowing] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState({});
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateSubjectMessage, setDuplicateSubjectMessage] = useState('');
  const [isDuplicateShowing, setIsDuplicateShowing] = useState(false);
  const [isNewStreak, setIsNewStreak] = useState(false);
  const [showTimerPopup, setShowTimerPopup] = useState(false);
  const [showStatsPopup, setShowStatsPopup] = useState(false);
  const [lastWeekTotal, setLastWeekTotal] = useState(0);
  const [currentWeekTotal, setCurrentWeekTotal] = useState(0);

  // Use the streak logic custom hook
  const {
    streakData,
    isAnimating,
    streakLoaded,
    incrementStreak,
    decrementStreak,
    getStreakEmoji,
    addSundayBonus
  } = useStudyStreakLogic();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Get today's information
  const today = new Date();
  const todayDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Get today's day
  const todayDay = days[(today.getDay() + 6) % 7];

  // Get other days (excluding today)
  const getOtherDays = () => {
    return days.filter(day => day !== todayDay);
  };

  const toggleDayExpansion = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // Motivational messages based on day
  const motivationalMessages = {
    'Monday': {
      title: "📚 Monday Focus!",
      message: "Start your week strong! Tackle your most challenging subjects today.",
      icon: FaBook
    },
    'Tuesday': {
      title: "📖 Tuesday Momentum!",
      message: "Build on yesterday's progress. Consistency is key to mastery!",
      icon: FaChartLine
    },
    'Wednesday': {
      title: "✍️ Wednesday Wisdom!",
      message: "Halfway through the week! Review what you've learned so far.",
      icon: FaSearch
    },
    'Thursday': {
      title: "📝 Thursday Thrive!",
      message: "Practice makes perfect. Focus on application today!",
      icon: FaPen
    },
    'Friday': {
      title: "📊 Friday Review!",
      message: "Consolidate your week's learning. What needs more attention?",
      icon: FaChartBar
    },
    'Saturday': {
      title: "🎯 Saturday Study!",
      message: "Weekend study sessions can be your secret weapon!",
      icon: FaBolt
    },
    'Sunday': {
      title: "🧘 Sunday Reflection",
      message: "Review your progress and plan for the coming week!",
      emoji: "🔄"
    }
  };

  // Format time (seconds) to HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate weekly study totals
  const calculateWeeklyTotals = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(currentWeekStart.getDate() - 7); // Start of last week
    
    const lastWeekEnd = new Date(currentWeekStart);
    lastWeekEnd.setDate(currentWeekStart.getDate() - 1); // End of last week
    
    let currentWeekTotal = 0;
    let lastWeekTotal = 0;
    
    // Calculate totals from study data
    Object.keys(studyData).forEach(day => {
      const subjects = studyData[day]?.subjects || [];
      const dayTotal = subjects.reduce((total, subject) => total + (subject.timeSpent || 0), 0);
      
      // Map day names to actual dates for this week and last week
      const dayIndex = days.indexOf(day);
      if (dayIndex !== -1) {
        // Calculate the date for this day in the current week
        const currentWeekDay = new Date(currentWeekStart);
        currentWeekDay.setDate(currentWeekStart.getDate() + dayIndex);
        
        // Calculate the date for this day in the last week
        const lastWeekDay = new Date(lastWeekStart);
        lastWeekDay.setDate(lastWeekStart.getDate() + dayIndex);
        
        // Check if this day's data belongs to current week or last week
        if (currentWeekDay <= today && currentWeekDay >= currentWeekStart) {
          currentWeekTotal += dayTotal;
        } else if (lastWeekDay >= lastWeekStart && lastWeekDay <= lastWeekEnd) {
          lastWeekTotal += dayTotal;
        }
      }
    });
    
    setCurrentWeekTotal(currentWeekTotal);
    setLastWeekTotal(lastWeekTotal);
  };

    // Load data from localStorage on component mount
  useEffect(() => {
      const savedData = localStorage.getItem('studyRoutine');
      const savedTotalTime = localStorage.getItem('totalStudyTime');
    const savedTodayTime = localStorage.getItem('todayStudyTime');
    const savedTodayDate = localStorage.getItem('todayStudyDate');
    const savedTimer = localStorage.getItem('activeStudyTimer');

      if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData && typeof parsedData === 'object') {
          setStudyData(parsedData);
        } else {
          console.warn('Invalid study data structure, starting fresh');
          setStudyData({});
        }
      } catch (error) {
        console.error('Error parsing study data:', error);
          setStudyData({});
        }
      }

      if (savedTotalTime) {
      setTotalStudyTime(parseInt(savedTotalTime, 10));
    }
    
    // Handle today's study time
    const today = new Date().toDateString();
    if (savedTodayDate === today && savedTodayTime) {
      setTodayStudyTime(parseInt(savedTodayTime, 10));
    } else {
      // New day, reset today's study time
      setTodayStudyTime(0);
      localStorage.setItem('todayStudyTime', '0');
      localStorage.setItem('todayStudyDate', today);
    }
    
    // Restore timer state if it was running or paused
      if (savedTimer) {
      try {
        const timerData = JSON.parse(savedTimer);
        if (timerData.startTime) {
          const startTime = new Date(timerData.startTime);
          
          // If timer was running, calculate elapsed time
          let elapsedSeconds = timerData.timeElapsed;
          if (timerData.isRunning) {
          const now = new Date();
            elapsedSeconds = Math.floor((now - startTime) / 1000);
          }

          setActiveTimer({ day: timerData.day, subjectIndex: timerData.subjectIndex });
          setSubjectStartTime(startTime);
          setTimeElapsed(elapsedSeconds);
          setIsRunning(timerData.isRunning);
          setShowTimerPopup(true);
        }
      } catch (error) {
        console.error('Error restoring timer state:', error);
        localStorage.removeItem('activeStudyTimer');
      }
    }
    
      setIsLoading(false);
  }, []);

  // Save data to localStorage whenever studyData, totalStudyTime, or todayStudyTime changes
  useEffect(() => {
    // Only save if component has finished loading and we have meaningful data
    if (!isLoading) {
      try {
        setIsSaving(true);
    localStorage.setItem('studyRoutine', JSON.stringify(studyData));
    localStorage.setItem('totalStudyTime', totalStudyTime.toString());
        localStorage.setItem('todayStudyTime', todayStudyTime.toString());
        localStorage.setItem('todayStudyDate', new Date().toDateString());
        
        // Show saved indicator briefly
        setTimeout(() => setIsSaving(false), 1000);
      } catch (error) {
        setIsSaving(false);
      }
    }
  }, [studyData, totalStudyTime, todayStudyTime, isLoading]);

  // Calculate weekly totals when study data changes
  useEffect(() => {
    if (!isLoading && Object.keys(studyData).length > 0) {
      calculateWeeklyTotals();
    }
  }, [studyData, isLoading]);

  // Timer logic with persistence
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          // Save current timer state to localStorage
          if (activeTimer) {
            localStorage.setItem('activeStudyTimer', JSON.stringify({
              day: activeTimer.day,
              subjectIndex: activeTimer.subjectIndex,
              startTime: subjectStartTime?.getTime(),
              timeElapsed: newTime,
              isRunning: true
            }));
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, activeTimer, subjectStartTime]);

  // Start timer for a subject
  const startTimer = (day, subjectIndex) => {
    // If there's an active timer, stop it first
    if (activeTimer) {
      stopTimer();
    }
    
    setActiveTimer({ day, subjectIndex });
    setIsRunning(true);
    setTimeElapsed(0);
    setSubjectStartTime(new Date());
    setShowTimerPopup(true);
  };

  // Pause the current timer
  const pauseTimer = () => {
    setIsRunning(false);
    // Save paused state
    if (activeTimer) {
      localStorage.setItem('activeStudyTimer', JSON.stringify({
        day: activeTimer.day,
        subjectIndex: activeTimer.subjectIndex,
        startTime: subjectStartTime?.getTime(),
        timeElapsed: timeElapsed,
        isRunning: false
      }));
    }
  };

  // Resume the paused timer
  const resumeTimer = () => {
    setIsRunning(true);
    // Save resumed state
    if (activeTimer) {
      localStorage.setItem('activeStudyTimer', JSON.stringify({
        day: activeTimer.day,
        subjectIndex: activeTimer.subjectIndex,
        startTime: subjectStartTime?.getTime(),
        timeElapsed: timeElapsed,
        isRunning: true
      }));
    }
  };

  // Stop the current timer and log the time
  const stopTimer = () => {
    if (!activeTimer) return;

    const { day, subjectIndex } = activeTimer;
    const currentTime = new Date();
    const elapsedSeconds = Math.floor((currentTime - subjectStartTime) / 1000);

    // Add elapsed time to the subject and total study time
    setStudyData(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          subjects: prev[day]?.subjects?.map((subject, index) => 
            index === subjectIndex ? { 
              ...subject, 
              timeSpent: (subject.timeSpent || 0) + elapsedSeconds 
            } : subject
          ) || []
        }
    }));

    // Add to today's study time and total study time
    setTodayStudyTime(prev => {
      const newTodayTime = prev + elapsedSeconds;
      localStorage.setItem('todayStudyTime', newTodayTime.toString());
      return newTodayTime;
    });
    setTotalStudyTime(prev => prev + elapsedSeconds);
    setActiveTimer(null);
    setIsRunning(false);
    setTimeElapsed(0);
    setShowTimerPopup(false);
    // Clear saved timer state
    localStorage.removeItem('activeStudyTimer');
  };

  // Toggle subject completion status
  const handleSubjectToggle = (day, subjectIndex) => {
    setStudyData(prev => {
      const newData = {
      ...prev,
      [day]: {
        ...prev[day],
          subjects: prev[day]?.subjects?.map((subject, index) => 
            index === subjectIndex ? { ...subject, completed: !subject.completed } : subject
        ) || []
        }
      };
      
      // Check if all subjects for this day are now completed
      const subjects = newData[day]?.subjects || [];
      const allCompleted = subjects.every(subject => subject.completed);
      
      if (day === todayDay && streakLoaded && todayDay) {
        // Check if this action caused all subjects to become completed
        if (allCompleted) {
          // Check if this was the subject that completed all subjects
          const wasAllCompletedBefore = subjects.every((subject, index) => {
            if (index === subjectIndex) {
              return !subject.completed; // This subject was not completed before
            }
            return prev[day]?.subjects?.[index]?.completed || false;
          });
          
          if (!wasAllCompletedBefore) {
          // This check caused all subjects to become completed - increment streak
          const isNewStreakAchieved = incrementStreak();
          
          if (isNewStreakAchieved) {
            setShowCompletionAnimation(true);
            setIsNewStreak(true);
            setValidationMessage('');
            setIsValidationShowing(false);
            setNotificationProgress(100);
            
            // Start progress bar countdown
            const startTime = Date.now();
            const duration = 3000; // 3 seconds
            
            const progressInterval = setInterval(() => {
              const elapsed = Date.now() - startTime;
              const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
              setNotificationProgress(remaining);
              
              if (remaining <= 0) {
                clearInterval(progressInterval);
                setShowCompletionAnimation(false);
                setIsNewStreak(false);
              }
            }, 50); // Update every 50ms for smooth animation
            } else {
              // Show completion notification without incrementing streak
              setShowCompletionAnimation(true);
              setIsNewStreak(false);
              setValidationMessage('');
              setIsValidationShowing(false);
              setNotificationProgress(100);
              
              // Start progress bar countdown
              const startTime = Date.now();
              const duration = 3000; // 3 seconds
              
              const progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
                setNotificationProgress(remaining);
                
                if (remaining <= 0) {
                  clearInterval(progressInterval);
                  setShowCompletionAnimation(false);
                  setIsNewStreak(false);
                }
              }, 50); // Update every 50ms for smooth animation
            }
          }
        } else {
          // Check if this uncheck broke the "all completed" status
          const wasAllCompleted = subjects.every((subject, index) => {
            if (index === subjectIndex) {
              return !subject.completed; // This subject was completed before
            }
            return prev[day]?.subjects?.[index]?.completed || false;
          });
          
          if (wasAllCompleted) {
            // This uncheck broke the "all completed" status - decrement streak
            decrementStreak();
          }
        }
      }
      
      return newData;
    });
  };

  // Add a new subject to a day
  const addSubject = (day) => {
    if (!newSubjectName.trim()) {
      showValidationMessage('Please enter a subject name');
      return;
    }

    const subjectName = newSubjectName.trim();
    
    // Check if subject already exists for this day
    const existingSubjects = studyData[day]?.subjects || [];
    const subjectExists = existingSubjects.some(subject => 
      subject.name.toLowerCase() === subjectName.toLowerCase()
    );
    
    if (subjectExists) {
      // Show duplicate subject error notification
      setIsDuplicateShowing(true);
      setShowCompletionAnimation(true);
      setDuplicateSubjectMessage('Subject already exists for this day');
      setNotificationProgress(100);
      
      // Start progress bar countdown for error message
      const startTime = Date.now();
      const duration = 3000; // 3 seconds
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setNotificationProgress(remaining);
        
        if (remaining <= 0) {
          clearInterval(progressInterval);
          setShowCompletionAnimation(false);
          setDuplicateSubjectMessage('');
          setIsDuplicateShowing(false);
        }
      }, 30);
      
      return; // Don't add duplicate subject
    }

    const newSubject = {
      name: subjectName,
      completed: false,
      timeSpent: 0,
      goals: ''
    };

    setStudyData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        subjects: [...(prev[day]?.subjects || []), newSubject]
      }
    }));

    setNewSubjectName('');
    setShowAddSubject(prev => ({
      ...prev,
      [day]: false
    }));
  };

  // Delete a subject from a day
  const deleteSubject = (day, subjectIndex) => {
    // If deleting the active timer subject, stop the timer first
    if (activeTimer?.day === day && activeTimer?.subjectIndex === subjectIndex) {
      stopTimer();
    }
    
    setStudyData(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          subjects: prev[day]?.subjects?.filter((_, index) => index !== subjectIndex) || []
        }
    }));
  };

  // Update subject goals
  const handleGoalsChange = (day, subjectIndex, value) => {
    setStudyData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        subjects: prev[day]?.subjects?.map((subject, index) => 
          index === subjectIndex ? { ...subject, goals: value } : subject
        ) || []
      }
    }));
  };

  // Toggle add subject form for a day
  const toggleAddSubject = (day) => {
    setShowAddSubject(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
    if (!showAddSubject[day]) {
      setNewSubjectName('');
    }
  };

  // Show validation message
  const showValidationMessage = (message) => {
    setIsValidationShowing(true);
    setShowCompletionAnimation(true);
    setValidationMessage(message);
    setNotificationProgress(100);
    
    const startTime = Date.now();
    const duration = 3000;
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setNotificationProgress(remaining);
      
      if (remaining <= 0) {
        clearInterval(progressInterval);
        setShowCompletionAnimation(false);
        setValidationMessage('');
        setIsValidationShowing(false);
      }
    }, 30);
  };

  // Check if all subjects for a day are completed
  const checkDayCompletion = (day) => {
    const subjects = studyData[day]?.subjects || [];
    if (subjects.length === 0) return false;
    
    return subjects.every(subject => subject.completed);
  };

  // Set today's day and handle Sunday streak bonus
  useEffect(() => {
    if (streakLoaded && todayDay) {
      // Handle Sunday bonus using the custom hook
    addSundayBonus(todayDay, setShowCompletionAnimation, setIsNewStreak, setValidationMessage, setIsValidationShowing, setNotificationProgress);
    }
  }, [streakLoaded, todayDay]);

  // Check if all subjects are completed for today when streak is loaded
  useEffect(() => {
    if (streakLoaded && todayDay && studyData[todayDay]) {
      const subjects = studyData[todayDay]?.subjects || [];
      const allCompleted = subjects.every(subject => subject.completed);
      
      if (allCompleted && subjects.length > 0) {
        incrementStreak();
      }
    }
  }, [streakLoaded, todayDay, studyData]);

  // Handle page visibility changes (when user switches tabs or closes window)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (activeTimer) {
        // Save current timer state when page becomes hidden (running or paused)
        localStorage.setItem('activeStudyTimer', JSON.stringify({
          day: activeTimer.day,
          subjectIndex: activeTimer.subjectIndex,
          startTime: subjectStartTime?.getTime(),
          timeElapsed: timeElapsed,
          isRunning: isRunning
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTimer, isRunning, subjectStartTime, timeElapsed]);

  const otherDays = getOtherDays();

  return (
    <>
      {/* Save Indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          💾 Saving...
        </div>
      )}

      {/* Completion Notification */}
      {showCompletionAnimation && (
        <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-out">
          <div className={`bg-white dark:bg-dark-card rounded-lg shadow-lg border p-3 max-w-xs relative overflow-hidden transform transition-all duration-300 ${
            validationMessage || duplicateSubjectMessage ? 'border-orange-200 dark:border-orange-600' : 'border-gray-200 dark:border-dark-border'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  validationMessage || duplicateSubjectMessage ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  <span className={`text-sm ${validationMessage || duplicateSubjectMessage ? 'text-orange-600' : 'text-green-600'}`}>
                    {validationMessage || duplicateSubjectMessage ? <FaExclamationTriangle /> : <FaCheck />}
                  </span>
        </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-dark-text transition-colors duration-300">
                  {validationMessage ? 'Required' : duplicateSubjectMessage ? 'Duplicate' : (isNewStreak && todayDay === 'Sunday' ? 'Sunday Bonus!' : isNewStreak ? 'New Streak!' : 'Complete!')}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-textSecondary transition-colors duration-300">
                  {validationMessage 
                    ? 'Please enter a subject name'
                    : duplicateSubjectMessage
                    ? 'Subject already exists'
                    : (isNewStreak && todayDay === 'Sunday'
                        ? 'Sunday bonus! +1 streak 🎉'
                        : isNewStreak
                        ? 'Streak achieved! 📚'
                        : `${todayDay} done! 💪`
                      )
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCompletionAnimation(false);
                  setValidationMessage('');
                  setIsValidationShowing(false);
                  setDuplicateSubjectMessage('');
                  setIsDuplicateShowing(false);
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-100">
              <div 
                className={`h-full transition-all duration-100 ease-linear ${
                  validationMessage || duplicateSubjectMessage ? 'bg-orange-400' : 'bg-blue-500'
                }`}
                style={{ width: `${notificationProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Timer Popup Modal */}
      {showTimerPopup && activeTimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2"><FaBook /></div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-2">
                  Currently Studying
                </h3>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {studyData[activeTimer.day]?.subjects?.[activeTimer.subjectIndex]?.name || 'Untitled Subject'}
              </p>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {formatTime(timeElapsed)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.min((timeElapsed / 3600) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="flex space-x-3 justify-center">
                {isRunning ? (
                  <button 
                    onClick={pauseTimer}
                    className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <FaPause className="mr-2" /> Pause
                  </button>
                ) : (
                  <button 
                    onClick={resumeTimer}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FaPlay className="mr-2" /> Resume
                  </button>
                )}
                <button
                  onClick={stopTimer}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaStop className="mr-2" /> Stop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Stats Box */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setShowStatsPopup(true)}
          className="group bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center"
          style={{ width: '50px', height: '50px' }}
        >
          <FaChartBar className="text-xl" />
          <div className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Weekly Stats
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
        </button>
            </div>

      {/* Stats Popup Modal */}
      {showStatsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2"><FaChartBar /></div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-2">
                  Weekly Study Statistics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your study hours for this week and last week
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Current Week */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">Current Week</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-300">This week's total study time</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {formatTime(currentWeekTotal)}
                    </div>
                  </div>
                </div>
                
                {/* Last Week */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Last Week</h4>
                      <p className="text-sm text-green-600 dark:text-green-300">Previous week's total study time</p>
                    </div>
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {formatTime(lastWeekTotal)}
                    </div>
                  </div>
                </div>
                
                {/* Comparison */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800/30">
                  <div className="text-center">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Progress</h4>
                    <div className="text-sm">
                      {(() => {
                        const difference = currentWeekTotal - lastWeekTotal;
                        const differenceFormatted = formatTime(Math.abs(difference));
                        
                        if (lastWeekTotal === 0 && currentWeekTotal > 0) {
                          return (
                            <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                              <FaTrophy /> Great start! You've studied {formatTime(currentWeekTotal)} this week!
                            </span>
                          );
                        } else if (lastWeekTotal === 0 && currentWeekTotal === 0) {
                          return (
                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <FaBook /> Start studying to track your progress!
                            </span>
                          );
                        } else if (difference > 0) {
                          return (
                            <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                              <FaTrophy /> You studied {differenceFormatted} more than last week!
                            </span>
                          );
                        } else if (difference < 0) {
                          return (
                            <span className="text-orange-600 dark:text-orange-400 flex items-center gap-2">
                              <FaBook /> You need to study {differenceFormatted} more to match last week
                            </span>
                          );
                        } else {
                          return (
                            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                              <FaChartBar /> Same study time as last week
                            </span>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowStatsPopup(false)}
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text transition-colors duration-300 flex items-center gap-2">.....  <FaBook /> Study Routine Tracker</h2>
          <div className="hidden md:block">
            <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 border ${
              streakLoaded 
                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 dark:border-blue-700' 
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
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 dark:border-blue-700' 
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
      
      {/* Today's Study Time Display */}
      <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 mb-6 flex justify-between items-center">
            <div>
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Today's Study Time</h3>
          <p className="text-sm text-blue-600 dark:text-blue-300">Study hours for today only</p>
              </div>
        <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
          {formatTime(todayStudyTime)}
            </div>
            </div>
      


      {/* Today's Study Routine */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-4 flex items-center transition-colors duration-300">
          <span className="text-2xl mr-2">⭐</span>
          {checkDayCompletion(todayDay) ? (
            <span className="text-green-600 dark:text-green-400 transition-colors duration-300">✅ Completed Study Session - {todayDay}</span>
          ) : (
            `Today's Study Session - ${todayDay}`
          )}
            </h3>
            

        
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800/30 rounded-lg p-6 transition-colors duration-300">
          {/* Progress Indicator */}
          {todayDay !== 'Sunday' && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-blue-600 mb-1">
                <span>Today's Progress</span>
                <span>
                  {studyData[todayDay]?.subjects?.filter(subject => subject.completed).length || 0} / {studyData[todayDay]?.subjects?.length || 0}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${studyData[todayDay]?.subjects?.length ? 
                      ((studyData[todayDay]?.subjects?.filter(subject => subject.completed).length || 0) / studyData[todayDay]?.subjects?.length) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {todayDay === 'Sunday' ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2"><FaMeditation /></div>
                <p className="text-gray-600 dark:text-dark-textSecondary font-medium text-lg transition-colors duration-300">Weekly Review Day</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Reflect on your progress and plan for next week</p>
            </div>
          ) : (
            <>
              {/* Floating Add Subject Button */}
              <div className="fixed bottom-6 right-6 z-40">
                <button
                  onClick={() => toggleAddSubject(todayDay)}
                  className="group bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center"
                  style={{ width: '50px', height: '50px' }}
                >
                  <FaPlus className="text-xl" />
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Add Subject
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
              </div>

              {/* Add Subject Form */}
              {showAddSubject[todayDay] && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-dark-hover rounded-lg border border-gray-200 dark:border-dark-border transition-colors duration-300">
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Subject Name (e.g., Calculus)"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addSubject(todayDay)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add Subject
                    </button>
                    <button
                      onClick={() => toggleAddSubject(todayDay)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">Loading subjects...</p>
                </div>
              ) : studyData[todayDay]?.subjects?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studyData[todayDay].subjects.map((subject, subjectIndex) => (
                    <div key={subjectIndex} className="bg-white dark:bg-dark-card rounded-lg p-4 border border-gray-200 dark:border-dark-border shadow-sm relative transition-colors duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                            checked={subject.completed || false}
                            onChange={() => handleSubjectToggle(todayDay, subjectIndex)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className={`font-semibold ${
                            subject.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-dark-text'
                        } transition-colors duration-300`}>
                            {subject.name}
                        </span>
                      </label>
                      <button
                          onClick={() => deleteSubject(todayDay, subjectIndex)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="Delete Subject"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                    
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-600 dark:text-dark-textSecondary block mb-1 transition-colors duration-300">Time Spent:</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
                            {formatTime(subject.timeSpent || 0)}
                          </span>
                        </div>
                        {activeTimer?.day === todayDay && activeTimer?.subjectIndex === subjectIndex ? (
                        <button 
                          onClick={stopTimer}
                          className="flex items-center px-2 py-1 bg-red-500 text-white rounded text-xs"
                        >
                          <FaStop className="mr-1" /> Stop
                        </button>
                      ) : (
                        <button 
                            onClick={() => startTimer(todayDay, subjectIndex)}
                          className="flex items-center px-2 py-1 bg-green-500 text-white rounded text-xs"
                          disabled={activeTimer !== null}
                        >
                          <FaPlay className="mr-1" /> Start
                        </button>
                      )}
                    </div>
                      
                      <input
                        type="text"
                        placeholder="Study goals (e.g., Complete Chapter 5)"
                        value={subject.goals || ''}
                        onChange={(e) => handleGoalsChange(todayDay, subjectIndex, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                  </div>
                ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2"><FaBook /></div>
                  <p className="text-gray-600 dark:text-dark-textSecondary font-medium transition-colors duration-300">No subjects yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Add your first subject using the + button!</p>
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
            const subjects = studyData[day]?.subjects || [];
            const isExpanded = expandedDays[day] || false;
            
            return (
              <div key={day} className="bg-gray-50 dark:bg-dark-hover rounded-lg border border-gray-200 dark:border-dark-border transition-colors duration-300">
                <button
                  onClick={() => toggleDayExpansion(day)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-700 dark:text-dark-text transition-colors duration-300">{day}</span>
                    {day === 'Sunday' && <span className="text-sm text-gray-500 dark:text-dark-textSecondary transition-colors duration-300">(Review Day)</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-dark-textSecondary transition-colors duration-300">
                      {isLoading ? '...' : `${subjects.length} ${subjects.length === 1 ? 'subject' : 'subjects'}`}
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
                        <div className="text-3xl mb-2"><FaPen /></div>
                        <p className="text-gray-600 dark:text-dark-textSecondary font-medium transition-colors duration-300">Weekly Review</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Plan and reflect on your studies</p>
                      </div>
                    ) : (
                      <>
                        {/* Add Subject Button for Other Days */}
                        <div className="mb-3">
                          <button
                            onClick={() => toggleAddSubject(day)}
                            className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 text-sm font-bold shadow-md hover:shadow-lg"
                          >
                            <FaPlus />
                          </button>
                        </div>

                        {/* Add Subject Form for Other Days */}
                        {showAddSubject[day] && (
                          <div className="mb-3 p-3 bg-gray-50 dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border transition-colors duration-300">
                            <div className="mb-2">
                              <input
                                type="text"
                                placeholder="Subject Name"
                                value={newSubjectName}
                                onChange={(e) => setNewSubjectName(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-hover text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => addSubject(day)}
                                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => toggleAddSubject(day)}
                                className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
              </div>
            )}

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {subjects.map((subject, subjectIndex) => (
                            <div key={subjectIndex} className="bg-white dark:bg-dark-card rounded-lg p-3 border border-gray-200 dark:border-dark-border relative transition-colors duration-300">
                              <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={subject.completed || false}
                                    onChange={() => handleSubjectToggle(day, subjectIndex)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <span className={`text-sm font-medium ${
                                    subject.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-dark-text'
                                  } transition-colors duration-300`}>
                                    {subject.name}
                                  </span>
                                </label>
                                <button
                                  onClick={() => deleteSubject(day, subjectIndex)}
                                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                                  title="Delete Subject"
                                >
                                  <FaTrash className="w-3 h-3" />
                                </button>
                              </div>
                              
                              <div className="mb-2 flex items-center justify-between">
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-dark-textSecondary block mb-1 transition-colors duration-300">Time Spent:</span>
                                  <span className="text-xs font-medium text-gray-700 dark:text-dark-text">
                                    {formatTime(subject.timeSpent || 0)}
                                  </span>
                                </div>
                                {activeTimer?.day === day && activeTimer?.subjectIndex === subjectIndex ? (
                                  <button 
                                    onClick={stopTimer}
                                    className="flex items-center px-2 py-1 bg-red-500 text-white rounded text-xs"
                                  >
                                    <FaStop className="mr-1" /> Stop
                                  </button>
                                ) : (
                                <button 
                                  onClick={() => startTimer(day, subjectIndex)}
                                  className="flex items-center px-2 py-1 bg-green-500 text-white rounded text-xs"
                                  disabled={activeTimer !== null}
                                >
                                  <FaPlay className="mr-1" /> Start
                                </button>
                                )}
                              </div>
                              
                              <input
                                type="text"
                                placeholder="Study goals"
                                value={subject.goals || ''}
                                onChange={(e) => handleGoalsChange(day, subjectIndex, e.target.value)}
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
            );
          })}
      </div>
    </div>
    </>
  );
};

export default StudyRoutine;
import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useStudyStreakLogic } from './useStudyStreakLogic';
import TimerComponent from './TimerComponent';
import SubjectCard from './SubjectCard';
import StatsComponent from './StatsComponent';
import NotificationComponent from './NotificationComponent';

const StudyRoutine = () => {
  // State management
  const [studyData, setStudyData] = useState({});
  const [activeTimer, setActiveTimer] = useState(null);
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
  const [isWeeklyReset, setIsWeeklyReset] = useState(false);

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

  // Format time (seconds) to HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle day expansion
  const toggleDayExpansion = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // Calculate weekly study totals
  const calculateWeeklyTotals = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(currentWeekStart.getDate() - 7);
    
    const lastWeekEnd = new Date(currentWeekStart);
    lastWeekEnd.setDate(currentWeekStart.getDate() - 1);
    
    let currentWeekTotal = 0;
    let lastWeekTotal = 0;
    
    Object.keys(studyData).forEach(day => {
      const subjects = studyData[day]?.subjects || [];
      const dayTotal = subjects.reduce((total, subject) => total + (subject.timeSpent || 0), 0);
      
      const dayIndex = days.indexOf(day);
      if (dayIndex !== -1) {
        const currentWeekDay = new Date(currentWeekStart);
        currentWeekDay.setDate(currentWeekStart.getDate() + dayIndex);
        
        const lastWeekDay = new Date(lastWeekStart);
        lastWeekDay.setDate(lastWeekStart.getDate() + dayIndex);
        
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

  // Timer functions
  const startTimer = (day, subjectIndex) => {
    if (day !== todayDay) {
      showValidationMessage(`You can only start timers for today's subjects (${todayDay})`);
      return;
    }
    
    if (activeTimer) {
      stopTimer();
    }
    
    setActiveTimer({ day, subjectIndex });
    setIsRunning(true);
    setTimeElapsed(0);
    setSubjectStartTime(new Date());
    setShowTimerPopup(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
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

  const resumeTimer = () => {
    setIsRunning(true);
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

  const stopTimer = () => {
    if (!activeTimer) return;

    const { day, subjectIndex } = activeTimer;
    const currentTime = new Date();
    const elapsedSeconds = Math.floor((currentTime - subjectStartTime) / 1000);

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
    localStorage.removeItem('activeStudyTimer');
  };

  // Subject management functions
  const handleSubjectToggle = (day, subjectIndex) => {
    const currentSubject = studyData[day]?.subjects?.[subjectIndex];
    
    if (!currentSubject?.completed && (!currentSubject?.goals || currentSubject.goals.trim() === '')) {
      showValidationMessage('Please fill in the study goals before marking as completed');
      return;
    }
    
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
      
      const subjects = newData[day]?.subjects || [];
      const allCompleted = subjects.every(subject => subject.completed);
      const totalSubjects = subjects.length;
      
      if (day === todayDay && streakLoaded && todayDay && allCompleted && totalSubjects > 0) {
        const wasAllCompletedBefore = subjects.every((subject, index) => {
          if (index === subjectIndex) {
            return !subject.completed;
          }
          return prev[day]?.subjects?.[index]?.completed || false;
        });
        
        if (!wasAllCompletedBefore) {
          const isNewStreakAchieved = incrementStreak();
          
          if (isNewStreakAchieved) {
            setShowCompletionAnimation(true);
            setIsNewStreak(true);
            setValidationMessage('');
            setIsValidationShowing(false);
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
                setIsNewStreak(false);
              }
            }, 50);
          }
        }
      }
      
      return newData;
    });
  };

  const addSubject = (day) => {
    if (!newSubjectName.trim()) {
      showValidationMessage('Please enter a subject name');
      return;
    }

    const subjectName = newSubjectName.trim();
    const existingSubjects = studyData[day]?.subjects || [];
    const subjectExists = existingSubjects.some(subject => 
      subject.name.toLowerCase() === subjectName.toLowerCase()
    );
    
    if (subjectExists) {
      setIsDuplicateShowing(true);
      setShowCompletionAnimation(true);
      setDuplicateSubjectMessage('Subject already exists for this day');
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
          setDuplicateSubjectMessage('');
          setIsDuplicateShowing(false);
        }
      }, 30);
      
      return;
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

  const deleteSubject = (day, subjectIndex) => {
    if (activeTimer?.day === day && activeTimer?.subjectIndex === subjectIndex) {
      stopTimer();
    }
    
    const subjectToDelete = studyData[day]?.subjects?.[subjectIndex];
    const timeToSubtract = subjectToDelete?.timeSpent || 0;
    
    setStudyData(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          subjects: prev[day]?.subjects?.filter((_, index) => index !== subjectIndex) || []
        }
    }));
    
    if (timeToSubtract > 0) {
      setTotalStudyTime(prev => Math.max(0, prev - timeToSubtract));
      
      if (day === todayDay) {
        setTodayStudyTime(prev => Math.max(0, prev - timeToSubtract));
        localStorage.setItem('todayStudyTime', Math.max(0, todayStudyTime - timeToSubtract).toString());
      }
    }
  };

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

  const toggleAddSubject = (day) => {
    setShowAddSubject(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
    if (!showAddSubject[day]) {
      setNewSubjectName('');
    }
  };

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

  const checkDayCompletion = (day) => {
    const subjects = studyData[day]?.subjects || [];
    if (subjects.length === 0) return false;
    return subjects.every(subject => subject.completed);
  };

  const handleNotificationClose = () => {
    setShowCompletionAnimation(false);
    setValidationMessage('');
    setIsValidationShowing(false);
    setDuplicateSubjectMessage('');
    setIsDuplicateShowing(false);
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
    
    const today = new Date().toDateString();
    if (savedTodayDate === today && savedTodayTime) {
      setTodayStudyTime(parseInt(savedTodayTime, 10));
    } else {
      setTodayStudyTime(0);
      localStorage.setItem('todayStudyTime', '0');
      localStorage.setItem('todayStudyDate', today);
    }
    
      if (savedTimer) {
      try {
        const timerData = JSON.parse(savedTimer);
        if (timerData.startTime) {
          const startTime = new Date(timerData.startTime);
          
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

  // Save data to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        setIsSaving(true);
    localStorage.setItem('studyRoutine', JSON.stringify(studyData));
    localStorage.setItem('totalStudyTime', totalStudyTime.toString());
        localStorage.setItem('todayStudyTime', todayStudyTime.toString());
        localStorage.setItem('todayStudyDate', new Date().toDateString());
        
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

  // Handle Sunday bonus
  useEffect(() => {
    if (streakLoaded && todayDay) {
    addSundayBonus(todayDay, setShowCompletionAnimation, setIsNewStreak, setValidationMessage, setIsValidationShowing, setNotificationProgress);
    }
  }, [streakLoaded, todayDay]);

  // Weekly reset functionality
  useEffect(() => {
    if (streakLoaded && todayDay) {
      const today = new Date();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);
      
      const lastResetDate = localStorage.getItem('lastWeeklyResetDate');
      const lastReset = lastResetDate ? new Date(lastResetDate) : null;
      
      if (!lastReset || lastReset < currentWeekStart) {
        setStudyData(prev => {
          const resetData = {};
          
          days.forEach(day => {
            if (prev[day]?.subjects) {
              resetData[day] = {
                ...prev[day],
                subjects: prev[day].subjects.map(subject => ({
                  ...subject,
                  completed: false,
                  timeSpent: 0,
                  goals: subject.goals
                }))
              };
            }
          });
          
          return resetData;
        });
        
        setTodayStudyTime(0);
        localStorage.setItem('todayStudyTime', '0');
        localStorage.setItem('todayStudyDate', today.toDateString());
        localStorage.setItem('lastWeeklyResetDate', currentWeekStart.toDateString());
        
         setShowCompletionAnimation(true);
         setIsNewStreak(false);
         setIsWeeklyReset(true);
         setValidationMessage('');
         setIsValidationShowing(false);
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
             setIsWeeklyReset(false);
           }
        }, 50);
      }
    }
  }, [streakLoaded, todayDay, days]);

  // Check if all subjects are completed for today
  useEffect(() => {
    if (streakLoaded && todayDay && studyData[todayDay]) {
      const subjects = studyData[todayDay]?.subjects || [];
      const allCompleted = subjects.every(subject => subject.completed);
      const totalSubjects = subjects.length;
      
      if (allCompleted && totalSubjects > 0) {
        const today = new Date().toDateString();
        const lastCompletedDate = streakData.lastCompletedDate;
        
        if (lastCompletedDate !== today) {
        incrementStreak();
      }
      } else if (subjects.length === 0) {
        const today = new Date().toDateString();
        const lastCompletedDate = streakData.lastCompletedDate;
        
        if (lastCompletedDate === today && streakData.currentStreak > 0) {
          decrementStreak();
        }
      }
    }
  }, [streakLoaded, todayDay, studyData, streakData.lastCompletedDate]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (activeTimer) {
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

      {/* Notification Component */}
      <NotificationComponent
        showCompletionAnimation={showCompletionAnimation}
        validationMessage={validationMessage}
        duplicateSubjectMessage={duplicateSubjectMessage}
        isWeeklyReset={isWeeklyReset}
        isNewStreak={isNewStreak}
        todayDay={todayDay}
        notificationProgress={notificationProgress}
        onClose={handleNotificationClose}
      />

      {/* Timer Component */}
      {showTimerPopup && (
        <TimerComponent
          activeTimer={activeTimer}
          timeElapsed={timeElapsed}
          isRunning={isRunning}
          studyData={studyData}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onStop={stopTimer}
          formatTime={formatTime}
        />
      )}

      {/* Stats Component */}
      <StatsComponent
        isOpen={showStatsPopup}
        onClose={() => setShowStatsPopup(false)}
        currentWeekTotal={currentWeekTotal}
        lastWeekTotal={lastWeekTotal}
        formatTime={formatTime}
      />

      {/* Sticky Stats Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setShowStatsPopup(true)}
          className="group bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center"
          style={{ width: '50px', height: '50px' }}
        >
          <span className="text-xl">📊</span>
          <div className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Weekly Stats
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text transition-colors duration-300">📚 Study Routine Tracker</h2>
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
              <div className="text-4xl mb-2">🧘</div>
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newSubjectName.trim()) {
                            addSubject(todayDay);
                          }
                        }
                      }}
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
                    <SubjectCard
                      key={subjectIndex}
                      subject={subject}
                      subjectIndex={subjectIndex}
                      day={todayDay}
                      todayDay={todayDay}
                      activeTimer={activeTimer}
                      isToday={true}
                      onToggleComplete={handleSubjectToggle}
                      onDelete={deleteSubject}
                      onStartTimer={startTimer}
                      onStopTimer={stopTimer}
                      onGoalsChange={handleGoalsChange}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📚</div>
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
                        <div className="text-3xl mb-2">📝</div>
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
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newSubjectName.trim()) {
                                      addSubject(day);
                                    }
                                  }
                                }}
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
                            <SubjectCard
                              key={subjectIndex}
                              subject={subject}
                              subjectIndex={subjectIndex}
                              day={day}
                              todayDay={todayDay}
                              activeTimer={activeTimer}
                              isToday={false}
                              onToggleComplete={handleSubjectToggle}
                              onDelete={deleteSubject}
                              onStartTimer={startTimer}
                              onStopTimer={stopTimer}
                              onGoalsChange={handleGoalsChange}
                              formatTime={formatTime}
                            />
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
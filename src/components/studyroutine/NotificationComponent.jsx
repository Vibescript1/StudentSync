const NotificationComponent = ({
  showCompletionAnimation,
  validationMessage,
  duplicateSubjectMessage,
  isWeeklyReset,
  isNewStreak,
  todayDay,
  notificationProgress,
  onClose
}) => {
  if (!showCompletionAnimation) return null;

  return (
    <>
      {/* Save Indicator - can be added here if needed */}
      
      {/* Completion Notification */}
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
                  {validationMessage || duplicateSubjectMessage ? '⚠️' : '✓'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-dark-text transition-colors duration-300">
                {validationMessage ? 'Required' : duplicateSubjectMessage ? 'Duplicate' : isWeeklyReset ? 'Weekly Reset!' : (isNewStreak && todayDay === 'Sunday' ? 'Sunday Bonus!' : isNewStreak ? 'New Streak!' : 'Complete!')}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-textSecondary transition-colors duration-300">
                {validationMessage 
                  ? validationMessage
                  : duplicateSubjectMessage
                  ? 'Subject already exists'
                  : isWeeklyReset
                  ? 'Fresh start for the new week! 📅'
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
              onClick={onClose}
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
    </>
  );
};

export default NotificationComponent;
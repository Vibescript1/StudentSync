const StatsComponent = ({ 
  isOpen, 
  onClose, 
  currentWeekTotal, 
  lastWeekTotal, 
  formatTime 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">📊</div>
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
                        <span className="text-green-600 dark:text-green-400">
                          🎉 Great start! You've studied {formatTime(currentWeekTotal)} this week!
                        </span>
                      );
                    } else if (lastWeekTotal === 0 && currentWeekTotal === 0) {
                      return (
                        <span className="text-gray-600 dark:text-gray-400">
                          📚 Start studying to track your progress!
                        </span>
                      );
                    } else if (difference > 0) {
                      return (
                        <span className="text-green-600 dark:text-green-400">
                          🎉 You studied {differenceFormatted} more than last week!
                        </span>
                      );
                    } else if (difference < 0) {
                      return (
                        <span className="text-orange-600 dark:text-orange-400">
                          📚 You need to study {differenceFormatted} more to match last week
                        </span>
                      );
                    } else {
                      return (
                        <span className="text-blue-600 dark:text-blue-400">
                          📊 Same study time as last week
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
              onClick={onClose}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsComponent;
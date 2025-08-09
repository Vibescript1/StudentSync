import { FaPlay, FaStop, FaTrash } from 'react-icons/fa';

const SubjectCard = ({ 
  subject, 
  subjectIndex, 
  day, 
  todayDay,
  activeTimer, 
  isToday = false,
  onToggleComplete, 
  onDelete, 
  onStartTimer, 
  onStopTimer, 
  onGoalsChange, 
  formatTime 
}) => {
  const isTimerActive = activeTimer?.day === day && activeTimer?.subjectIndex === subjectIndex;
  const canStartTimer = day === todayDay;

  return (
    <div className={`bg-white dark:bg-dark-card rounded-lg p-${isToday ? '4' : '3'} border border-gray-200 dark:border-dark-border ${isToday ? 'shadow-sm' : ''} relative transition-colors duration-300 group`}>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={subject.completed || false}
            onChange={() => onToggleComplete(day, subjectIndex)}
            className={`${isToday ? 'w-5 h-5' : 'w-4 h-4'} text-blue-600 rounded focus:ring-blue-500`}
          />
          <span className={`${isToday ? 'font-semibold' : 'text-sm font-medium'} ${
            subject.completed ? 'line-through text-gray-500 dark:text-gray-400' : `${isToday ? 'text-gray-800' : 'text-gray-700'} dark:text-dark-text`
          } transition-colors duration-300`}>
            {subject.name}
          </span>
        </label>
        <button
          onClick={() => onDelete(day, subjectIndex)}
          className="text-red-500 hover:text-red-700 transition-colors p-1"
          title="Delete Subject"
        >
          <FaTrash className={`${isToday ? 'w-4 h-4' : 'w-3 h-3'}`} />
        </button>
      </div>
      
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500 dark:text-dark-textSecondary block mb-1 transition-colors duration-300">
            Time Spent:
          </span>
          <span className={`${isToday ? 'text-sm' : 'text-xs'} font-medium text-gray-700 dark:text-dark-text`}>
            {formatTime(subject.timeSpent || 0)}
          </span>
        </div>
        
        {isTimerActive ? (
          <button 
            onClick={onStopTimer}
            className="flex items-center px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
          >
            <FaStop className="mr-1" /> Stop
          </button>
        ) : (
          <div className="relative">
            <button 
              onClick={() => onStartTimer(day, subjectIndex)}
              className={`flex items-center px-2 py-1 rounded text-xs transition-colors ${
                !canStartTimer 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
              disabled={activeTimer !== null || !canStartTimer}
              title={!canStartTimer ? `You can only start timers for today (${todayDay})` : ''}
            >
              <FaPlay className="mr-1" /> Start
            </button>
            {!canStartTimer && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                Only today's timers allowed
              </div>
            )}
          </div>
        )}
      </div>
      
      <input
        type="text"
        placeholder={isToday ? "Study goals (e.g., Complete Chapter 5)" : "Study goals"}
        value={subject.goals || ''}
        onChange={(e) => onGoalsChange(day, subjectIndex, e.target.value)}
        className={`w-full px-${isToday ? '3' : '2'} py-${isToday ? '2' : '1'} ${isToday ? 'text-sm' : 'text-xs'} border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400`}
      />
    </div>
  );
};

export default SubjectCard;
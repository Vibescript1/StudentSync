import { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStop } from 'react-icons/fa';

const TimerComponent = ({ 
  activeTimer, 
  timeElapsed, 
  isRunning, 
  studyData,
  onPause, 
  onResume, 
  onStop,
  formatTime 
}) => {
  if (!activeTimer) return null;

  const subjectName = studyData[activeTimer.day]?.subjects?.[activeTimer.subjectIndex]?.name || 'Untitled Subject';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">📚</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-2">
              Currently Studying
            </h3>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {subjectName}
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
                onClick={onPause}
                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <FaPause className="mr-2" /> Pause
              </button>
            ) : (
              <button 
                onClick={onResume}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaPlay className="mr-2" /> Resume
              </button>
            )}
            <button
              onClick={onStop}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaStop className="mr-2" /> Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerComponent;
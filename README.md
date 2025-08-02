# Student Dashboard

A comprehensive weekly planning dashboard for students to manage their gym routine, study schedule, and office work tasks.

## Features

### 🏋️ Gym Routine Section
- **Weekly Layout**: Monday to Saturday with Sunday as rest day
- **Exercise Tracking**: Pre-defined exercises (Bench Press, Squat, Deadlift, Cardio)
- **Progress Tracking**: Checkboxes to mark completed exercises
- **Personal Records**: Input fields to track PRs for each exercise
- **Rest Day**: Sunday is marked as a rest day with motivational message

### 🎓 Study Routine Section
- **Flexible Tasks**: Add unlimited study tasks for each day
- **Topic Planning**: Input fields for study topics and goals
- **Progress Tracking**: Checkboxes to mark completed study sessions
- **Dynamic Management**: Add/remove tasks as needed
- **Study Break**: Sunday is marked as a study break day

### 💼 Office Work Section
- **Task Management**: Add unlimited work tasks for each day
- **Status Tracking**: Dropdown to set task status (Pending, In Progress, Completed, Blocked)
- **Notes System**: Textarea for detailed notes and updates
- **Visual Status**: Color-coded status badges
- **Weekend**: Sunday is marked as weekend break

### 📱 General Features
- **Responsive Design**: Works on mobile and desktop
- **Data Persistence**: All data saved to localStorage
- **Modern UI**: Clean, modern interface using Tailwind CSS
- **Tabbed Interface**: Easy navigation between sections
- **Real-time Updates**: Changes are saved automatically

## Technology Stack

- **React 19**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server
- **localStorage**: Client-side data persistence

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd student-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage

1. **Gym Routine**: 
   - Check off completed exercises
   - Add your personal records for each exercise
   - Sunday is automatically set as rest day

2. **Study Routine**:
   - Click "+ Add Study Task" to create new study sessions
   - Enter what you want to study and your goals
   - Mark tasks as completed when done

3. **Office Work**:
   - Add work tasks for each day
   - Set task status using the dropdown
   - Add detailed notes about your progress
   - Remove tasks you no longer need

## Data Storage

All your data is automatically saved to your browser's localStorage. This means:
- Your data persists between browser sessions
- No account or login required
- Data is stored locally on your device
- Clearing browser data will reset your dashboard

## Project Structure

```
src/
├── components/
│   ├── GymRoutine.jsx      # Gym routine management
│   ├── StudyRoutine.jsx    # Study schedule management
│   └── OfficeWork.jsx      # Office work task management
├── App.jsx                 # Main app with tab navigation
├── App.css                 # Global styles
├── index.css               # Tailwind CSS imports
└── main.jsx               # App entry point
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).

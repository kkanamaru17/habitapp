// DOM Elements
const habitListEl = document.getElementById('habitList');
const newHabitInput = document.getElementById('newHabitInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitSelect = document.getElementById('habitSelect');
const calendarEl = document.getElementById('calendar');
const currentStreakEl = document.getElementById('currentStreak');
const calendarToggle = document.getElementById('calendarToggle');
const calendarContent = document.getElementById('calendarContent');
const heatmapEl = document.getElementById('heatmap');
const heatmapYearSelect = document.getElementById('heatmapYearSelect');
const heatmapToggle = document.getElementById('heatmapToggle');
const heatmapContent = document.getElementById('heatmapContent');
const toggleIcon = heatmapToggle.querySelector('.toggle-icon');
const calendarToggleIcon = calendarToggle.querySelector('.toggle-icon');

// Data structure
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let heatmapInitialized = false;

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Initialize the app
function init() {
    renderHabitList();
    updateHabitSelector();
    
    // Event listeners
    addHabitBtn.addEventListener('click', addHabit);
    newHabitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addHabit();
    });
    
    habitSelect.addEventListener('change', renderCalendar);
    
    // Add resize listener to update UI for different screen sizes
    window.addEventListener('resize', debounce(() => {
        renderHabitList();
    }, 250));
    
    // Initial calendar render if a habit is selected
    if (habitSelect.value) {
        renderCalendar();
    }
    
    // Set up heat map toggle
    heatmapToggle.addEventListener('click', toggleHeatMap);
    
    // Set up calendar toggle
    calendarToggle.addEventListener('click', toggleCalendar);
    
    // Initialize heat map since it's visible by default
    initHeatMap();
    heatmapInitialized = true;
}

// Toggle heat map visibility
function toggleHeatMap() {
    const isVisible = heatmapContent.style.display !== 'none';
    
    if (isVisible) {
        // Hide heat map
        heatmapContent.style.display = 'none';
        toggleIcon.textContent = '+';
        toggleIcon.classList.remove('open');
    } else {
        // Show heat map
        heatmapContent.style.display = 'block';
        toggleIcon.textContent = '×';
        toggleIcon.classList.add('open');
        
        // Initialize heat map if not already done
        if (!heatmapInitialized) {
            initHeatMap();
            heatmapInitialized = true;
        }
    }
}

// Initialize the heat map
function initHeatMap() {
    // Populate year selector
    populateHeatMapYearSelector();
    
    // Add event listener to year selector
    heatmapYearSelect.addEventListener('change', renderHeatMap);
    
    // Delay initial render to prevent page load issues
    setTimeout(() => {
        renderHeatMap();
    }, 500);
}

// Populate the heat map year selector
function populateHeatMapYearSelector() {
    // Clear existing options
    heatmapYearSelect.innerHTML = '';
    
    // Get current date
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Add options for the current year and previous 3 years
    for (let i = 0; i < 4; i++) {
        const year = currentYear - i;
        const yearOption = document.createElement('option');
        yearOption.value = year;
        yearOption.textContent = year;
        heatmapYearSelect.appendChild(yearOption);
    }
}

// Render the heat map
function renderHeatMap() {
    // Clear existing heat map
    heatmapEl.innerHTML = '';
    
    // Get selected year
    const year = parseInt(heatmapYearSelect.value);
    if (!year) return; // Exit if no year selected
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Generating heat map for ' + year + '...';
    loadingIndicator.style.textAlign = 'center';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.color = '#666';
    loadingIndicator.style.fontStyle = 'italic';
    heatmapEl.appendChild(loadingIndicator);
    
    // Use requestAnimationFrame to prevent UI blocking
    requestAnimationFrame(() => {
        setTimeout(() => {
            // Remove loading indicator
            heatmapEl.innerHTML = '';
            
            // Render the actual heat map
            renderHeatMapContent(year);
        }, 100);
    });
}

// Render the heat map content
function renderHeatMapContent(year) {
    // Get the first day of the year
    const firstDay = new Date(year, 0, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Calculate the start date (including days from previous year if needed)
    const startDate = new Date(year, 0, 1);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    // Get today's date for highlighting
    const today = new Date();
    const todayString = formatDate(today);
    
    // Calculate the number of weeks in the year
    const lastDay = new Date(year, 11, 31);
    const numWeeks = Math.ceil((lastDay - startDate) / (7 * 24 * 60 * 60 * 1000));
    
    // Create heat map cells
    const heatmapFragment = document.createDocumentFragment();
    const dateCache = new Map();
    
    // For each week
    for (let week = 0; week < numWeeks; week++) {
        // For each day of the week
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + (week * 7) + dayOfWeek);
            
            const dateString = formatDate(currentDate);
            
            // Create a cell for this day
            const dayCell = document.createElement('div');
            dayCell.className = 'heatmap-day';
            dayCell.style.gridColumn = week + 1;
            dayCell.style.gridRow = dayOfWeek + 1;
            
            // Calculate completion percentage for this day
            let completionPercentage;
            if (dateCache.has(dateString)) {
                completionPercentage = dateCache.get(dateString);
            } else {
                completionPercentage = calculateDayCompletionPercentage(dateString);
                dateCache.set(dateString, completionPercentage);
            }
            
            // Set background color based on completion percentage
            if (completionPercentage > 0) {
                const colorValue = Math.floor(255 - (completionPercentage * 255 / 100));
                dayCell.style.backgroundColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
            } else {
                dayCell.style.backgroundColor = '#f8f8f8';
            }
            
            // Format the date for the tooltip in a more readable format
            const formattedDate = currentDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Add tooltip with completion info
            dayCell.title = `${formattedDate}: ${completionPercentage}% of habits completed`;
            
            // Highlight today
            if (dateString === todayString) {
                dayCell.classList.add('today');
            }
            
            heatmapFragment.appendChild(dayCell);
        }
    }
    
    heatmapEl.appendChild(heatmapFragment);
}

// Calculate the percentage of habits completed on a specific day
function calculateDayCompletionPercentage(dateString) {
    // If no habits, return 0
    if (habits.length === 0) return 0;
    
    // Count completed habits for this day
    let completedCount = 0;
    
    habits.forEach(habit => {
        const log = habit.logs.find(log => log.date === dateString);
        if (log && log.status === 'completed') {
            completedCount++;
        }
    });
    
    // Calculate percentage
    return Math.round((completedCount / habits.length) * 100);
}

// Update heat map when habits are modified
function updateHeatMap() {
    if (heatmapYearSelect && heatmapYearSelect.value) {
        renderHeatMap();
    }
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Save habits to localStorage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Add a new habit
function addHabit() {
    const habitName = newHabitInput.value.trim();
    
    if (habitName) {
        const newHabit = {
            id: Date.now().toString(),
            name: habitName,
            logs: [],
            createdAt: new Date().toISOString()
        };
        
        habits.push(newHabit);
        saveHabits();
        
        newHabitInput.value = '';
        renderHabitList();
        updateHabitSelector();
        updateHeatMap();
    }
}

// Render the habit list
function renderHabitList() {
    habitListEl.innerHTML = '';
    
    if (habits.length === 0) {
        habitListEl.innerHTML = '<p class="empty-state">No habits added yet. Add your first habit!</p>';
        return;
    }
    
    // Check if we're on a mobile device
    const isMobile = window.innerWidth <= 600;
    
    habits.forEach(habit => {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        
        // Use the helper function for consistent date formatting
        const today = formatDate(new Date());
        const loggedToday = habit.logs.some(log => log.date === today && log.status === 'completed');
        const skippedToday = habit.logs.some(log => log.date === today && log.status === 'skipped');
        
        // Calculate current streak for this habit
        const currentStreak = calculateStreak(habit);
        const streakDisplay = currentStreak > 0 ? 
            `<span class="streak-badge" title="Current streak">${currentStreak}🔥</span>` : '';
        
        // Use shorter button labels on mobile
        const doneLabel = isMobile ? '✓' : 'Done';
        const skipLabel = isMobile ? '⏭️' : 'Skip';
        const undoLabel = isMobile ? '↩️' : 'Undo';
        const editLabel = isMobile ? '✏️' : 'Edit';
        const deleteLabel = isMobile ? '🗑️' : 'Delete';
        
        habitItem.innerHTML = `
            <div class="habit-name">${habit.name} ${loggedToday ? '✅' : skippedToday ? '⏭️' : ''}</div>
            <div class="habit-actions">
                ${!loggedToday && !skippedToday ? `
                    ${streakDisplay}
                    <button class="done-btn" data-id="${habit.id}">${doneLabel}</button>
                    <button class="skip-btn" data-id="${habit.id}">${skipLabel}</button>
                ` : `
                    ${streakDisplay}
                    <button class="undo-btn" data-id="${habit.id}">${undoLabel}</button>
                    <button class="edit-btn" data-id="${habit.id}">${editLabel}</button>
                `}
                <button class="delete-btn" data-id="${habit.id}">${deleteLabel}</button>
            </div>
        `;
        
        habitListEl.appendChild(habitItem);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.done-btn').forEach(btn => {
        btn.addEventListener('click', () => logHabit(btn.dataset.id, 'completed'));
    });
    
    document.querySelectorAll('.skip-btn').forEach(btn => {
        btn.addEventListener('click', () => logHabit(btn.dataset.id, 'skipped'));
    });
    
    document.querySelectorAll('.undo-btn').forEach(btn => {
        btn.addEventListener('click', () => undoHabitLog(btn.dataset.id));
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editHabit(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteHabit(btn.dataset.id));
    });
}

// Log a habit as completed or skipped
function logHabit(habitId, status) {
    const habit = habits.find(h => h.id === habitId);
    
    if (habit) {
        // Get the streak before the update
        const streakBefore = calculateStreak(habit);
        
        // Use the helper function for consistent date formatting
        const today = formatDate(new Date());
        
        // Check if already logged today
        const existingLogIndex = habit.logs.findIndex(log => log.date === today);
        
        if (existingLogIndex >= 0) {
            // Update existing log
            habit.logs[existingLogIndex].status = status;
        } else {
            // Add new log
            habit.logs.push({
                date: today,
                status: status
            });
        }
        
        saveHabits();
        
        // Get the streak after the update
        const streakAfter = calculateStreak(habit);
        
        // Render the updated habit list
        renderHabitList();
        
        // Update calendar if this habit is currently selected
        if (habitSelect.value === habitId) {
            renderCalendar();
        }
        
        // Update heat map
        updateHeatMap();
        
        // Trigger confetti effect if habit is marked as completed
        if (status === 'completed') {
            // Launch confetti from the bottom of the window
            // Use the horizontal position of the button but vertical position at bottom of screen
            const button = document.querySelector(`.done-btn[data-id="${habitId}"]`);
            let x = window.innerWidth / 2; // Default to center
            
            if (button) {
                // Get horizontal position of the button for a more targeted effect
                const rect = button.getBoundingClientRect();
                x = rect.left + rect.width / 2;
                
                // Play a success sound (optional)
                playSuccessSound();
            }
            
            // Launch from bottom of screen with upward trajectory
            const y = window.innerHeight;
            confetti.start(x, y, 250, 2.0);
            
            // If streak increased, show a special notification
            if (streakAfter > streakBefore) {
                showStreakNotification(habit.name, streakAfter);
            }
        }
    }
}

// Show a notification when streak increases
function showStreakNotification(habitName, streak) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'streak-notification';
    notification.innerHTML = `
        <div class="streak-notification-content">
            <span class="streak-emoji">🔥</span>
            <div class="streak-text">
                <strong>${streak} day streak!</strong>
                <span>Keep up the good work with "${habitName}"</span>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Play a success sound when a habit is completed
function playSuccessSound() {
    try {
        // Check if AudioContext is supported
        if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
            return; // Silently fail if not supported
        }
        
        // Create a simple success sound
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        
        // Frequency ramp - sound effect
        oscillator.frequency.exponentialRampToValueAtTime(
            800,
            context.currentTime + 0.1
        );
        
        // Fade out
        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + 0.3
        );
        
        // Stop after 0.3 seconds
        oscillator.stop(context.currentTime + 0.3);
    } catch (error) {
        console.log('Audio not supported in this browser');
    }
}

// Undo a habit log for today
function undoHabitLog(habitId) {
    const habit = habits.find(h => h.id === habitId);
    
    if (habit) {
        // Use the helper function for consistent date formatting
        const today = formatDate(new Date());
        
        // Find and remove today's log
        const existingLogIndex = habit.logs.findIndex(log => log.date === today);
        
        if (existingLogIndex >= 0) {
            habit.logs.splice(existingLogIndex, 1);
            saveHabits();
            renderHabitList();
            
            // Update calendar if this habit is currently selected
            if (habitSelect.value === habitId) {
                renderCalendar();
            }
            
            // Update heat map
            updateHeatMap();
        }
    }
}

// Edit a habit
function editHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    
    if (habit) {
        const newName = prompt('Edit habit name:', habit.name);
        
        if (newName && newName.trim()) {
            habit.name = newName.trim();
            saveHabits();
            renderHabitList();
            updateHabitSelector();
        }
    }
}

// Delete a habit
function deleteHabit(habitId) {
    if (confirm('Are you sure you want to delete this habit?')) {
        habits = habits.filter(h => h.id !== habitId);
        saveHabits();
        renderHabitList();
        updateHabitSelector();
        
        // Clear calendar if deleted habit was selected
        if (habitSelect.value === habitId) {
            habitSelect.value = '';
            calendarEl.innerHTML = '';
            currentStreakEl.textContent = '0';
        }
        
        // Update heat map
        updateHeatMap();
    }
}

// Update habit selector dropdown
function updateHabitSelector() {
    // Save current selection
    const currentSelection = habitSelect.value;
    
    // Clear options except the placeholder
    habitSelect.innerHTML = '<option value="">Select a habit</option>';
    
    // Add habit options
    habits.forEach(habit => {
        const option = document.createElement('option');
        option.value = habit.id;
        option.textContent = habit.name;
        habitSelect.appendChild(option);
    });
    
    // Restore selection if possible
    if (currentSelection && habits.some(h => h.id === currentSelection)) {
        habitSelect.value = currentSelection;
    }
}

// Render calendar for selected habit
function renderCalendar() {
    calendarEl.innerHTML = '';
    
    const habitId = habitSelect.value;
    
    if (!habitId) {
        return;
    }
    
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) {
        return;
    }
    
    // Get current date and month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Add day of week labels
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'day-label';
        dayLabel.textContent = day;
        calendarEl.appendChild(dayLabel);
    });
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarEl.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        // Use the helper function for consistent date formatting
        const dateString = formatDate(date);
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        // Check if habit was completed on this day
        const log = habit.logs.find(log => log.date === dateString);
        
        if (log) {
            dayEl.classList.add(log.status);
        }
        
        // Highlight today
        if (day === today.getDate()) {
            dayEl.classList.add('today');
        }
        
        calendarEl.appendChild(dayEl);
    }
    
    // Calculate current streak
    const streak = calculateStreak(habit);
    currentStreakEl.textContent = streak;
}

// Calculate current streak for a habit
function calculateStreak(habit) {
    if (!habit.logs.length) return 0;
    
    // Sort logs by date (newest first)
    const sortedLogs = [...habit.logs]
        .filter(log => log.status === 'completed')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedLogs.length === 0) return 0;
    
    let streak = 1;
    let currentDate = new Date(sortedLogs[0].date);
    
    // Check if the most recent log is from today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayFormatted = formatDate(today);
    const yesterdayFormatted = formatDate(yesterday);
    
    // If the most recent log is not from today or yesterday, streak is broken
    if (sortedLogs[0].date !== todayFormatted && sortedLogs[0].date !== yesterdayFormatted) {
        return 0;
    }
    
    // Count consecutive days
    for (let i = 1; i < sortedLogs.length; i++) {
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateFormatted = formatDate(prevDate);
        
        // If dates are consecutive, increase streak
        if (sortedLogs[i].date === prevDateFormatted) {
            streak++;
            currentDate = new Date(sortedLogs[i].date);
        } else {
            break;
        }
    }
    
    return streak;
}

// Toggle calendar visibility
function toggleCalendar() {
    const isVisible = calendarContent.style.display !== 'none';
    
    if (isVisible) {
        // Hide calendar
        calendarContent.style.display = 'none';
        calendarToggleIcon.textContent = '+';
        calendarToggleIcon.classList.remove('open');
    } else {
        // Show calendar
        calendarContent.style.display = 'block';
        calendarToggleIcon.textContent = '×';
        calendarToggleIcon.classList.add('open');
        
        // Render calendar if a habit is selected
        if (habitSelect.value) {
            renderCalendar();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 
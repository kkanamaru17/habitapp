# HabitApp

A simple, lightweight habit tracking web application. This app allows you to track your daily habits with unlimited logging and habit creation, all with a clean black and white interface.

## Features

- Add unlimited number of habits
- Log habits as completed or skipped unlimited times per day
- Calendar view to see which days you've logged habits
- Track your current streak for each habit
- Simple, clean black and white design
- Works on both desktop and mobile browsers
- Data stored locally in your browser (no account needed)

## How to Use

1. **Add a Habit**: Enter a habit name in the input field and click "Add Habit" or press Enter.
2. **Log a Habit**: Click "Done" to mark a habit as completed for today, or "Skip" to mark it as skipped.
3. **View Calendar**: Select a habit from the dropdown to see its calendar view, showing which days you've completed or skipped the habit.
4. **Edit or Delete**: After logging a habit for the day, you can edit its name or delete it entirely.

## Deployment

This app is designed to be easily deployed on GitHub Pages for free hosting:

1. Fork or clone this repository to your GitHub account.
2. Go to your repository settings.
3. Navigate to the "Pages" section.
4. Select the branch you want to deploy (usually `main` or `master`).
5. Click "Save" and wait for GitHub to build and deploy your site.
6. Your app will be available at `https://[your-username].github.io/[repository-name]/`

Alternatively, you can deploy to any static site hosting service like Netlify, Vercel, or Surge.

## Local Development

To run the app locally:

1. Clone the repository to your local machine.
2. Open the `index.html` file in your web browser.

No build process or server is required as this is a pure HTML, CSS, and JavaScript application.

## Data Storage

All data is stored in your browser's localStorage. This means:

- Your data stays on your device and is not sent to any server.
- Clearing your browser data will erase your habit data.
- Different browsers or devices will have separate data stores.

To backup your data, you can use browser extensions that can export localStorage data. 
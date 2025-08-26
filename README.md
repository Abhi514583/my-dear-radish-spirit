# My Dear Radish Spirit 🌱

A gentle journaling app with AI-powered weekly summaries, built with React Native and Expo.

## Features

### Core Journaling

- Daily mood tracking (1-10 slider)
- Text journaling with character count
- SQLite offline storage
- Streak calculation and tracking
- Calendar view of past entries
- Insights dashboard with metrics

### AI Weekly Summaries (Sprint 3)

- Powered by Gemini 2.0 Flash-Lite
- Empathetic, non-clinical summaries
- Weekly focus suggestions
- Requires 7+ entries to unlock

### Notifications & Settings

- Daily reminder notifications (8:00 PM)
- Export data (JSON + CSV formats)
- Delete all data with confirmation
- Settings screen with clean UI

### Design & Accessibility

- Light/Dark theme support
- Accessibility features (screen reader support, touch targets)
- Performance optimizations (FlatList, memoization)
- Error boundaries and retry logic

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Gemini AI (Required for Weekly Summaries)

**IMPORTANT**: To enable AI weekly summaries, you need to add your Gemini API key:

1. **Get your Gemini API key** from: https://aistudio.google.com/app/apikey

2. **Create a `.env` file** in the project root directory (`MyDearRadishSpirit/.env`)

3. **Add your API key** to the `.env` file:

```env
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

**📍 File Location**: The `.env` file should be located at:

```
MyDearRadishSpirit/
├── .env                    ← CREATE THIS FILE HERE
├── app.config.ts
├── package.json
└── src/
```

**⚠️ Security Note**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

### 3. Run the App

```bash
npx expo start
```

## Optional Features

### Mascot Animation

To add the radish mascot animation:

1. Place your Lottie animation file at: `MyDearRadishSpirit/assets/radish_idle.json`
2. Uncomment the Lottie code in `src/screens/TodayScreen.tsx` (see comments in MascotSlot component)
3. The mascot will appear on the Today screen footer
4. If no file exists, the app works normally without the mascot

**Note**: The mascot feature is currently disabled by default to prevent build errors when the Lottie file doesn't exist.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── data/               # Database layer (SQLite)
├── hooks/              # Custom React hooks
├── screens/            # Screen components
├── services/           # External services (AI, Notifications)
├── theme/              # Theme and styling
└── utils/              # Utility functions
```

## Development Notes

- **Offline-first**: No network required for core functionality
- **Minimal dependencies**: Only essential packages included
- **Production-ready**: Error handling, accessibility, performance optimized
- **Type-safe**: Full TypeScript implementation

## Troubleshooting

### AI Summaries Not Working

1. Check that your `.env` file exists in the correct location
2. Verify your Gemini API key is valid
3. Ensure you have 7+ journal entries
4. Check the console for error messages

### Notifications Not Working

1. Grant notification permissions when prompted
2. Check device notification settings
3. Ensure the app has background app refresh enabled

## License

MIT License - feel free to use this code for your own projects!

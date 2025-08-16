# LeetTracker Chrome Extension Installation Guide

## Prerequisites

1. **Backend API Running**: Make sure your LeetTracker backend is running on `http://localhost:5000`
   ```bash
   cd backend
   npm run dev
   ```

2. **Chrome Browser**: You need Google Chrome or any Chromium-based browser

## Installation Steps

### Method 1: Load Unpacked Extension (Development)

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in your address bar
   - Or go to Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to your project folder: `c:\NITH\WD\LeetTracker\chrome-extension`
   - Select the `chrome-extension` folder and click "Select Folder"

4. **Verify Installation**
   - You should see "LeetTracker" in your extensions list
   - The extension icon should appear in your browser toolbar
   - Make sure it's enabled (toggle switch is on)

### Method 2: Create CRX Package (Production)

1. **Pack Extension**
   - In Chrome Extensions page (`chrome://extensions/`)
   - Click "Pack extension"
   - Select the `chrome-extension` folder as Extension root directory
   - Click "Pack Extension"

2. **Install CRX File**
   - This creates a `.crx` file that can be distributed
   - Users can install it by dragging the `.crx` file to Chrome Extensions page

## Testing the Extension

### 1. Test Backend Connection
1. Click the LeetTracker icon in your toolbar
2. The popup should open and show your dashboard
3. If there are connection errors, check that your backend is running

### 2. Test on LeetCode
1. Go to any LeetCode problem page (e.g., https://leetcode.com/problems/two-sum/)
2. You should see a "📊 LeetTracker Active" indicator in the top-right corner
3. Try solving a problem - you should get a congratulations notification

### 3. Test Problem Tracking
1. On a LeetCode problem page, click the LeetTracker icon
2. Fill out the "Add Problem" form
3. Click "Add Problem" - it should sync with your backend

## Features Overview

### 🎯 Dashboard Features
- **Daily Stats**: Today's problems solved, streak, and progress
- **Problem Breakdown**: Easy/Medium/Hard problem counts
- **Quick Actions**: Add problems, view analytics, settings
- **Recent Activity**: Last solved problems with details

### 🔄 Auto-Detection Features
- **Problem Recognition**: Automatically detects current LeetCode problem
- **Success Notifications**: Celebrates when you solve problems
- **Smart Forms**: Pre-fills problem details from page content

### 🔔 Background Features
- **Daily Reminders**: Optional notifications to maintain coding streak
- **Auto-Sync**: Keeps data synchronized with backend
- **Offline Support**: Caches data for offline viewing

## Troubleshooting

### Extension Not Loading
- Check that you selected the correct folder (`chrome-extension`)
- Look for errors in the Extensions page
- Make sure all files are present

### Backend Connection Issues
- Verify backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Test API directly: visit `http://localhost:5000/api/v1/health`

### LeetCode Integration Not Working
- Make sure you're on a LeetCode problem page
- Check if content script loaded (look for the indicator)
- Try refreshing the page

### Notifications Not Showing
- Check Chrome notification permissions
- Go to Chrome Settings → Privacy and Security → Site Settings → Notifications
- Make sure notifications are allowed for extensions

## Permissions Explained

The extension requests these permissions:

- **`activeTab`**: To read LeetCode problem information from current tab
- **`storage`**: To save your preferences and cache data locally
- **`notifications`**: To show success notifications and reminders
- **`alarms`**: For daily reminders and periodic sync
- **`host_permissions`**: Access to LeetCode and your local backend API

## Development Mode

When running in development mode:

1. **Hot Reload**: Changes to popup files are reflected immediately
2. **Console Debugging**: Check browser console and extension console for logs
3. **Storage Inspection**: Use Chrome DevTools to inspect extension storage
4. **Network Monitoring**: Monitor API calls in Network tab

## File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Main dashboard UI
├── popup.css              # Styling with shadcn/ui theme
├── popup.js               # Dashboard logic and API integration
├── content.js             # LeetCode page integration
├── background.js          # Service worker for background tasks
├── icons/                 # Extension icons
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md              # This installation guide
```

## Next Steps

1. **Customize Settings**: Click the settings icon in popup to configure preferences
2. **Set Daily Goals**: Set your daily problem-solving target
3. **Enable Notifications**: Turn on daily reminders to maintain streak
4. **Share Progress**: Use the analytics to track your coding journey

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your backend API is responding
3. Try reloading the extension
4. Check Chrome extension permissions

Happy coding! 🚀

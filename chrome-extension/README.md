# LeetTracker Chrome Extension

A powerful Chrome extension that automatically tracks your LeetCode progress with comprehensive analytics and data synchronization.

## 🚀 Features

### Automatic Data Scraping
- **Profile Setup**: Enter your LeetCode username or profile URL for automatic data collection
- **Complete Sync**: Scrapes all your solved problems with difficulty, language, and tags
- **Current Problem**: Instantly add the problem you're currently viewing
- **Smart Detection**: Automatically detects problem details from LeetCode pages

### Comprehensive Tracking
- **Problem Statistics**: Total problems solved, time spent, difficulty breakdown
- **Language Analytics**: Track which programming languages you use most
- **Tag Analysis**: See which problem categories you've mastered
- **Progress Visualization**: Beautiful charts and progress bars

### Seamless Integration
- **Real-time Sync**: Automatically syncs with your LeetTracker dashboard
- **Background Monitoring**: Tracks when you solve problems on LeetCode
- **Manual Override**: Option to manually add problems when needed
- **Cross-platform**: Works across all your devices

## 📦 Installation

1. **Download the Extension**
   - Clone this repository or download the `chrome-extension` folder
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `chrome-extension` folder

2. **Setup Backend**
   - Ensure your LeetTracker backend is running on `http://localhost:5000`
   - The extension will automatically connect to your local backend

3. **Configure Profile**
   - Click the LeetTracker extension icon
   - Click "Add Current Problem" 
   - Enter your LeetCode username or profile URL
   - Let the extension scrape your existing data

## 🔧 How to Use

### First Time Setup
1. **Install Extension**: Follow installation steps above
2. **Open Extension**: Click the LeetTracker icon in your Chrome toolbar
3. **Setup Profile**: Click "Add Current Problem" → Enter your LeetCode profile
4. **Auto-Scrape**: The extension will automatically import all your solved problems

### Daily Usage
1. **Solve Problems**: Continue solving problems on LeetCode as usual
2. **Auto-Detection**: The extension detects when you solve problems
3. **Quick Add**: Click "Add Current Problem" to manually track a problem
4. **View Progress**: Check your stats directly in the extension popup
5. **Full Dashboard**: Click "View Full Dashboard" for detailed analytics

### Manual Problem Entry
If auto-scraping fails or you want to add custom data:
1. Click "Add Current Problem"
2. Toggle "Show Manual Form"
3. Fill in problem details manually
4. Submit to add to your tracker

## 🎯 Features in Detail

### Profile Auto-Scraping
```
✅ Scrapes solved problems from your LeetCode profile
✅ Extracts problem titles, IDs, difficulty levels
✅ Detects programming languages used
✅ Collects problem tags and categories
✅ Estimates time spent based on difficulty
✅ Handles large numbers of problems efficiently
```

### Smart Problem Detection
```
✅ Automatically fills form from current LeetCode page
✅ Detects problem difficulty from page content
✅ Identifies programming language from editor
✅ Extracts problem tags and metadata
✅ Generates reasonable time estimates
```

### Data Synchronization
```
✅ Real-time sync with backend API
✅ Avoids duplicate problem entries
✅ Updates existing problem data
✅ Handles network errors gracefully
✅ Progress indicators for long operations
```

## 🔧 Configuration

### Backend Connection
The extension automatically connects to:
- **API Endpoint**: `http://localhost:5000/api/v1`
- **Dashboard**: `http://localhost:3000`

### Storage
The extension stores:
- User preferences in Chrome local storage
- LeetCode profile information
- Last sync timestamps
- Problem submission tracking

## 🌟 Advanced Features

### Bulk Data Import
- Import hundreds of problems in one operation
- Intelligent duplicate detection
- Progress tracking with detailed status
- Error handling and retry mechanisms

### Smart Time Estimation
- Difficulty-based time estimates
- Randomized realistic durations
- Historical data analysis
- User behavior patterns

### Tag and Category Analysis
- Automatic tag extraction from LeetCode
- Category-based problem grouping
- Skill area identification
- Learning path recommendations

## 🛠️ Troubleshooting

### Common Issues

**Extension not connecting to backend:**
- Ensure backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Verify API endpoints are accessible

**Profile scraping fails:**
- Check if LeetCode profile is public
- Verify username/URL format is correct
- Try manual problem entry as fallback

**Problems not syncing:**
- Check network connection
- Verify backend database is accessible
- Look for duplicate problem entries

### Debug Mode
Enable developer tools in Chrome to see detailed logs:
1. Right-click extension icon → "Inspect popup"
2. Check console for error messages
3. Network tab shows API calls

## 🚧 Development

### Project Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.js               # Main extension logic
├── popup.css              # Styling
├── content.js             # LeetCode page integration
├── background.js          # Background processes
└── icons/                 # Extension icons
```

### Building from Source
1. Clone the repository
2. Make your changes to the extension files
3. Test locally by loading as unpacked extension
4. Package for distribution using Chrome developer tools

### API Integration
The extension communicates with the LeetTracker backend:
- **Users API**: Create/manage user accounts
- **Problems API**: Add and retrieve problem data
- **Analytics API**: Get statistics and insights

## 📄 License

This project is part of the LeetTracker application suite. See the main repository for license information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review browser console logs
- Create an issue in the main repository
- Ensure backend and frontend are properly configured

// Background service worker for LeetTracker Chrome extension
// This handles background tasks, notifications, and communication between content scripts and popup

// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api/v1',
    NOTIFICATIONS_ENABLED: true,
    SYNC_INTERVAL: 5 * 60 * 1000 // 5 minutes
};

// Initialize service worker
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // First time installation
        console.log('LeetTracker extension installed');
        setupInitialData();
    } else if (details.reason === 'update') {
        // Extension updated
        console.log('LeetTracker extension updated');
    }
});

// Setup initial data and preferences
async function setupInitialData() {
    try {
        // Set default preferences
        await chrome.storage.local.set({
            preferences: {
                notifications: true,
                autoSync: true,
                dailyGoal: 1,
                theme: 'light'
            },
            stats: {
                totalSolved: 0,
                streak: 0,
                lastSolvedDate: null
            }
        });
        
        // Create notification for successful setup
        if (CONFIG.NOTIFICATIONS_ENABLED) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'LeetTracker Ready!',
                message: 'Your coding journey tracking starts now. Happy coding! 🚀'
            });
        }
    } catch (error) {
        console.error('Error setting up initial data:', error);
    }
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'addProblem':
            handleAddProblem(request.problemInfo).then(sendResponse);
            return true; // Will respond asynchronously
            
        case 'syncData':
            handleSyncData().then(sendResponse);
            return true;
            
        case 'getDailyStats':
            handleGetDailyStats().then(sendResponse);
            return true;
            
        case 'openPopup':
            chrome.action.openPopup();
            sendResponse({ success: true });
            break;
            
        case 'createNotification':
            createNotification(request.options);
            sendResponse({ success: true });
            break;
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// Handle adding a problem
async function handleAddProblem(problemInfo) {
    try {
        // Get user data from storage
        const { currentUser } = await chrome.storage.local.get('currentUser');
        if (!currentUser) {
            throw new Error('No user found. Please set up your profile first.');
        }
        
        // Prepare problem data
        const problemData = {
            title: problemInfo.title,
            difficulty: problemInfo.difficulty || 'Medium',
            language: problemInfo.language || 'JavaScript',
            tags: problemInfo.tags || [],
            notes: problemInfo.notes || '',
            url: problemInfo.url || '',
            userId: currentUser.id
        };
        
        // Add problem via API
        const response = await fetch(`${CONFIG.API_BASE_URL}/problems`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(problemData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add problem');
        }
        
        const result = await response.json();
        
        // Update local storage
        await updateLocalStats();
        
        // Show success notification
        if (CONFIG.NOTIFICATIONS_ENABLED) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Problem Added! 🎉',
                message: `Successfully tracked: ${problemInfo.title}`
            });
        }
        
        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error adding problem:', error);
        
        // Show error notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Error Adding Problem',
            message: error.message
        });
        
        return { success: false, error: error.message };
    }
}

// Handle data synchronization
async function handleSyncData() {
    try {
        const { currentUser } = await chrome.storage.local.get('currentUser');
        if (!currentUser) {
            return { success: false, error: 'No user found' };
        }
        
        // Fetch latest stats from API
        const [statsResponse, problemsResponse] = await Promise.all([
            fetch(`${CONFIG.API_BASE_URL}/analytics/user/${currentUser.id}`),
            fetch(`${CONFIG.API_BASE_URL}/problems/user/${currentUser.id}?limit=10`)
        ]);
        
        if (!statsResponse.ok || !problemsResponse.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const stats = await statsResponse.json();
        const problems = await problemsResponse.json();
        
        // Update local storage
        await chrome.storage.local.set({
            cachedStats: stats.data,
            recentProblems: problems.data.problems,
            lastSync: Date.now()
        });
        
        return { success: true, stats: stats.data, problems: problems.data.problems };
    } catch (error) {
        console.error('Error syncing data:', error);
        return { success: false, error: error.message };
    }
}

// Get daily statistics
async function handleGetDailyStats() {
    try {
        const { currentUser } = await chrome.storage.local.get('currentUser');
        if (!currentUser) {
            return { success: false, error: 'No user found' };
        }
        
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${CONFIG.API_BASE_URL}/daily-summary/user/${currentUser.id}/date/${today}`);
        
        if (response.status === 404) {
            // No problems solved today
            return { success: true, data: null };
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch daily stats');
        }
        
        const result = await response.json();
        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error getting daily stats:', error);
        return { success: false, error: error.message };
    }
}

// Update local statistics
async function updateLocalStats() {
    try {
        const { currentUser } = await chrome.storage.local.get('currentUser');
        if (!currentUser) return;
        
        // Fetch updated stats
        const response = await fetch(`${CONFIG.API_BASE_URL}/analytics/user/${currentUser.id}`);
        if (response.ok) {
            const stats = await response.json();
            await chrome.storage.local.set({
                cachedStats: stats.data,
                lastSync: Date.now()
            });
        }
    } catch (error) {
        console.error('Error updating local stats:', error);
    }
}

// Create notification
function createNotification(options) {
    if (!CONFIG.NOTIFICATIONS_ENABLED) return;
    
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: options.title || 'LeetTracker',
        message: options.message || '',
        ...options
    });
}

// Set up periodic sync
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'syncData') {
        handleSyncData();
    } else if (alarm.name === 'dailyReminder') {
        sendDailyReminder();
    }
});

// Setup periodic alarms
chrome.runtime.onStartup.addListener(() => {
    // Setup sync alarm
    chrome.alarms.create('syncData', {
        delayInMinutes: 5,
        periodInMinutes: 5
    });
    
    // Setup daily reminder
    chrome.alarms.create('dailyReminder', {
        when: getNextReminderTime(),
        periodInMinutes: 24 * 60 // Daily
    });
});

// Get next reminder time (9 AM next day)
function getNextReminderTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM
    return tomorrow.getTime();
}

// Send daily reminder notification
async function sendDailyReminder() {
    try {
        const { preferences } = await chrome.storage.local.get('preferences');
        if (!preferences?.notifications) return;
        
        const today = new Date().toISOString().split('T')[0];
        const dailyStats = await handleGetDailyStats();
        
        if (!dailyStats.success || !dailyStats.data) {
            // No problems solved today, send reminder
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Daily Coding Reminder 📚',
                message: 'Haven\'t solved any problems today. Keep your streak going!'
            });
        }
    } catch (error) {
        console.error('Error sending daily reminder:', error);
    }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup, but we can add additional logic here if needed
    console.log('Extension icon clicked');
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
    // Open extension popup when notification is clicked
    chrome.action.openPopup();
    chrome.notifications.clear(notificationId);
});

// Clean up old data periodically
setInterval(async () => {
    try {
        const { lastSync } = await chrome.storage.local.get('lastSync');
        if (lastSync && Date.now() - lastSync > 24 * 60 * 60 * 1000) {
            // Clear old cached data if not synced for 24 hours
            await chrome.storage.local.remove(['cachedStats', 'recentProblems']);
        }
    } catch (error) {
        console.error('Error cleaning up old data:', error);
    }
}, 60 * 60 * 1000); // Check every hour

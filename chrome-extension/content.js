// Content script for LeetCode integration
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        API_BASE_URL: 'http://localhost:5000/api/v1',
        STORAGE_KEY: 'leetracker_data'
    };
    
    // Initialize content script
    function init() {
        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    }
    
    // Setup content script functionality
    function setup() {
        // Add LeetTracker indicator to the page
        addLeetTrackerIndicator();
        
        // Listen for problem submission
        observeProblemSubmission();
        
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener(handleMessage);
    }
    
    // Add visual indicator that LeetTracker is active
    function addLeetTrackerIndicator() {
        // Only add if not already present
        if (document.getElementById('leetracker-indicator')) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'leetracker-indicator';
        indicator.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #3b82f6, #9333ea);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                📊 LeetTracker Active
            </div>
        `;
        
        // Add hover effect
        const indicatorDiv = indicator.firstElementChild;
        indicatorDiv.addEventListener('mouseenter', () => {
            indicatorDiv.style.transform = 'scale(1.05)';
        });
        indicatorDiv.addEventListener('mouseleave', () => {
            indicatorDiv.style.transform = 'scale(1)';
        });
        
        // Click to open extension
        indicatorDiv.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'openPopup' });
        });
        
        document.body.appendChild(indicator);
    }
    
    // Observe for successful problem submissions
    function observeProblemSubmission() {
        // Look for success notifications
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check for success message
                        if (node.textContent && 
                            (node.textContent.includes('Accepted') || 
                             node.textContent.includes('Success'))) {
                            handleProblemSolved();
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Handle when a problem is solved
    function handleProblemSolved() {
        const problemInfo = extractProblemInfo();
        if (problemInfo.title) {
            // Store solved problem info for popup to access
            chrome.storage.local.set({
                lastSolvedProblem: {
                    ...problemInfo,
                    timestamp: Date.now()
                }
            });
            
            // Show congratulations notification
            showSolvedNotification(problemInfo);
        }
    }
    
    // Show notification when problem is solved
    function showSolvedNotification(problemInfo) {
        // Remove existing notification
        const existing = document.getElementById('leetracker-solved-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.id = 'leetracker-solved-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 16px;
                border-radius: 12px;
                max-width: 300px;
                z-index: 10001;
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease-out;
            ">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 20px;">🎉</span>
                    <strong>Problem Solved!</strong>
                </div>
                <div style="font-size: 14px; margin-bottom: 12px;">
                    Great job solving: <strong>${problemInfo.title}</strong>
                </div>
                <button id="leetracker-add-now" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    margin-right: 8px;
                ">Add to LeetTracker</button>
                <button id="leetracker-dismiss" style="
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.8);
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                ">Dismiss</button>
            </div>
        `;
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Add event listeners
        document.getElementById('leetracker-add-now').addEventListener('click', () => {
            chrome.runtime.sendMessage({ 
                action: 'addProblem', 
                problemInfo: problemInfo 
            });
            notification.remove();
        });
        
        document.getElementById('leetracker-dismiss').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
    
    // Extract problem information from current page
    function extractProblemInfo() {
        try {
            // Extract problem title
            const titleElement = document.querySelector('[data-cy="question-title"]') || 
                               document.querySelector('.css-v3d350') ||
                               document.querySelector('h1');
            const title = titleElement ? titleElement.textContent.trim() : '';
            
            // Extract problem ID from URL
            const urlMatch = window.location.pathname.match(/\/problems\/([^\/]+)/);
            const problemSlug = urlMatch ? urlMatch[1] : '';
            
            // Extract difficulty
            const difficultyElement = document.querySelector('[diff]') ||
                                    document.querySelector('.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard') ||
                                    document.querySelector('[class*="difficulty"]');
            let difficulty = '';
            if (difficultyElement) {
                const text = difficultyElement.textContent.toLowerCase();
                if (text.includes('easy')) difficulty = 'Easy';
                else if (text.includes('medium')) difficulty = 'Medium';
                else if (text.includes('hard')) difficulty = 'Hard';
            }
            
            // Try to get problem number from title
            let problemId = '';
            const numberMatch = title.match(/^(\d+)\./);
            if (numberMatch) {
                problemId = numberMatch[1];
            }
            
            // Get current language (from editor or URL)
            let language = 'JavaScript'; // Default
            const languageElement = document.querySelector('[class*="language"], [data-mode]');
            if (languageElement) {
                const langText = languageElement.textContent || languageElement.getAttribute('data-mode') || '';
                if (langText.toLowerCase().includes('python')) language = 'Python';
                else if (langText.toLowerCase().includes('java')) language = 'Java';
                else if (langText.toLowerCase().includes('c++')) language = 'C++';
                else if (langText.toLowerCase().includes('typescript')) language = 'TypeScript';
            }
            
            return {
                title: title.replace(/^\d+\.\s*/, ''), // Remove number prefix
                id: problemId,
                difficulty: difficulty,
                language: language,
                slug: problemSlug,
                url: window.location.href
            };
        } catch (err) {
            console.error('Error extracting problem info:', err);
            return {};
        }
    }
    
    // Handle messages from popup or background script
    function handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'getProblemInfo':
                sendResponse(extractProblemInfo());
                break;
            case 'ping':
                sendResponse({ status: 'active' });
                break;
            default:
                sendResponse({ error: 'Unknown action' });
        }
    }
    
    // Initialize when script loads
    init();
    
})();

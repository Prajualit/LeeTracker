// Extension state
let currentUser = null;
let userStats = null;
const API_BASE_URL = 'http://localhost:5000/api/v1';

// DOM elements
const loading = document.getElementById('loading');
const content = document.getElementById('content');
const error = document.getElementById('error');
const addProblemModal = document.getElementById('add-problem-modal');

// Initialize extension
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeExtension();
    } catch (err) {
        showError('Failed to initialize extension');
        console.error('Initialization error:', err);
    }
});

// Initialize extension data
async function initializeExtension() {
    showLoading();
    
    try {
        // Get or create user
        const username = await getStoredUsername() || 'default_user';
        currentUser = await getOrCreateUser(username);
        
        if (!currentUser) {
            throw new Error('Failed to get user data');
        }
        
        // Load user statistics
        await loadUserStats();
        
        // Show main content
        showContent();
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (err) {
        showError(err.message);
        throw err;
    }
}

// API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
    }
    
    return response.json();
}

// User management
async function getOrCreateUser(username) {
    try {
        const response = await apiCall('/users', 'POST', { username });
        return response.data;
    } catch (err) {
        console.error('Error creating/getting user:', err);
        return null;
    }
}

async function loadUserStats() {
    if (!currentUser) return;
    
    try {
        const response = await apiCall(`/users/${currentUser.id}/stats`);
        userStats = response.data;
        updateStatsDisplay();
    } catch (err) {
        console.error('Error loading user stats:', err);
        throw new Error('Failed to load user statistics');
    }
}

// Update UI with user stats
function updateStatsDisplay() {
    if (!userStats) return;
    
    // Update username
    document.getElementById('username').textContent = userStats.user.username;
    
    // Update total stats
    document.getElementById('total-problems').textContent = userStats.totalProblems;
    document.getElementById('total-time').textContent = formatTime(userStats.totalTimeSpent);
    
    // Update difficulty breakdown
    const difficulties = userStats.difficultyBreakdown;
    const total = userStats.totalProblems;
    
    updateDifficultyBar('easy', difficulties.Easy || 0, total);
    updateDifficultyBar('medium', difficulties.Medium || 0, total);
    updateDifficultyBar('hard', difficulties.Hard || 0, total);
    
    // Load recent problems
    loadRecentProblems();
}

function updateDifficultyBar(difficulty, count, total) {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    document.getElementById(`${difficulty}-count`).textContent = count;
    document.getElementById(`${difficulty}-progress`).style.width = `${percentage}%`;
}

async function loadRecentProblems() {
    if (!currentUser) return;
    
    try {
        const response = await apiCall(`/problems/user/${currentUser.id}?limit=3`);
        const problems = response.data.problems;
        
        const container = document.getElementById('recent-problems');
        container.innerHTML = '';
        
        if (problems.length === 0) {
            container.innerHTML = '<p class="text-xs text-muted-foreground">No problems solved yet</p>';
            return;
        }
        
        problems.forEach(problem => {
            const problemElement = createProblemElement(problem);
            container.appendChild(problemElement);
        });
        
    } catch (err) {
        console.error('Error loading recent problems:', err);
    }
}

function createProblemElement(problem) {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between py-1';
    
    const difficultyColor = {
        'Easy': 'text-green-500',
        'Medium': 'text-yellow-500',
        'Hard': 'text-red-500'
    };
    
    div.innerHTML = `
        <div class="flex-1 min-w-0">
            <p class="text-xs font-medium truncate">${problem.title}</p>
            <p class="text-xs text-muted-foreground">${problem.language.name} • ${problem.timeSpentMin}min</p>
        </div>
        <span class="text-xs ${difficultyColor[problem.difficulty.level] || ''}">${problem.difficulty.level}</span>
    `;
    
    return div;
}

// Problem management
async function addProblem(problemData) {
    if (!currentUser) throw new Error('No user found');
    
    const data = {
        ...problemData,
        userId: currentUser.id
    };
    
    try {
        const response = await apiCall('/problems', 'POST', data);
        return response.data;
    } catch (err) {
        console.error('Error adding problem:', err);
        throw new Error('Failed to add problem');
    }
}

// Event listeners
function setupEventListeners() {
    // Add problem button
    document.getElementById('add-problem-btn').addEventListener('click', () => {
        showAddProblemModal();
    });
    
    // View dashboard button
    document.getElementById('view-dashboard-btn').addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:3000' });
    });
    
    // Settings button
    document.getElementById('settings-btn').addEventListener('click', () => {
        // TODO: Implement settings
        console.log('Settings clicked');
    });
    
    // Retry button
    document.getElementById('retry-btn').addEventListener('click', () => {
        initializeExtension();
    });
    
    // Modal controls
    document.getElementById('cancel-btn').addEventListener('click', hideAddProblemModal);
    document.getElementById('add-problem-modal').addEventListener('click', (e) => {
        if (e.target === addProblemModal) {
            hideAddProblemModal();
        }
    });
    
    // Form submission
    document.getElementById('add-problem-form').addEventListener('submit', handleAddProblem);
}

// Modal management
function showAddProblemModal() {
    // Try to auto-fill from current LeetCode page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url.includes('leetcode.com')) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: extractProblemInfo
            }, (results) => {
                if (results && results[0] && results[0].result) {
                    fillProblemForm(results[0].result);
                }
            });
        }
    });
    
    addProblemModal.classList.add('show');
}

function hideAddProblemModal() {
    addProblemModal.classList.remove('show');
    document.getElementById('add-problem-form').reset();
}

function fillProblemForm(problemInfo) {
    if (problemInfo.title) {
        document.getElementById('problem-title').value = problemInfo.title;
    }
    if (problemInfo.id) {
        document.getElementById('problem-id').value = problemInfo.id;
    }
    if (problemInfo.difficulty) {
        document.getElementById('problem-difficulty').value = problemInfo.difficulty;
    }
}

// Handle form submission
async function handleAddProblem(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const problemData = {
        title: formData.get('title') || document.getElementById('problem-title').value,
        leetcodeId: parseInt(document.getElementById('problem-id').value),
        difficultyLevel: document.getElementById('problem-difficulty').value,
        languageName: document.getElementById('problem-language').value,
        timeSpentMin: parseInt(document.getElementById('problem-time').value),
        tagNames: [] // TODO: Add tag support
    };
    
    try {
        // Disable form
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        
        await addProblem(problemData);
        
        // Refresh stats
        await loadUserStats();
        
        // Hide modal
        hideAddProblemModal();
        
        // Show success message (could add a toast here)
        console.log('Problem added successfully!');
        
    } catch (err) {
        console.error('Error adding problem:', err);
        alert('Failed to add problem: ' + err.message);
    } finally {
        // Re-enable form
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Problem';
    }
}

// Utility functions
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

async function getStoredUsername() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['username'], (result) => {
            resolve(result.username);
        });
    });
}

async function setStoredUsername(username) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ username }, resolve);
    });
}

// UI state management
function showLoading() {
    loading.classList.remove('hidden');
    content.classList.add('hidden');
    error.classList.add('hidden');
}

function showContent() {
    loading.classList.add('hidden');
    content.classList.remove('hidden');
    error.classList.add('hidden');
}

function showError(message) {
    loading.classList.add('hidden');
    content.classList.add('hidden');
    error.classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
}

// Content script function (to be injected)
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
                                document.querySelector('.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard');
        let difficulty = '';
        if (difficultyElement) {
            const text = difficultyElement.textContent.toLowerCase();
            if (text.includes('easy')) difficulty = 'Easy';
            else if (text.includes('medium')) difficulty = 'Medium';
            else if (text.includes('hard')) difficulty = 'Hard';
        }
        
        // Try to get problem number
        let problemId = '';
        const numberMatch = title.match(/^(\d+)\./);
        if (numberMatch) {
            problemId = numberMatch[1];
        }
        
        return {
            title: title.replace(/^\d+\.\s*/, ''), // Remove number prefix
            id: problemId,
            difficulty: difficulty,
            slug: problemSlug
        };
    } catch (err) {
        console.error('Error extracting problem info:', err);
        return {};
    }
}

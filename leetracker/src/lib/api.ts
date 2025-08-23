import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // Add auth token here if you implement authentication
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response; // Return the full response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    } else if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error');
    }
    
    return Promise.reject(error);
  }
);

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

interface ProblemStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  totalTime: number;
  averageTime: number;
  streak: number;
  lastSolved: string | null;
}

interface RecentProblem {
  id: string;
  title: string;
  difficulty: {
    level: string;
  };
  language: {
    name: string;
  };
  timeSpentMin: number;
  solvedAt: string;
  tags: Array<{ name: string }>;
}

interface UserAnalytics {
  user: {
    id: string;
    username: string;
  };
  overview: {
    totalProblems: number;
    totalTimeSpent: number;
    averageTimePerProblem: number;
  };
  difficultyBreakdown: Record<string, { count: number; timeSpent: number }>;
  languageBreakdown: Record<string, { count: number; timeSpent: number }>;
  topTags: Record<string, { count: number; timeSpent: number }>;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

interface ProblemsResponse {
  problems: RecentProblem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProblems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API functions
export const apiService = {
  // Get or create user
  getOrCreateUser: async (username: string) => {
    const response = await api.post('/users', { username });
    return response.data.data;
  },

  // Get user analytics
  getUserAnalytics: async (userId: string): Promise<UserAnalytics> => {
    const response = await api.get<ApiResponse<UserAnalytics>>(`/analytics/user/${userId}`);
    return response.data.data;
  },

  // Get user problems with pagination
  getUserProblems: async (userId: string, page = 1, limit = 10): Promise<ProblemsResponse> => {
    const response = await api.get<ApiResponse<ProblemsResponse>>(`/problems/user/${userId}`, {
      params: { page, limit }
    });
    return response.data.data;
  },

  // Get recent problems (first page with small limit)
  getRecentProblems: async (userId: string, limit = 4): Promise<RecentProblem[]> => {
    const response = await api.get<ApiResponse<ProblemsResponse>>(`/problems/user/${userId}`, {
      params: { page: 1, limit }
    });
    return response.data.data.problems;
  },

  // Health check
  healthCheck: async (): Promise<{ success: boolean; message: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Helper function to calculate streak (since backend doesn't provide it yet)
export const calculateStreak = (problems: RecentProblem[]): number => {
  if (!problems.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sortedProblems = problems.sort((a, b) => 
    new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime()
  );

  const uniqueDates = new Set<string>();
  sortedProblems.forEach(problem => {
    const date = new Date(problem.solvedAt);
    date.setHours(0, 0, 0, 0);
    uniqueDates.add(date.toISOString());
  });

  const uniqueDatesArray = Array.from(uniqueDates).sort().reverse();
  let streak = 0;
  const checkDate = new Date(today);

  for (let i = 0; i < uniqueDatesArray.length; i++) {
    const problemDate = new Date(uniqueDatesArray[i]);
    const daysDiff = Math.floor((checkDate.getTime() - problemDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (daysDiff === streak + 1 && streak === 0) {
      // Allow for yesterday if no problems today
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// Transform backend analytics to frontend format
export const transformAnalyticsToStats = (analytics: UserAnalytics, recentProblems: RecentProblem[]): ProblemStats => {
  const { overview, difficultyBreakdown } = analytics;
  
  return {
    total: overview.totalProblems,
    easy: difficultyBreakdown.Easy?.count || 0,
    medium: difficultyBreakdown.Medium?.count || 0,
    hard: difficultyBreakdown.Hard?.count || 0,
    totalTime: overview.totalTimeSpent,
    averageTime: Math.round(overview.averageTimePerProblem),
    streak: calculateStreak(recentProblems),
    lastSolved: recentProblems.length > 0 ? recentProblems[0].solvedAt : null
  };
};

// Transform backend problem format to frontend format
export const transformProblemToFrontend = (problem: RecentProblem) => ({
  id: problem.id,
  title: problem.title,
  difficulty: problem.difficulty.level as 'Easy' | 'Medium' | 'Hard',
  language: problem.language.name,
  timeSpent: problem.timeSpentMin,
  solvedAt: problem.solvedAt
});

export default api;

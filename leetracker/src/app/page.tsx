'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Calendar, 
  Clock, 
  Code, 
  TrendingUp,
  Trophy,
  BarChart3,
  RefreshCw
} from 'lucide-react';

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
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  timeSpent: number;
  solvedAt: string;
}

export default function LeetTrackerDashboard() {
  const [stats, setStats] = useState<ProblemStats | null>(null);
  const [recentProblems, setRecentProblems] = useState<RecentProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      setStats({
        total: 76,
        easy: 45,
        medium: 23,
        hard: 8,
        totalTime: 2340, // minutes
        averageTime: 31, // minutes
        streak: 7,
        lastSolved: '2025-08-16T10:30:00Z'
      });

      setRecentProblems([
        {
          id: 1,
          title: "Two Sum",
          difficulty: "Easy",
          language: "JavaScript",
          timeSpent: 25,
          solvedAt: "2025-08-16T10:30:00Z"
        },
        {
          id: 2,
          title: "Add Two Numbers",
          difficulty: "Medium",
          language: "Python",
          timeSpent: 45,
          solvedAt: "2025-08-16T09:15:00Z"
        },
        {
          id: 3,
          title: "Longest Substring Without Repeating Characters",
          difficulty: "Medium",
          language: "JavaScript",
          timeSpent: 52,
          solvedAt: "2025-08-15T16:20:00Z"
        },
        {
          id: 4,
          title: "Median of Two Sorted Arrays",
          difficulty: "Hard",
          language: "Python",
          timeSpent: 89,
          solvedAt: "2025-08-15T14:10:00Z"
        }
      ]);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading your progress...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LeetTracker</h1>
                <p className="text-sm text-gray-500">Analytics Dashboard</p>
              </div>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(stats?.totalTime || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatTime(stats?.averageTime || 0)} per problem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.streak} days</div>
              <p className="text-xs text-muted-foreground">
                Keep it up! 🔥
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Solved</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.lastSolved ? formatDate(stats.lastSolved) : 'Never'}
              </div>
              <p className="text-xs text-muted-foreground">
                Most recent problem
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Difficulty Breakdown */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Difficulty Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Easy</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-300" 
                        style={{ width: `${(stats?.easy || 0) / (stats?.total || 1) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{stats?.easy}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Medium</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 transition-all duration-300" 
                        style={{ width: `${(stats?.medium || 0) / (stats?.total || 1) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{stats?.medium}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Hard</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all duration-300" 
                        style={{ width: `${(stats?.hard || 0) / (stats?.total || 1) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{stats?.hard}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Problems */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Problems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProblems.map((problem, index) => (
                  <div key={problem.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium">{problem.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={getDifficultyColor(problem.difficulty)}
                          >
                            {problem.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{problem.language}</span>
                          <span>{formatTime(problem.timeSpent)}</span>
                          <span>{formatDate(problem.solvedAt)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          ✓ Solved
                        </div>
                      </div>
                    </div>
                    {index < recentProblems.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Text */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <p className="mb-2">
                📊 This is your detailed analytics dashboard. Use the Chrome extension for quick problem tracking!
              </p>
              <p className="text-sm">
                Install the LeetTracker Chrome extension to automatically track problems while you solve them on LeetCode.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

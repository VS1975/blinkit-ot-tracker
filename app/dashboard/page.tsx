'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OTEntry {
  id: string;
  captainId: string;
  captainName: string;
  purpose: string;
  otEntry: string;
  timestamp: Date | null;
}

interface MonthGroup {
  month: string;
  year: number;
  entries: OTEntry[];
  captains: Record<string, {
    entries: OTEntry[];
    totalHours: number;
  }>;
  totalHours: number;
}

export default function Dashboard() {
  const [entries, setEntries] = useState<OTEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MonthGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Extract hours from OT entry text
  const extractHours = (otEntry: string): number => {
    // Match patterns like "3 HR" or "3 HR OT" or "3 hours"
    const match = otEntry.match(/(\d+)\s*(?:HR|HOURS?|hr|hours?)/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Get month name from date
  const getMonthName = (date: Date): string => {
    return date.toLocaleString('default', { month: 'long' });
  };

  // Group entries by month and then by captain
  const groupByMonth = (data: OTEntry[]): MonthGroup[] => {
    const monthlyGroups: Record<string, MonthGroup> = {};

    data.forEach(entry => {
      if (!entry.timestamp) return;

      const date = new Date(entry.timestamp);
      const month = getMonthName(date);
      const year = date.getFullYear();
      const key = `${month}-${year}`;

      if (!monthlyGroups[key]) {
        monthlyGroups[key] = {
          month,
          year,
          entries: [],
          captains: {},
          totalHours: 0,
        };
      }

      monthlyGroups[key].entries.push(entry);

      // Group by captain within the month
      if (!monthlyGroups[key].captains[entry.captainName]) {
        monthlyGroups[key].captains[entry.captainName] = {
          entries: [],
          totalHours: 0,
        };
      }

      monthlyGroups[key].captains[entry.captainName].entries.push(entry);
      const hours = extractHours(entry.otEntry);
      monthlyGroups[key].captains[entry.captainName].totalHours += hours;
      monthlyGroups[key].totalHours += hours;
    });

    // Convert to array and sort by date (most recent first)
    return Object.values(monthlyGroups).sort((a, b) => {
      const dateA = new Date(`${a.month} 1, ${a.year}`);
      const dateB = new Date(`${b.month} 1, ${b.year}`);
      return dateB.getTime() - dateA.getTime();
    });
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/ot-entries');

        if (response.status === 401) {
          router.push('/admin');
          return;
        }

        const data = await response.json();

        if (response.ok) {
          setEntries(data.entries);
          setFilteredEntries(groupByMonth(data.entries));
        } else {
          setError(data.error || 'Failed to fetch data');
        }
      } catch (error) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Handle search/filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(groupByMonth(entries));
    } else {
      const filtered = entries.filter(entry =>
        entry.captainName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEntries(groupByMonth(filtered));
    }
  }, [searchTerm, entries]);

  // Handle logout
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              OT Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage overtime entries
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by captain name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Dashboard Content */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'No entries found for this search.' : 'No OT entries yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredEntries.map((monthGroup) => (
              <div
                key={`${monthGroup.month}-${monthGroup.year}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                {/* Month Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {monthGroup.month} {monthGroup.year}
                  </h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {monthGroup.totalHours}
                    </p>
                  </div>
                </div>

                {/* Captains within the month */}
                <div className="space-y-4">
                  {Object.entries(monthGroup.captains).map(([captainName, captainData]) => (
                    <div
                      key={captainName}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      {/* Captain Header */}
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                          {captainName}
                        </h3>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {captainData.totalHours} HR
                          </span>
                        </div>
                      </div>

                      {/* Entries for this captain */}
                      <div className="space-y-2">
                        {captainData.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex justify-between items-start p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                  {entry.purpose}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {entry.captainId}
                                </span>
                              </div>
                              <p className="text-sm text-gray-800 dark:text-gray-200">
                                {entry.otEntry}
                              </p>
                              {entry.timestamp && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="ml-3">
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {extractHours(entry.otEntry)} HR
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredEntries.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Months</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {filteredEntries.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Entries</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {entries.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Hours</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {filteredEntries.reduce((sum, month) => sum + month.totalHours, 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

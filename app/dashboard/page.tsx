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

interface GroupedData {
  captainName: string;
  entries: OTEntry[];
  totalHours: number;
}

export default function Dashboard() {
  const [entries, setEntries] = useState<OTEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<GroupedData[]>([]);
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

  // Group entries by captain name and calculate totals
  const groupByCaptain = (data: OTEntry[]): GroupedData[] => {
    const grouped: Record<string, OTEntry[]> = {};

    data.forEach(entry => {
      if (!grouped[entry.captainName]) {
        grouped[entry.captainName] = [];
      }
      grouped[entry.captainName].push(entry);
    });

    return Object.entries(grouped).map(([captainName, entries]) => ({
      captainName,
      entries,
      totalHours: entries.reduce((sum, entry) => sum + extractHours(entry.otEntry), 0),
    })).sort((a, b) => b.totalHours - a.totalHours); // Sort by total hours descending
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
          setFilteredEntries(groupByCaptain(data.entries));
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
      setFilteredEntries(groupByCaptain(entries));
    } else {
      const filtered = entries.filter(entry =>
        entry.captainName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEntries(groupByCaptain(filtered));
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
            {filteredEntries.map((group) => (
              <div
                key={group.captainName}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                {/* Captain Header */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {group.captainName}
                  </h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {group.totalHours}
                    </p>
                  </div>
                </div>

                {/* Entries List */}
                <div className="space-y-3">
                  {group.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                            {entry.purpose}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {entry.captainId}
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                          {entry.otEntry}
                        </p>
                        {entry.timestamp && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                          {extractHours(entry.otEntry)} HR
                        </span>
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Captains</p>
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
                {filteredEntries.reduce((sum, group) => sum + group.totalHours, 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

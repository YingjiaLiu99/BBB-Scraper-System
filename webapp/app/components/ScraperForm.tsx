'use client';

import { useEffect, useState } from 'react';
import { generateCSV, downloadCSV } from '../utils/csv';
import { supabase } from '@/lib/supabase';

type ScraperType = 'businesses' | 'books';

interface Props {
  title: string;
  type: ScraperType;
}

export default function ScraperForm({ type }: Props) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [source, setSource] = useState<string | null>(null);

  // Determine which Supabase table to use
  const tableName = type === 'businesses' ? 'businesses' : 'books';
  const defaultUrl =
    type === 'businesses'
      ? 'https://www.bbb.org/search?filter_category=60548-100&filter_category=60142-000&filter_ratings=A&find_country=USA&find_text=Medical+Billing'
      : 'https://books.toscrape.com/';

  useEffect(() => {
    setUrl(defaultUrl);
  }, [type]);

  const fetchSupabaseData = async () => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.error('Supabase fetch error:', error);
      setError('Failed to load data from Supabase');
    } else {
      setData(data);
      setSource('Supabase');
    }
  };

  useEffect(() => {
    fetchSupabaseData();
  }, [tableName]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSource(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }), // send type here
      });

      const json = await res.json();

      if (json.success) {
        setSource(json.source);
        await fetchSupabaseData(); // re-fetch from Supabase after new insert
      } else {
        setError(json.error || 'Scraping failed.');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const csv = generateCSV(data);
    const fileName = type === 'businesses' ? 'BBB_scraper_output.csv' : 'books_scraper_output.csv';
    downloadCSV(csv, fileName);
  };

  return (
    <div className="container max-w-screen-lg mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">{type} Scraper</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder={`Enter ${type} search URL`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 flex-1"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Scraping...' : 'Submit & Store'}
        </button>
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      {data.length > 0 && (
        <>
          <p className="mb-2 text-sm text-gray-600">
            Showing {data.length} records from: <strong>{source}</strong>
          </p>
          <div className="overflow-x-auto max-h-[400px] overflow-y-scroll">
            <table className="table-auto w-full border-collapse border border-gray-300 mb-4">
              <thead className="bg-gray-100">
                <tr>
                  {Object.keys(data[0] || {}).map((col) => (
                    <th key={col} className="border px-2 py-1 capitalize">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.id || idx} className="even:bg-gray-50">
                    {Object.values(item).map((val, i) => (
                      <td key={i} className="border px-2 py-1">
                        {typeof val === 'string' && val.startsWith('http') ? (
                          <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            Visit
                          </a>
                        ) : val != null ? String(val) : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleDownload} className="bg-green-600 text-white px-4 py-2 rounded">
            Download CSV
          </button>
        </>
      )}
    </div>
  );
}

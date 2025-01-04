'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import type { SupabaseHero } from '@/types';

export default function Home() {
  // State management for form input and data
  const [numberInput, setNumberInput] = useState<number>(0);
  const [heroes, setHeroes] = useState<SupabaseHero[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize data and real-time subscription
  useEffect(() => {
    fetchHeroes();
    const channel = supabase
      .channel('supabase-hero-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supabase-hero'
        },
        () => {
          fetchHeroes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch all heroes from the database
  const fetchHeroes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('supabase-hero')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHeroes(data || []);
    } catch (error) {
      console.error('Error fetching heroes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('supabase-hero')
        .insert([{ number_input: numberInput }]);

      if (error) throw error;
      setNumberInput(0);
    } catch (error) {
      console.error('Error inserting number:', error);
    }
  };

  return (
    <div className="flex flex-col gap-8 min-h-screen p-8">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
        <input
          type="number"
          value={numberInput}
          onChange={(e) => setNumberInput(parseInt(e.target.value) || 0)}
          className="p-2 border rounded text-black w-48"
          placeholder="Enter a number"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>
      </form>

      {/* Data Display */}
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border p-2">ID</th>
                <th className="border p-2">Created At</th>
                <th className="border p-2">Number</th>
              </tr>
            </thead>
            <tbody>
              {heroes.map((hero) => (
                <tr key={hero.supabase_hero_id}>
                  <td className="border p-2">{hero.supabase_hero_id}</td>
                  <td className="border p-2">
                    {new Date(hero.created_at).toLocaleString()}
                  </td>
                  <td className="border p-2">{hero.number_input}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';

export function useScryfallAutocomplete(query: string): { suggestions: string[]; loading: boolean } {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((json: { data: string[] }) => setSuggestions(json.data ?? []))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { suggestions, loading };
}

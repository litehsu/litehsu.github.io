import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useScryfallAutocomplete } from '../hooks/useScryfallAutocomplete';

interface SearchInputProps {
  onSelect: (cardName: string) => void;
}

export function SearchInput({ onSelect }: SearchInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { suggestions, loading } = useScryfallAutocomplete(inputValue);

  return (
    <Autocomplete
      freeSolo
      options={suggestions}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, value) => {
        if (value && typeof value === 'string') onSelect(value);
      }}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search for a card"
          placeholder="e.g. Lightning Bolt"
          fullWidth
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={18} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}

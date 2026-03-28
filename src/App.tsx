import { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { SearchInput } from './components/SearchInput';
import { CardResults } from './components/CardResults';
import { ScryfallResults } from './components/ScryfallResults';
import { usePriceData } from './hooks/usePriceData';
import { useScryfallPrintings } from './hooks/useScryfallPrintings';
import { useExchangeRate } from './hooks/useExchangeRate';
import { useCKPrices } from './hooks/useCKPrices';

export default function App() {
  const { data, loading, error } = usePriceData();
  const jpyToUsd = useExchangeRate();
  const ckPrices = useCKPrices();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const matchingEntries = selectedCard && data
    ? data.cards.filter(
        (c) => c.cardName.toLowerCase() === selectedCard.toLowerCase()
      )
    : [];

  const hasJsonData = matchingEntries.length > 0;

  const { printings, loading: printingsLoading } = useScryfallPrintings(
    selectedCard,
    !selectedCard || hasJsonData
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Hibiki MTG Price Tracker
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        JP vs US buy price comparison
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <SearchInput onSelect={setSelectedCard} />

          {selectedCard && hasJsonData && (
            <CardResults
              cardName={selectedCard}
              entries={matchingEntries}
              lastScraped={data?.lastScraped ?? ''}
              jpyToUsd={jpyToUsd}
              ckPrices={ckPrices}
            />
          )}

          {selectedCard && !hasJsonData && (
            <ScryfallResults
              cardName={selectedCard}
              printings={printings}
              loading={printingsLoading}
              ckPrices={ckPrices}
              jpyToUsd={jpyToUsd}
            />
          )}
        </>
      )}
    </Container>
  );
}

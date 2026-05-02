import { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { SearchInput } from './components/SearchInput';
import { CardResults } from './components/CardResults';
import { ScryfallResults } from './components/ScryfallResults';
import { BuyCartButton } from './components/BuyCartButton';
import { BuyCartSummary } from './components/BuyCartSummary';
import { usePriceData } from './hooks/usePriceData';
import { useScryfallPrintings } from './hooks/useScryfallPrintings';
import { useExchangeRate } from './hooks/useExchangeRate';
import { useCKPrices } from './hooks/useCKPrices';
import { useBuyList } from './hooks/useBuyList';

export default function App() {
  const { data, loading, error } = usePriceData();
  const jpyToUsd = useExchangeRate();
  const { prices: ckPrices, updatedAt: ckUpdatedAt } = useCKPrices();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { items, addItem, updateItem, removeItem, clearAll, total } = useBuyList();

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

  const ckUpdatedLabel = ckUpdatedAt
    ? new Date(ckUpdatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 0 }}>
        <Typography variant="h4" fontWeight={700}>
          Hibiki MTG Price Tracker
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          JP vs US buy price comparison
        </Typography>
        <Typography variant="body2">
          <a href="/#display" target="_blank" rel="noreferrer">Buy List Display →</a>
        </Typography>
        {ckUpdatedLabel && (
          <Typography variant="caption" color="text.disabled">
            · CK prices as of {ckUpdatedLabel}
          </Typography>
        )}
      </Box>

      <BuyCartButton total={total} count={items.length} onClick={() => setCartOpen(true)} />
      <BuyCartSummary
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        total={total}
        onUpdate={updateItem}
        onRemove={removeItem}
        onClearAll={clearAll}
      />

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
              onBuy={addItem}
            />
          )}

          {selectedCard && !hasJsonData && (
            <ScryfallResults
              cardName={selectedCard}
              printings={printings}
              loading={printingsLoading}
              ckPrices={ckPrices}
              jpyToUsd={jpyToUsd}
              onBuy={addItem}
            />
          )}
        </>
      )}
    </Container>
  );
}

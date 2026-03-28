import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CardVariation } from './CardVariation';
import { useScryfallPrices } from '../hooks/useScryfallPrices';
import type { CKPricesMap } from '../hooks/useCKPrices';
import type { CardEntry } from '../types';

interface CardResultsProps {
  cardName: string;
  entries: CardEntry[];
  lastScraped: string;
  jpyToUsd: number | null;
  ckPrices: CKPricesMap | null;
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString();
}

export function CardResults({ cardName, entries, lastScraped, jpyToUsd, ckPrices }: CardResultsProps) {
  const scryfallPrices = useScryfallPrices(entries);

  if (entries.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No pricing data found for "{cardName}".</Typography>
      </Box>
    );
  }

  const sorted = [...entries].sort((a, b) => {
    const setCompare = a.variation.set.localeCompare(b.variation.set);
    if (setCompare !== 0) return setCompare;
    return a.variation.foilType.localeCompare(b.variation.foilType);
  });

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
        <Typography variant="h6">{cardName}</Typography>
        <Typography variant="caption" color="text.secondary">
          Last updated: {formatTimestamp(lastScraped)}
        </Typography>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Set</TableCell>
              <TableCell>Printing</TableCell>
              <TableCell>Foil</TableCell>
              <TableCell>JP Buy Price</TableCell>
              <TableCell>US Buy Price</TableCell>
              <TableCell>TCGPlayer Market</TableCell>
              <TableCell>Richard</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((entry, i) => (
              <CardVariation
                key={`${entry.scryfallId}-${entry.variation.foilType}-${i}`}
                entry={entry}
                scryfallPrices={scryfallPrices}
                jpyToUsd={jpyToUsd}
                ckPrices={ckPrices}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

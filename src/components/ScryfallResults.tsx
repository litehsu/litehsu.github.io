import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { CardImage } from './CardImage';
import { useScryfallPrices, cacheKey } from '../hooks/useScryfallPrices';
import type { ScryfallPrinting } from '../hooks/useScryfallPrintings';
import type { CKPricesMap } from '../hooks/useCKPrices';

interface ScryfallResultsProps {
  cardName: string;
  printings: ScryfallPrinting[];
  loading: boolean;
  ckPrices: CKPricesMap | null;
  jpyToUsd: number | null;
}

function CKPriceCell({ scryfallId, foilType, ckPrices, jpyToUsd }: {
  scryfallId: string;
  foilType: 'non-foil' | 'foil';
  ckPrices: CKPricesMap | null;
  jpyToUsd: number | null;
}) {
  if (ckPrices === null) return <Skeleton variant="text" width={60} />;
  const price = ckPrices.get(scryfallId)?.[foilType];
  if (price === undefined) return <Typography variant="caption" color="text.disabled">—</Typography>;
  return (
    <Stack spacing={0}>
      <Typography variant="body2" fontWeight={600}>${price.toFixed(2)}</Typography>
      {jpyToUsd && (
        <Typography variant="caption" color="text.secondary">
          ≈ ¥{Math.round(price / jpyToUsd).toLocaleString('en-US')}
        </Typography>
      )}
      <Typography variant="caption" color="text.disabled">Card Kingdom</Typography>
    </Stack>
  );
}

export function ScryfallResults({ cardName, printings, loading, ckPrices, jpyToUsd }: ScryfallResultsProps) {
  const scryfallPrices = useScryfallPrices(printings);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (printings.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No results found for "{cardName}".</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
        <Typography variant="h6">{cardName}</Typography>
        <Typography variant="caption" color="text.secondary">via Scryfall</Typography>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Set</TableCell>
              <TableCell>Printing</TableCell>
              <TableCell>Finishes</TableCell>
              <TableCell>TCGPlayer Non-foil</TableCell>
              <TableCell>TCGPlayer Foil</TableCell>
              <TableCell>CK Buy (Non-foil)</TableCell>
              <TableCell>CK Buy (Foil)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {printings.map((p) => {
              const key = cacheKey(p.set, p.collectorNumber);
              const prices = scryfallPrices.get(key);
              const loadingPrice = prices === undefined;

              return (
                <TableRow key={`${p.set}-${p.collectorNumber}`} hover>
                  <TableCell sx={{ py: 1 }}>
                    <CardImage
                      set={p.set}
                      collectorNumber={p.collectorNumber}
                      scryfallId={p.scryfallId}
                      alt={`${cardName} - ${p.set}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{p.set}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.setName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{p.printingLabel}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {p.finishes.map((f) => (
                        <Chip
                          key={f}
                          label={f}
                          size="small"
                          variant={f === 'nonfoil' ? 'outlined' : 'filled'}
                          color={f === 'nonfoil' ? 'default' : 'warning'}
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {loadingPrice ? (
                      <Skeleton variant="text" width={60} />
                    ) : prices?.usd ? (
                      <Typography variant="body2" fontWeight={600}>${prices.usd}</Typography>
                    ) : p.finishes.includes('nonfoil') ? (
                      <Typography variant="caption" color="warning.main">Sold Out</Typography>
                    ) : (
                      <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {loadingPrice ? (
                      <Skeleton variant="text" width={60} />
                    ) : prices?.usd_foil ? (
                      <Typography variant="body2" fontWeight={600}>${prices.usd_foil}</Typography>
                    ) : prices?.usd_etched ? (
                      <Stack spacing={0}>
                        <Typography variant="body2" fontWeight={600}>${prices.usd_etched}</Typography>
                        <Typography variant="caption" color="text.secondary">etched</Typography>
                      </Stack>
                    ) : p.finishes.some((f) => f === 'foil' || f === 'etched') ? (
                      <Typography variant="caption" color="warning.main">Sold Out</Typography>
                    ) : (
                      <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <CKPriceCell scryfallId={p.scryfallId} foilType="non-foil" ckPrices={ckPrices} jpyToUsd={jpyToUsd} />
                  </TableCell>
                  <TableCell>
                    <CKPriceCell scryfallId={p.scryfallId} foilType="foil" ckPrices={ckPrices} jpyToUsd={jpyToUsd} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

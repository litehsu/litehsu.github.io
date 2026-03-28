import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { CardImage } from './CardImage';
import { PriceDisplay } from './PriceDisplay';
import type { CardEntry, ScryfallPrices } from '../types';
import type { CKPricesMap } from '../hooks/useCKPrices';

interface CardVariationProps {
  entry: CardEntry;
  scryfallPrices: Map<string, ScryfallPrices>;
  jpyToUsd: number | null;
  ckPrices: CKPricesMap | null;
}

function cacheKey(set: string, collectorNumber: string) {
  return `${set.toLowerCase()}-${collectorNumber}`;
}

export function CardVariation({ entry, scryfallPrices, jpyToUsd, ckPrices }: CardVariationProps) {
  const { variation, priceHistory, cardName } = entry;
  const current = priceHistory[0];
  const previous = priceHistory.length > 1 ? priceHistory[1] : null;

  const foilKey = variation.foilType as 'non-foil' | 'foil';
  const ckEntry = ckPrices?.get(entry.scryfallId);
  // undefined = not on CK buylist, null = on buylist but < $1, number = actual price
  const ckPrice = ckEntry?.[foilKey];

  const key = cacheKey(variation.set, entry.collectorNumber);
  const sfPrices = scryfallPrices.get(key);
  const isFoil = variation.foilType !== 'non-foil';
  const marketPrice = sfPrices
    ? (isFoil ? sfPrices.usd_foil : sfPrices.usd)
    : undefined;

  return (
    <TableRow hover>
      <TableCell sx={{ py: 1 }}>
        <CardImage set={variation.set} collectorNumber={entry.collectorNumber} scryfallId={entry.scryfallId} alt={`${cardName} - ${variation.set}`} />
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {variation.set}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {variation.setName}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{variation.printing}</Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={variation.foilType}
          size="small"
          variant={variation.foilType === 'non-foil' ? 'outlined' : 'filled'}
          color={variation.foilType === 'non-foil' ? 'default' : 'warning'}
        />
      </TableCell>
      <TableCell>
        <PriceDisplay
          current={current.jpTopBuyPrice}
          previous={previous?.jpTopBuyPrice ?? null}
          previousTimestamp={previous?.timestamp ?? null}
          storeName={current.jpTopBuyStore}
          currency="JPY"
          jpyToUsd={jpyToUsd ?? undefined}
        />
      </TableCell>
      <TableCell>
        {ckPrices === null ? (
          <Skeleton variant="text" width={60} />
        ) : ckPrice === undefined ? (
          <Typography variant="caption" color="text.disabled">—</Typography>
        ) : (
          <Stack spacing={0}>
            <Typography variant="body2" fontWeight={600}>${ckPrice.toFixed(2)}</Typography>
            {jpyToUsd && (
              <Typography variant="caption" color="text.secondary">
                ≈ ¥{Math.round(ckPrice / jpyToUsd).toLocaleString('en-US')}
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled">Card Kingdom</Typography>
          </Stack>
        )}
      </TableCell>
      <TableCell>
        {sfPrices === undefined ? (
          <Skeleton variant="text" width={60} />
        ) : marketPrice ? (
          <Stack spacing={0}>
            <Typography variant="body2" fontWeight={600}>${marketPrice}</Typography>
            <Typography variant="caption" color="text.secondary">TCGPlayer</Typography>
          </Stack>
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        )}
      </TableCell>
      <TableCell>
        {current.richardBuyPrice != null ? (
          <Typography variant="body2" fontWeight={600} color="success.main">
            ${current.richardBuyPrice.toFixed(2)}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        )}
      </TableCell>
    </TableRow>
  );
}

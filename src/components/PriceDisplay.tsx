import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface PriceDisplayProps {
  current: number;
  previous: number | null;
  previousTimestamp: string | null;
  storeName?: string;
  currency: 'JPY' | 'USD';
  jpyToUsd?: number;
}

function formatPrice(amount: number, currency: 'JPY' | 'USD'): string {
  if (currency === 'JPY') {
    return `¥${amount.toLocaleString('en-US')}`;
  }
  return `$${amount.toFixed(2)}`;
}

function relativeTime(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffDays >= 1) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffHr >= 1) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffMin >= 1) return `${diffMin} min ago`;
  return 'just now';
}

export function PriceDisplay({ current, previous, previousTimestamp, storeName, currency, jpyToUsd }: PriceDisplayProps) {
  const hasPrevious = previous !== null && previousTimestamp !== null;
  const changed = hasPrevious ? current - previous! : 0;

  const indicator =
    !hasPrevious || changed === 0 ? (
      <TrendingFlatIcon sx={{ fontSize: 16, color: 'text.disabled', verticalAlign: 'middle' }} />
    ) : changed > 0 ? (
      <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', verticalAlign: 'middle' }} />
    ) : (
      <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main', verticalAlign: 'middle' }} />
    );

  return (
    <Stack spacing={0.25}>
      <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
        {indicator} {formatPrice(current, currency)}
      </Typography>
      {jpyToUsd && currency === 'JPY' && (
        <Typography variant="caption" color="text.secondary">
          ≈ ${(current * jpyToUsd).toFixed(2)}
        </Typography>
      )}
      {storeName && (
        <Typography variant="caption" color="text.secondary">{storeName}</Typography>
      )}
      {hasPrevious ? (
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          was {formatPrice(previous!, currency)} {relativeTime(previousTimestamp!)}
        </Typography>
      ) : (
        <Typography variant="caption" color="text.disabled">
          no previous price
        </Typography>
      )}
    </Stack>
  );
}

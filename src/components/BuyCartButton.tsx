import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface BuyCartButtonProps {
  total: number;
  count: number;
  onClick: () => void;
}

export function BuyCartButton({ total, count, onClick }: BuyCartButtonProps) {
  if (count === 0) return null;

  return (
    <Button
      variant="contained"
      color="success"
      onClick={onClick}
      startIcon={
        <Badge badgeContent={count} color="warning">
          <ShoppingCartIcon />
        </Badge>
      }
      sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1200, boxShadow: 3 }}
    >
      ${total.toFixed(2)}
    </Button>
  );
}

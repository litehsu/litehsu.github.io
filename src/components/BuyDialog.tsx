import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import type { BuyCondition, BuyItem } from '../types';
import { CONDITION_PCTS } from '../types';

const CONDITIONS: BuyCondition[] = ['NM', 'LP', 'MP', 'HP', 'DMG'];

interface BuyDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: Omit<BuyItem, 'id'>) => void;
  cardName: string;
  set: string;
  setName: string;
  printing: string;
  foilType: 'non-foil' | 'foil';
  scryfallId: string;
  ckBuyPrice: number | null;
  tcgPrice: number | null;
}

function calcDefaultBase(ckBuyPrice: number | null, tcgPrice: number | null): number {
  if (ckBuyPrice !== null) return ckBuyPrice;
  if (tcgPrice !== null) return Math.round(tcgPrice * 0.70 * 100) / 100;
  return 0;
}

export function BuyDialog({ open, onClose, onAdd, cardName, set, setName, printing, foilType, scryfallId, ckBuyPrice, tcgPrice }: BuyDialogProps) {
  const defaultBase = calcDefaultBase(ckBuyPrice, tcgPrice);
  const [baseInput, setBaseInput] = useState(defaultBase > 0 ? String(defaultBase) : '');
  const [condition, setCondition] = useState<BuyCondition>('NM');
  const [overrideInput, setOverrideInput] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      const b = calcDefaultBase(ckBuyPrice, tcgPrice);
      setBaseInput(b > 0 ? String(b) : '');
      setCondition('NM');
      setOverrideInput('');
      setQuantity(1);
    }
  }, [open, ckBuyPrice, tcgPrice]);

  const basePrice = parseFloat(baseInput) || 0;
  const overridePrice = overrideInput !== '' ? parseFloat(overrideInput) : null;
  const overrideValid = overrideInput === '' || (parseFloat(overrideInput) > 0 && /^\d+(\.\d{0,2})?$/.test(overrideInput));

  const unitPrice = overridePrice !== null && overrideValid
    ? overridePrice
    : Math.round(basePrice * CONDITION_PCTS[condition] * 100) / 100;
  const total = Math.round(unitPrice * quantity * 100) / 100;

  const canAdd = basePrice > 0 && overrideValid && quantity >= 1;

  function handleAdd() {
    if (!canAdd) return;
    onAdd({
      cardName, set, setName, printing, foilType, scryfallId,
      basePrice,
      condition,
      overridePrice: overridePrice !== null && overrideValid ? overridePrice : null,
      price: unitPrice,
      quantity,
    });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography fontWeight={700}>{cardName}</Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
          <Typography variant="caption" color="text.secondary">{set} · {printing}</Typography>
          <Chip label={foilType} size="small" variant={foilType === 'non-foil' ? 'outlined' : 'filled'} color={foilType === 'non-foil' ? 'default' : 'warning'} />
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Reference prices */}
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 1.5, py: 1 }}>
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">TCGPlayer Sell</Typography>
                <Typography variant="body2" fontWeight={600}>{tcgPrice ? `$${tcgPrice.toFixed(2)}` : '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">CK Buy (NM)</Typography>
                <Typography variant="body2" fontWeight={600}>{ckBuyPrice !== null ? `$${ckBuyPrice.toFixed(2)}` : '—'}</Typography>
              </Box>
            </Stack>
          </Box>

          {/* Base price — only editable when no CK price */}
          {ckBuyPrice === null && (
            <TextField
              label={tcgPrice ? `Base price (70% of TCG $${tcgPrice.toFixed(2)})` : 'Base price'}
              value={baseInput}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || /^\d+(\.\d{0,2})?$/.test(v)) setBaseInput(v);
              }}
              inputProps={{ inputMode: 'decimal' }}
              size="small"
              fullWidth
            />
          )}

          {/* Condition picker */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Condition</Typography>
            <ButtonGroup size="small" fullWidth>
              {CONDITIONS.map((c) => {
                const condPrice = Math.round(basePrice * CONDITION_PCTS[c] * 100) / 100;
                return (
                  <Button
                    key={c}
                    variant={condition === c ? 'contained' : 'outlined'}
                    onClick={() => setCondition(c)}
                    sx={{ flexDirection: 'column', py: 0.5, lineHeight: 1.2 }}
                  >
                    <span style={{ fontWeight: 700 }}>{c}</span>
                    <span style={{ fontSize: '0.65rem' }}>${condPrice.toFixed(2)}</span>
                  </Button>
                );
              })}
            </ButtonGroup>
          </Box>

          {/* Special price override */}
          <TextField
            label="Special price (optional)"
            placeholder="Override calculated price"
            value={overrideInput}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^\d+(\.\d{0,2})?$/.test(v)) setOverrideInput(v);
            }}
            error={!overrideValid}
            helperText={!overrideValid ? 'Enter a positive number (e.g. 12.50)' : ''}
            inputProps={{ inputMode: 'decimal' }}
            size="small"
            fullWidth
          />

          {/* Quantity */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ minWidth: 60 }}>Quantity</Typography>
            <IconButton size="small" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>−</IconButton>
            <Typography variant="body1" fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }}>{quantity}</Typography>
            <IconButton size="small" onClick={() => setQuantity((q) => q + 1)}>+</IconButton>
          </Stack>

          {/* Preview */}
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5 }}>
            <Typography variant="body2">
              Unit price: <strong>${unitPrice.toFixed(2)}</strong>
              {overridePrice !== null && overrideValid && (
                <Typography component="span" variant="caption" color="text.secondary"> (override)</Typography>
              )}
            </Typography>
            <Typography variant="body2">
              Total: <strong>${total.toFixed(2)}</strong>
              {quantity > 1 && <Typography component="span" variant="caption" color="text.secondary"> ({quantity} × ${unitPrice.toFixed(2)})</Typography>}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd} disabled={!canAdd}>
          Add to Buy List
        </Button>
      </DialogActions>
    </Dialog>
  );
}

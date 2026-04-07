import { useState, useRef } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputBase from '@mui/material/InputBase';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import type { BuyItem, BuyCondition } from '../types';
import { CONDITION_PCTS } from '../types';

const CONDITIONS: BuyCondition[] = ['NM', 'LP', 'MP', 'HP', 'DMG'];

interface BuyCartSummaryProps {
  open: boolean;
  onClose: () => void;
  items: BuyItem[];
  total: number;
  onUpdate: (id: string, patch: { condition?: BuyCondition; quantity?: number; overridePrice?: number | null }) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

/** Clickable unit price cell — click to edit, blur/Enter to confirm, empty to revert */
function UnitPriceCell({ item, onUpdate }: { item: BuyItem; onUpdate: BuyCartSummaryProps['onUpdate'] }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setInputVal(item.price.toFixed(2));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commit() {
    const v = parseFloat(inputVal);
    if (inputVal === '' || isNaN(v) || v <= 0) {
      // revert — no change
    } else {
      onUpdate(item.id, { overridePrice: Math.round(v * 100) / 100 });
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <InputBase
        inputRef={inputRef}
        value={inputVal}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '' || /^\d+(\.\d{0,2})?$/.test(v)) setInputVal(v);
        }}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        inputProps={{ inputMode: 'decimal', style: { width: 64, textAlign: 'right', fontWeight: 600 } }}
        sx={{ fontSize: '0.875rem' }}
        autoFocus
      />
    );
  }

  return (
    <Box onClick={startEdit} sx={{ cursor: 'pointer', display: 'inline-block' }}>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ borderBottom: '1px dashed', borderColor: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}
      >
        ${item.price.toFixed(2)}
      </Typography>
      {item.overridePrice !== null && (
        <Typography variant="caption" color="text.secondary" display="block">override</Typography>
      )}
    </Box>
  );
}

export function BuyCartSummary({ open, onClose, items, total, onUpdate, onRemove, onClearAll }: BuyCartSummaryProps) {
  function handleCopy() {
    // TSV format for pasting directly into Google Sheets
    const headers = ['Card Name', 'Set', 'Printing', 'Foil', 'Condition', 'Qty', 'Unit Price', 'Subtotal'];
    const rows = items.map((item) => [
      item.cardName,
      item.set,
      item.printing,
      item.foilType,
      item.condition,
      String(item.quantity),
      item.price.toFixed(2),
      (item.price * item.quantity).toFixed(2),
    ]);
    const totalRow = ['Total', '', '', '', '', '', '', total.toFixed(2)];
    const tsv = [headers, ...rows, [], totalRow]
      .map((row) => row.join('\t'))
      .join('\n');
    navigator.clipboard.writeText(tsv);
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100vw', md: 900 } } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>Buy List</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Divider />

        {/* Table */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
          {items.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Typography color="text.secondary">No items yet.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Card</TableCell>
                    <TableCell>Set</TableCell>
                    <TableCell>Foil</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell align="right">Unit (click to edit)</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{item.cardName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.printing}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.set}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.foilType} size="small" variant={item.foilType === 'non-foil' ? 'outlined' : 'filled'} color={item.foilType === 'non-foil' ? 'default' : 'warning'} />
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={item.condition}
                          onChange={(e) => onUpdate(item.id, { condition: e.target.value as BuyCondition })}
                          sx={{ minWidth: 70 }}
                        >
                          {CONDITIONS.map((c) => (
                            <MenuItem key={c} value={c}>
                              {c} ({Math.round(CONDITION_PCTS[c] * 100)}%)
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) => {
                            const v = parseInt(e.target.value);
                            if (v >= 1) onUpdate(item.id, { quantity: v });
                          }}
                          inputProps={{ min: 1, style: { width: 48 } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <UnitPriceCell item={item} onUpdate={onUpdate} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => onRemove(item.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ px: 3, py: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>Total: ${total.toFixed(2)}</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" color="error" size="small" onClick={onClearAll} disabled={items.length === 0}>
                Clear All
              </Button>
              <Button variant="outlined" size="small" startIcon={<ContentCopyIcon />} onClick={handleCopy} disabled={items.length === 0}>
                Copy for Sheets
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}

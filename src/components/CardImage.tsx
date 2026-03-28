import { useState } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

interface CardImageProps {
  set: string;
  collectorNumber: string;
  scryfallId?: string;
  alt: string;
}

export function CardImage({ set, collectorNumber, scryfallId, alt }: CardImageProps) {
  const imageUri = scryfallId
    ? `https://api.scryfall.com/cards/${scryfallId}?format=image&version=normal`
    : `https://api.scryfall.com/cards/${set.toLowerCase()}/${collectorNumber}?format=image&version=normal`;
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <Box
        sx={{
          width: 60,
          height: 84,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.200',
          borderRadius: 1,
        }}
      >
        <BrokenImageIcon sx={{ color: 'grey.400' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: 60, height: 84, position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
      {!loaded && <Skeleton variant="rectangular" width={60} height={84} />}
      <img
        src={imageUri}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        style={{
          width: 60,
          height: 84,
          objectFit: 'cover',
          display: loaded ? 'block' : 'none',
          borderRadius: 4,
        }}
      />
    </Box>
  );
}

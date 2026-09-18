import { Chip } from '@mui/material';
import { ORDER_STATUS } from '@/utils/constants';

export default function StatusChip({ status, size = 'small' }) {
  const config = ORDER_STATUS[status] ?? { label: status, color: 'default' };
  return <Chip label={config.label} color={config.color} size={size} variant="outlined" />;
}

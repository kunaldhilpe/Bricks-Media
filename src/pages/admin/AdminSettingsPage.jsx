import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useColorMode } from '@/context/ColorModeContext';
import { useCatalog } from '@/context/CatalogContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { readOverlay, resetOverlay } from '@/api/products';
import { clearOrders } from '@/api/orders';
import { formatNumber } from '@/utils/format';

function Panel({ title, description, children }) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, mb: 2.5 }}>
            {description}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  useDocumentTitle('Settings · Console');
  const { mode, setMode } = useColorMode();
  const { productCount, categories, brands, meta, refresh } = useCatalog();
  const { user } = useAuth();
  const toast = useToast();

  const [overlay, setOverlay] = useState(() => readOverlay());
  const [resetCatalogueOpen, setResetCatalogueOpen] = useState(false);
  const [clearOrdersOpen, setClearOrdersOpen] = useState(false);

  const changeCount =
    Object.keys(overlay.updated).length + overlay.created.length + overlay.deleted.length;

  const doResetCatalogue = () => {
    resetOverlay();
    setOverlay(readOverlay());
    refresh();
    setResetCatalogueOpen(false);
    toast.success('Catalogue restored to the shipped products.json.');
  };

  const doClearOrders = () => {
    clearOrders();
    setClearOrdersOpen(false);
    toast.success('Order history cleared for every customer.');
  };

  return (
    <Box>
      <PageHeader
        title="Settings"
        description="What this build stores, where it stores it, and how to put it back."
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          alignItems: 'start',
        }}
      >
        <Panel
          title="Appearance"
          description="The choice is kept per browser and applies to the storefront as well as the console."
        >
          <RadioGroup value={mode} onChange={(event) => setMode(event.target.value)}>
            <FormControlLabel value="light" control={<Radio />} label="Light — gallery white" />
            <FormControlLabel value="dark" control={<Radio />} label="Dark — warm ink" />
          </RadioGroup>
        </Panel>

        <Panel
          title="Catalogue edits"
          description="Admin changes are layered over products.json in localStorage. Nothing is written to the file."
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
            <Chip
              label={`${Object.keys(overlay.updated).length} edited`}
              size="small"
              variant="outlined"
            />
            <Chip label={`${overlay.created.length} added`} size="small" variant="outlined" />
            <Chip label={`${overlay.deleted.length} removed`} size="small" variant="outlined" />
          </Box>
          <Button
            variant="outlined"
            color="error"
            disabled={changeCount === 0}
            onClick={() => setResetCatalogueOpen(true)}
          >
            Restore the shipped catalogue
          </Button>
          {changeCount === 0 && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
              Nothing to restore — the catalogue is exactly as shipped.
            </Typography>
          )}
        </Panel>

        <Panel
          title="Order data"
          description="Orders also live in localStorage, shared across the customer accounts in this browser."
        >
          <Button variant="outlined" color="error" onClick={() => setClearOrdersOpen(true)}>
            Clear all orders
          </Button>
          <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
            This wipes every customer&rsquo;s history and resets the dashboard to zero.
          </Typography>
        </Panel>

        <Panel title="This build">
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Store</TableCell>
                <TableCell align="right">{meta?.appName ?? 'LUXÉ'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Products in play</TableCell>
                <TableCell align="right">{formatNumber(productCount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Labels / categories</TableCell>
                <TableCell align="right">
                  {brands.length} / {categories.length}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Currency</TableCell>
                <TableCell align="right">
                  {meta?.currency ?? 'INR'} ({meta?.currencySymbol ?? '₹'})
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Signed in as</TableCell>
                <TableCell align="right">
                  {user?.name} (@{user?.username})
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Divider sx={{ my: 2.5 }} />

          <Alert severity="warning" variant="outlined">
            There is no server here. Sign-in compares against a public JSON file, no payment is ever
            taken, and every &ldquo;saved&rdquo; change lives in this browser only. Clearing site
            data returns the app to its shipped state.
          </Alert>
        </Panel>
      </Box>

      <ConfirmDialog
        open={resetCatalogueOpen}
        title="Restore the shipped catalogue?"
        description={`${changeCount} local change${changeCount === 1 ? '' : 's'} will be discarded and all 5,200 original pieces will return.`}
        confirmLabel="Restore it"
        cancelLabel="Keep my edits"
        destructive
        onConfirm={doResetCatalogue}
        onClose={() => setResetCatalogueOpen(false)}
      />

      <ConfirmDialog
        open={clearOrdersOpen}
        title="Clear every order?"
        description="All order history in this browser will be deleted. Customers will see empty order lists and the dashboard will read zero."
        confirmLabel="Clear them"
        cancelLabel="Leave them"
        destructive
        onConfirm={doClearOrders}
        onClose={() => setClearOrdersOpen(false)}
      />
    </Box>
  );
}

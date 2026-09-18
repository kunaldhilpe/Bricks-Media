import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import Container from '@/components/common/Container';
import PageHeader from '@/components/common/PageHeader';
import Price from '@/components/common/Price';
import { BagSummary } from './CartPage';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { placeOrder } from '@/api/orders';
import storage from '@/utils/storage';
import { PAYMENT_METHODS, STORAGE_KEYS } from '@/utils/constants';

const steps = ['Delivery address', 'Payment', 'Review'];

const emptyAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  label: 'Home',
};

const STATES = [
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'West Bengal',
  'Rajasthan',
  'Punjab',
  'Kerala',
];

function validateAddress(address) {
  return {
    fullName: address.fullName.trim().length < 3 ? 'Enter the full name for the parcel.' : null,
    phone: /^[6-9]\d{9}$/.test(address.phone) ? null : 'Enter a 10-digit Indian mobile number.',
    line1: address.line1.trim().length < 5 ? 'Enter the flat, building and street.' : null,
    city: address.city.trim() ? null : 'Enter the city.',
    state: address.state ? null : 'Choose the state.',
    pincode: /^\d{6}$/.test(address.pincode) ? null : 'Enter a 6-digit pincode.',
  };
}

function validatePayment(payment) {
  if (payment.method === 'card') {
    return {
      cardNumber: /^\d{16}$/.test(payment.cardNumber.replace(/\s/g, ''))
        ? null
        : 'Enter the 16 digits on the card.',
      cardName: payment.cardName.trim() ? null : 'Enter the name on the card.',
      expiry: /^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiry) ? null : 'Use MM/YY.',
      cvv: /^\d{3}$/.test(payment.cvv) ? null : 'Three digits.',
    };
  }
  if (payment.method === 'upi') {
    return {
      upiId: /^[\w.-]{3,}@[a-zA-Z]{3,}$/.test(payment.upiId) ? null : 'Looks like name@bank.',
    };
  }
  return {};
}

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { items, totals, promoCode, clearCart } = useCart();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(() => ({
    ...emptyAddress,
    ...storage.read(STORAGE_KEYS.addresses, {}),
    fullName: storage.read(STORAGE_KEYS.addresses, {})?.fullName || user?.name || '',
  }));
  const [payment, setPayment] = useState({
    method: 'card',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    upiId: '',
  });
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState(null);

  const addressErrors = useMemo(() => validateAddress(address), [address]);
  const paymentErrors = useMemo(() => validatePayment(payment), [payment]);

  const addressValid = Object.values(addressErrors).every((error) => !error);
  const paymentValid = Object.values(paymentErrors).every((error) => !error);

  if (items.length === 0 && !submitting) {
    return <Navigate to="/cart" replace />;
  }

  const onAddressChange = (field) => (event) =>
    setAddress((current) => ({ ...current, [field]: event.target.value }));

  const onPaymentChange = (field) => (event) =>
    setPayment((current) => ({ ...current, [field]: event.target.value }));

  const next = () => {
    if (step === 0) {
      setTouched((current) => ({ ...current, address: true }));
      if (!addressValid) return;
      storage.write(STORAGE_KEYS.addresses, address);
    }
    if (step === 1) {
      setTouched((current) => ({ ...current, payment: true }));
      if (!paymentValid) return;
    }
    setStep((current) => current + 1);
  };

  const submit = async () => {
    setSubmitting(true);
    setFailure(null);
    try {
      const order = await placeOrder({ user, items, address, payment, promoCode, note });
      clearCart();
      toast.success(`Order ${order.id} placed.`);
      navigate(`/order/${order.id}/placed`, { replace: true });
    } catch (error) {
      setFailure(error.message);
      setSubmitting(false);
    }
  };

  const fieldProps = (field, errors, group) => ({
    error: Boolean(touched[group] && errors[field]),
    helperText: touched[group] ? errors[field] ?? ' ' : ' ',
  });

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Checkout"
        description="Three steps. Nothing is charged — this storefront takes no payments."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Bag', to: '/cart' }, { label: 'Checkout' }]}
      />

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' },
          gap: { xs: 4, md: 5 },
          alignItems: 'start',
        }}
      >
        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
          {failure && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFailure(null)}>
              {failure}
            </Alert>
          )}

          {step === 0 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Where should it go?
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <TextField
                  label="Full name"
                  value={address.fullName}
                  onChange={onAddressChange('fullName')}
                  {...fieldProps('fullName', addressErrors, 'address')}
                />
                <TextField
                  label="Mobile number"
                  value={address.phone}
                  onChange={onAddressChange('phone')}
                  inputProps={{ maxLength: 10, inputMode: 'numeric' }}
                  {...fieldProps('phone', addressErrors, 'address')}
                />
                <TextField
                  label="Flat, building, street"
                  value={address.line1}
                  onChange={onAddressChange('line1')}
                  sx={{ gridColumn: { sm: '1 / -1' } }}
                  {...fieldProps('line1', addressErrors, 'address')}
                />
                <TextField
                  label="Landmark (optional)"
                  value={address.line2}
                  onChange={onAddressChange('line2')}
                  sx={{ gridColumn: { sm: '1 / -1' } }}
                  helperText=" "
                />
                <TextField
                  label="City"
                  value={address.city}
                  onChange={onAddressChange('city')}
                  {...fieldProps('city', addressErrors, 'address')}
                />
                <TextField
                  select
                  label="State"
                  value={address.state}
                  onChange={onAddressChange('state')}
                  {...fieldProps('state', addressErrors, 'address')}
                >
                  {STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Pincode"
                  value={address.pincode}
                  onChange={onAddressChange('pincode')}
                  inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                  {...fieldProps('pincode', addressErrors, 'address')}
                />
                <TextField
                  select
                  label="Address type"
                  value={address.label}
                  onChange={onAddressChange('label')}
                  helperText=" "
                >
                  {['Home', 'Work', 'Other'].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          )}

          {step === 1 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 3 }}>
                How would you like to pay?
              </Typography>
              <RadioGroup
                value={payment.method}
                onChange={(event) =>
                  setPayment((current) => ({ ...current, method: event.target.value }))
                }
                sx={{ mb: 3 }}
              >
                {PAYMENT_METHODS.map((method) => (
                  <FormControlLabel
                    key={method.value}
                    value={method.value}
                    control={<Radio size="small" />}
                    label={method.label}
                  />
                ))}
              </RadioGroup>

              {payment.method === 'card' && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Card number"
                    value={payment.cardNumber}
                    onChange={onPaymentChange('cardNumber')}
                    inputProps={{ maxLength: 19, inputMode: 'numeric' }}
                    sx={{ gridColumn: { sm: '1 / -1' } }}
                    {...fieldProps('cardNumber', paymentErrors, 'payment')}
                  />
                  <TextField
                    label="Name on card"
                    value={payment.cardName}
                    onChange={onPaymentChange('cardName')}
                    sx={{ gridColumn: { sm: '1 / -1' } }}
                    {...fieldProps('cardName', paymentErrors, 'payment')}
                  />
                  <TextField
                    label="Expiry (MM/YY)"
                    value={payment.expiry}
                    onChange={onPaymentChange('expiry')}
                    inputProps={{ maxLength: 5 }}
                    {...fieldProps('expiry', paymentErrors, 'payment')}
                  />
                  <TextField
                    label="CVV"
                    value={payment.cvv}
                    onChange={onPaymentChange('cvv')}
                    inputProps={{ maxLength: 3, inputMode: 'numeric' }}
                    {...fieldProps('cvv', paymentErrors, 'payment')}
                  />
                </Box>
              )}

              {payment.method === 'upi' && (
                <TextField
                  label="UPI ID"
                  value={payment.upiId}
                  onChange={onPaymentChange('upiId')}
                  placeholder="name@bank"
                  fullWidth
                  {...fieldProps('upiId', paymentErrors, 'payment')}
                />
              )}

              {payment.method === 'netbanking' && (
                <Alert severity="info" variant="outlined">
                  You would be handed to your bank here. Nothing is charged in this demo.
                </Alert>
              )}

              {payment.method === 'cod' && (
                <Alert severity="info" variant="outlined">
                  Pay the courier when the parcel arrives. Available on orders under ₹50,000.
                </Alert>
              )}

              <Alert severity="warning" variant="outlined" sx={{ mt: 3 }}>
                Do not enter real card details. This form validates the shape of the input and
                nothing more — no data leaves your browser.
              </Alert>
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Check it over
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Delivering to
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {address.fullName} · {address.phone}
                  <br />
                  {address.line1}
                  {address.line2 && `, ${address.line2}`}
                  <br />
                  {address.city}, {address.state} {address.pincode}
                </Typography>
                <Button size="small" onClick={() => setStep(0)} sx={{ mt: 1, px: 0 }}>
                  Change the address
                </Button>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Paying by
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {PAYMENT_METHODS.find((method) => method.value === payment.method)?.label}
                  {payment.method === 'card' &&
                    payment.cardNumber &&
                    ` ending ${payment.cardNumber.replace(/\s/g, '').slice(-4)}`}
                  {payment.method === 'upi' && payment.upiId && ` · ${payment.upiId}`}
                </Typography>
                <Button size="small" onClick={() => setStep(1)} sx={{ mt: 1, px: 0 }}>
                  Change the payment method
                </Button>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                {totals.itemCount} {totals.itemCount === 1 ? 'piece' : 'pieces'}
              </Typography>
              {items.map((item) => (
                <Box key={item.key} sx={{ display: 'flex', gap: 2, py: 1.5 }}>
                  <Box
                    component="img"
                    src={item.thumbnail}
                    alt=""
                    loading="lazy"
                    sx={{ width: 54, height: 70, objectFit: 'cover' }}
                  />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Size {item.size} · {item.color} · ×{item.quantity}
                    </Typography>
                  </Box>
                  <Price
                    price={item.price * item.quantity}
                    finalPrice={item.finalPrice * item.quantity}
                    discountPercent={item.discountPercent}
                    size="small"
                    align="right"
                  />
                </Box>
              ))}

              <TextField
                label="Note for the packer (optional)"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1.5, mt: 4, justifyContent: 'space-between' }}>
            <Button
              onClick={() => (step === 0 ? navigate('/cart') : setStep((s) => s - 1))}
              disabled={submitting}
              color="inherit"
            >
              {step === 0 ? 'Back to the bag' : 'Back'}
            </Button>
            {step < 2 ? (
              <Button variant="contained" onClick={next}>
                Continue
              </Button>
            ) : (
              <Button variant="contained" size="large" onClick={submit} disabled={submitting}>
                {submitting ? 'Placing your order…' : 'Place the order'}
              </Button>
            )}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <BagSummary totals={totals} />
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Signed in as
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {user?.name} · {user?.email}
              </Typography>
              <Button component={Link} to="/orders" size="small" sx={{ mt: 1.5, px: 0 }}>
                Your past orders
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}

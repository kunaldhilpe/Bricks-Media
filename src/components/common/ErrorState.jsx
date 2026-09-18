import { Alert, AlertTitle, Button } from '@mui/material';

export default function ErrorState({ error, onRetry, title = 'That did not load' }) {
  const message =
    typeof error === 'string' ? error : error?.message ?? 'Something went wrong on our side.';

  return (
    <Alert
      severity="error"
      variant="outlined"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    >
      <AlertTitle sx={{ fontWeight: 500 }}>{title}</AlertTitle>
      {message}
    </Alert>
  );
}

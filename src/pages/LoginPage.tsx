import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sprout } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Sign-in was cancelled.',
  not_authorised: 'Your account is not on the approved list.',
  oauth_failed: 'Sign-in failed — please try again.',
  invalid_state: 'Sign-in failed — please try again.',
};

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const errorKey = searchParams.get('error');
  const errorMessage = errorKey ? (ERROR_MESSAGES[errorKey] ?? 'Something went wrong.') : null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center max-w-xs">
        <Sprout className="h-10 w-10 text-lime-700" />
        <div>
          <h1 className="text-xl font-semibold">Sign in to Trellis</h1>
          <p className="text-sm text-muted-foreground mt-1">Lenders and admins only.</p>
        </div>
        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
        <Button nativeButton={false} render={<a href="/api/auth/google" />}>Sign in with Google</Button>
      </div>
    </div>
  );
}

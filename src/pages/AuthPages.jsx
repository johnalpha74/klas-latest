import { SignIn, SignUp } from '@clerk/clerk-react';

function AuthShell({ children }) {
  return <section className="container flex justify-center py-16">{children}</section>;
}

export function SignInPage() {
  return (
    <AuthShell>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/onboarding" />
    </AuthShell>
  );
}

/** Clerk handles email/password and Google; new users then choose a role at /onboarding. */
export function SignUpPage() {
  return (
    <AuthShell>
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/onboarding" />
    </AuthShell>
  );
}

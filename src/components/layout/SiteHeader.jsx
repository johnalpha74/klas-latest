import { Link, NavLink } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProfile, dashboardPath } from '@/hooks/useProfile';

const navClass = ({ isActive }) =>
  cn(
    'inline-flex min-h-control items-center rounded-control px-3 text-label text-muted-foreground hover:bg-surface hover:text-foreground',
    isActive && 'bg-surface text-foreground shadow-[inset_0_-2px_0_var(--primary)]'
  );

export function SiteHeader() {
  const { profile } = useProfile();
  return (
    <header className="border-b border-[#262930] bg-background">
      <div className="container flex flex-wrap items-center gap-x-8 gap-y-4 py-4">
        <Link to="/" aria-label="KLAS Recruitment home" className="flex min-h-control items-center">
          <img src="/klas-logo-white.png" alt="KLAS Recruitment — Expert Recruitment Solutions" className="h-11 w-auto" />
        </Link>
        <nav aria-label="Main" className="flex flex-1 flex-wrap gap-2">
          <NavLink to="/jobs" className={navClass}>Find jobs</NavLink>
          <NavLink to="/employers" className={navClass}>For employers</NavLink>
          <NavLink to="/candidates" className={navClass}>For candidates</NavLink>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <SignedOut>
            <Link to="/sign-in" className={buttonVariants({ variant: 'secondary' })}>Log in</Link>
            <Link to="/sign-up" className={buttonVariants({ variant: 'primary' })}>Sign up</Link>
          </SignedOut>
          <SignedIn>
            {profile && (
              <Link to={dashboardPath(profile.role)} className={buttonVariants({ variant: 'secondary' })}>My dashboard</Link>
            )}
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

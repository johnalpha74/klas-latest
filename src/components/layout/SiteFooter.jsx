import { Link } from 'react-router-dom';

const linkClass = 'inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline';

export function SiteFooter() {
  return (
    <footer className="border-t border-[#262930]">
      <div className="container flex flex-col gap-10 pb-8 pt-12">
        <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          <div className="flex flex-col gap-4">
            <img src="/klas-logo-white.png" alt="KLAS Recruitment" className="h-10 w-auto self-start" />
            <p className="max-w-[260px] text-sm text-muted-foreground">Connecting candidates and recruiters through one clear platform.</p>
          </div>
          <nav aria-label="Candidates" className="flex flex-col">
            <h2 className="mb-2 text-label text-accent">Candidates</h2>
            <Link className={linkClass} to="/jobs">Search a job</Link>
            <Link className={linkClass} to="/candidates">Post a CV</Link>
          </nav>
          <nav aria-label="Employers" className="flex flex-col">
            <h2 className="mb-2 text-label text-accent">Employers</h2>
            <Link className={linkClass} to="/post-job">Post a job</Link>
            <Link className={linkClass} to="/employers">Pricing</Link>
          </nav>
        </div>
        <p className="border-t border-[#262930] pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} KLAS Recruitment. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

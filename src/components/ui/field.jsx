import { useId } from 'react';
import { Input } from './input';
import { Label } from './label';

/** Persistent label + optional hint + inline error, wired for screen readers. */
export function Field({ label, hint, error, required, id, ...inputProps }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={fieldId} required={required}>{label}</Label>
      {hint && <p id={hintId} className="text-sm text-muted-foreground">{hint}</p>}
      <Input
        id={fieldId}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        {...inputProps}
      />
      {error && <p id={errorId} className="text-sm text-error">{error}</p>}
    </div>
  );
}

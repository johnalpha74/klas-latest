import { Link } from 'react-router-dom';

export default function Placeholder({ title, body = 'This page is designed and will be built in a later step.' }) {
  return (
    <section className="container flex flex-col gap-4 py-16">
      <h1 className="text-section-mobile md:text-section">{title}</h1>
      <p className="text-muted-foreground">{body}</p>
      <Link to="/" className="text-label text-primary">Back to home</Link>
    </section>
  );
}

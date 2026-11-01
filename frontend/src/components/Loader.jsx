// Spinner (default) or skeleton cards while data loads.
export default function Loader({ type = 'spinner', count = 3 }) {
  if (type === 'skeleton') {
    return (
      <div aria-busy="true" aria-label="Loading">
        {Array.from({ length: count }).map((_, i) => (
          <div className="card skeleton" key={i}>
            <div className="sk-line w40" /><div className="sk-line w80" /><div className="sk-line w60" />
          </div>
        ))}
      </div>
    );
  }
  return <div className="spinner" role="status" aria-label="Loading" />;
}

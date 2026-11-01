// Controlled keyword search input with a clear (✕) button.
export default function SearchBar({ value, onChange, placeholder = 'Search discussions and communities...' }) {
  return (
    <div className="searchbar" role="search">
      <span aria-hidden="true">🔍</span>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label="Search" />
      {value && <button type="button" className="icon-btn" onClick={() => onChange('')} aria-label="Clear search">✕</button>}
    </div>
  );
}

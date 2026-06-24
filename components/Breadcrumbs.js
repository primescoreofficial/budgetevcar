import Link from 'next/link';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 py-3 mb-6 overflow-x-auto whitespace-nowrap">
      <Link href="/" className="hover:text-[#0249ad] transition-colors">
        Home
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-2">
          <span className="text-slate-300 font-normal">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-[#0249ad] transition-colors capitalize">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-600 truncate max-w-[200px] sm:max-w-none capitalize">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  href?: string;
  label: string;
}

interface Props {
  items: Crumb[];
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav className="admin-crumbs" aria-label="Хлебные крошки">
      {items.map((c, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="admin-crumb">
            {c.href && !isLast ? (
              <Link href={c.href} className="admin-crumb-link">{c.label}</Link>
            ) : (
              <span className={isLast ? 'admin-crumb-current' : ''}>{c.label}</span>
            )}
            {!isLast && <ChevronRight size={12} className="admin-crumb-sep" />}
          </span>
        );
      })}
    </nav>
  );
}

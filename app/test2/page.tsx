// app/test2/page.tsx
import Link from 'next/link';

export default function TestPage2() {
  return (
    <div style={{ padding: '5rem' }}>
      <h1>Halaman Tes 2</h1>
      <Link href="/test1" style={{ fontSize: '2rem', color: 'blue' }}>
        Ke Halaman Tes 1
      </Link>
    </div>
  );
}
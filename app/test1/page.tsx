// app/test1/page.tsx
import Link from 'next/link';

export default function TestPage1() {
  return (
    <div style={{ padding: '5rem' }}>
      <h1>Halaman Tes 1</h1>
      <Link href="/test2" style={{ fontSize: '2rem', color: 'blue' }}>
        Ke Halaman Tes 2
      </Link>
    </div>
  );
}
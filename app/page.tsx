// app/page.js (or page.tsx)

import dynamic from 'next/dynamic';

// Dynamically import the BirthdayCard component, disabling Server-Side Rendering (SSR)
const BirthdayCardNoSSR = dynamic(
  () => import('../components/BirthdayCard'), 
  { 
    ssr: false // <-- This is the crucial setting
  }
);

export default function Page() {
  return (
    <main>
      {/* Render the dynamically imported component */}
      <BirthdayCardNoSSR />
    </main>
  );
}
// app/page.tsx

'use client'; // <-- ADD THIS LINE

import dynamic from 'next/dynamic';

// Dynamically import the BirthdayCard component, disabling Server-Side Rendering (SSR)
const BirthdayCardNoSSR = dynamic(
  () => import('../components/BirthdayCard'), 
  { 
    ssr: false // This is now allowed because the file is a Client Component
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
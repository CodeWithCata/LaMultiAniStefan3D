'use client'; // <-- Crucial: Makes this a Client Component

import dynamic from 'next/dynamic';

// Dynamically import the BirthdayCard component, disabling Server-Side Rendering (SSR)
// This prevents Node.js from trying to run Three.js during the build phase.
const BirthdayCardNoSSR = dynamic(
  () => import('../components/BirthdayCard'), 
  { 
    ssr: false 
  }
);

export default function Page() {
  return (
    <main className="w-full h-full">
      {/* Render the dynamically imported component */}
      <BirthdayCardNoSSR />
    </main>
  );
}
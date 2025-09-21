const fs = require('fs');
const path = require('path');

// This script runs during Vercel build to inject analytics
if (process.env.VERCEL) {
  const analyticsContent = `'use client'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

export default function AnalyticsWrapper() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}`;

  const filePath = path.join(__dirname, '../src/components/analytics/index.tsx');
  fs.writeFileSync(filePath, analyticsContent);
  console.log('✅ Vercel Analytics injected successfully');
} else {
  console.log('⏭️  Skipping analytics injection (not on Vercel)');
}
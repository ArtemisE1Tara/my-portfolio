import React from 'react';
import ImageCaptureAndAnalyze from '@/components/chair-detector';

export const metadata = {
  title: 'HotSeat',
  description: 'A computer vision backed crowd mnanagement solution',
};

export default function HotSeatPage() {
  return (
    <div className="container mx-auto py-10">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">HotSeat</h1>
        <ImageCaptureAndAnalyze />
      </section>
    </div>
  );
}
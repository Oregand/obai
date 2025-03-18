'use client';

import React from 'react';
import ResponsiveContainer from '../layout/ResponsiveContainer';
import ResponsiveGrid from '../layout/ResponsiveGrid';
import { responsiveText } from '@/lib/responsive/utilities';

type Feature = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  emoji?: string;
};

type ResponsiveFeatureGridProps = {
  title?: string;
  subtitle?: string;
  features: Feature[];
};

export default function ResponsiveFeatureGrid({
  title = 'Features',
  subtitle = 'Discover what makes our platform unique',
  features,
}: ResponsiveFeatureGridProps) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-midnight to-midnight-light">
      <ResponsiveContainer>
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className={`${responsiveText.heading2} text-white mb-4`}>{title}</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Features Grid - 1 column on mobile, 2 on tablet, 3 on desktop */}
        <ResponsiveGrid 
          columns={{ default: 1, sm: 2, lg: 3 }}
          gap={{ default: 6, lg: 8 }}
        >
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              emoji={feature.emoji}
            />
          ))}
        </ResponsiveGrid>
      </ResponsiveContainer>
    </section>
  );
}

function FeatureCard({ title, description, icon, emoji }: Feature) {
  return (
    <div className="bg-midnight-darker rounded-xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow border border-midnight-light">
      <div className="mb-4 text-blue-500">
        {icon ? (
          <div className="text-3xl">{icon}</div>
        ) : emoji ? (
          <div className="text-4xl">{emoji}</div>
        ) : null}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

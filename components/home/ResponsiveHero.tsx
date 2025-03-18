'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import ResponsiveContainer from '../layout/ResponsiveContainer';
import { responsiveText } from '@/lib/responsive/utilities';

type ResponsiveHeroProps = {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
};

export default function ResponsiveHero({
  title = 'OBAI - Role Play with AI Personas',
  subtitle = 'Chat with custom AI personas powered by Grok 3. Engage in immersive conversations with a variety of characters.',
  imageSrc,
  imageAlt = 'OBAI Hero Image',
  primaryButtonText = 'Get Started',
  primaryButtonHref = '/register',
  secondaryButtonText = 'Learn More',
  secondaryButtonHref = '/about',
}: ResponsiveHeroProps) {
  const { data: session } = useSession();

  // Adjust button destination if user is logged in
  const primaryHref = session ? '/chat' : primaryButtonHref;
  const primaryText = session ? 'Go to Chat' : primaryButtonText;

  return (
    <section className="bg-gradient-to-b from-midnight-darker to-midnight py-12 md:py-20">
      <ResponsiveContainer>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Text Content - Full width on mobile, half width on desktop */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className={`${responsiveText.heading1} text-white mb-4 md:mb-6`}>
              {title}
            </h1>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl mb-8">
              {subtitle}
            </p>
            
            {/* Responsive Button Group - Stacked on mobile, side by side on desktop */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href={primaryHref}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 text-center transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-midnight"
              >
                {primaryText}
              </Link>
              
              <Link
                href={secondaryButtonHref}
                className="bg-transparent hover:bg-gray-700 text-white border border-gray-600 font-medium rounded-lg px-6 py-3 text-center transition-colors hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-midnight"
              >
                {secondaryButtonText}
              </Link>
            </div>
          </div>
          
          {/* Image - Hidden on mobile if space is tight, visible otherwise */}
          {imageSrc && (
            <div className="w-full md:w-1/2 mt-8 md:mt-0">
              <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-square max-w-lg mx-auto rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </section>
  );
}

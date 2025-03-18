'use client';

import Image from 'next/image';

interface ChatHeaderProps {
  title: string;
  persona: {
    name: string;
    imageUrl?: string;
  };
}

export default function ChatHeader({ title, persona }: ChatHeaderProps) {
  // Add a fallback in case persona is undefined
  const personaName = persona?.name || 'Assistant';
  const personaImage = persona?.imageUrl;
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-100 dark:bg-midnight-darker">
      <div className="flex items-center">
        {personaImage ? (
          <Image
            src={personaImage}
            alt={personaName}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-medium">
              {personaName.charAt(0)}
            </span>
          </div>
        )}
        <div className="ml-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {title || 'Chat'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {personaName}
          </p>
        </div>
      </div>
    </div>
  );
}

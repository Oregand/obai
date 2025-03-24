import Image from 'next/image';

interface ChatHeaderProps {
  chatTitle: string;
  persona: {
    name: string;
    imageUrl?: string | null;
  };
  onMenuClick: () => void;
}

export default function ChatHeader({ chatTitle, persona, onMenuClick }: ChatHeaderProps) {
  const personaName = persona?.name || 'Assistant';
  const personaImage = persona?.imageUrl;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-100 dark:bg-midnight-darker">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="mr-3 md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
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
              {chatTitle || 'Chat'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {personaName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
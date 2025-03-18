import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/chat');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
        OBAI
      </h1>
      <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mb-10">
        Role-play with AI personas powered by Grok 3. Engage in immersive conversations with a variety of characters.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/login"
          className="px-8 py-3 text-lg font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Log In
        </Link>
        <Link
          href="/register"
          className="px-8 py-3 text-lg font-medium rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors"
        >
          Sign Up
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        <FeatureCard
          title="Multiple Personas"
          description="Chat with different characters, from historical figures to fantasy creatures."
          emoji="🎭"
        />
        <FeatureCard
          title="Custom Conversations"
          description="Create your own personas and share them with others."
          emoji="✏️"
        />
        <FeatureCard
          title="Advanced AI"
          description="Powered by Grok 3's advanced language model for realistic interactions."
          emoji="🤖"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  emoji,
}: {
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="text-4xl mb-4">{emoji}</div>
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h2>
      <p className="text-gray-600 dark:text-gray-300 text-center">{description}</p>
    </div>
  );
}

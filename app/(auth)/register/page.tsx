'use client';

import { PageProps } from '@/types/next';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

// Define the interface specifically for this page
interface RegisterPageProps extends PageProps {}

export default function RegisterPage({ searchParams = {} }: RegisterPageProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    // Validate passwords match
    if (password !== confirmPassword) {
      setFieldErrors({confirmPassword: 'Passwords do not match'});
      setIsLoading(false);
      return;
    }

    try {
    const response = await fetch('/api/register', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({
    name,
    email,
    password,
    }),
    });

    const data = await response.json();

    if (!response.ok) {
    // Handle structured validation errors
    if (data.errors && data.errors.length > 0) {
    // Map validation errors to form fields
    const errors: {[key: string]: string} = {};
    data.errors.forEach((err: any) => {
    if (err.path && err.path.length > 0) {
    errors[err.path[0]] = err.message;
    }
    });
    setFieldErrors(errors);
    // Also set a general error message
    throw new Error(data.message || 'Please correct the errors below');
    } else if (data.details) {
    // Handle detailed error messages like database connection errors
      throw new Error(`${data.message}: ${data.details}`);
      } else {
            throw new Error(data.message || 'Something went wrong');
          }
        }

      // Sign in the user after successful registration
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      router.push('/chat');
    } catch (error: any) {
      setError(error.message || 'Failed to register');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gradient-to-b from-midnight-darker to-midnight-DEFAULT">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="text-center text-4xl font-bold text-primary neon-text">OBAI</h1>
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-200">
          Create your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-secondary-light border border-primary text-primary px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-300">
              Full name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`block w-full rounded-md border-0 py-2 px-3 text-gray-200 shadow-sm ring-1 ring-inset ${fieldErrors.name ? 'ring-primary' : 'ring-primary/30'} placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary bg-secondary-light`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-primary">{fieldErrors.name}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-300">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full rounded-md border-0 py-2 px-3 text-gray-200 shadow-sm ring-1 ring-inset ${fieldErrors.email ? 'ring-primary' : 'ring-primary/30'} placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary bg-secondary-light`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-primary">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-300">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full rounded-md border-0 py-2 px-3 text-gray-200 shadow-sm ring-1 ring-inset ${fieldErrors.password ? 'ring-primary' : 'ring-primary/30'} placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary bg-secondary-light`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-primary">{fieldErrors.password}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-300">
              Confirm Password
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full rounded-md border-0 py-2 px-3 text-gray-200 shadow-sm ring-1 ring-inset ${fieldErrors.confirmPassword ? 'ring-primary' : 'ring-primary/30'} placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary bg-secondary-light`}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-primary">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-midnight-DEFAULT px-2 text-gray-400">Or sign up with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => signIn('google', { callbackUrl: '/chat' })}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-secondary-light px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-primary/50 hover:bg-secondary focus:outline-offset-0 transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            <button
              onClick={() => signIn('twitter', { callbackUrl: '/chat' })}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-secondary-light px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-primary/50 hover:bg-secondary focus:outline-offset-0 transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold leading-6 text-primary hover:text-primary-light neon-text">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

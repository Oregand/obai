'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
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

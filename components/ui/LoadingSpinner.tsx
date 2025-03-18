'use client';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  label = 'Loading...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex justify-center items-center" role="status">
      <div
        className={`${sizeClasses[size]} rounded-full border-t-transparent border-primary animate-spin`}
        aria-hidden="true"
      ></div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

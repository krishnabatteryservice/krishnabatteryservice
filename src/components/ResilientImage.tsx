import {useState} from 'react';
import {BatteryCharging} from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  loading?: 'eager' | 'lazy';
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
  loading = 'lazy',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-slate-800 text-slate-200 p-6 text-center ${className}`}
      >
        <BatteryCharging className="w-10 h-10 text-amber-400 mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-white max-w-xs">
          {fallbackLabel || alt}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

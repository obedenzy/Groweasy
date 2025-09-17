import { Loader } from 'lucide-react';

export const LoadingSpinner = ({ className }: { className?: string }) => {
  return <Loader className={`animate-spin ${className}`} />;
};
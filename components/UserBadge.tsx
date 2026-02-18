import { cn } from "@/lib/utils";

type UserRole = 'user' | 'admin' | 'patron' | 'verified';

interface UserBadgeProps {
  role?: string;
  className?: string;
}

export default function UserBadge({ role = 'user', className }: UserBadgeProps) {
  if (role === 'user') return null;

  const getBadgeConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          text: 'Admin',
          styles: 'bg-pink-500/15 text-pink-400 border border-pink-500/30 neon-text-pink'
        };
      case 'patron':
        return {
          text: 'Patron',
          styles: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
        };
      case 'verified':
        return {
          text: 'Zweryfikowany',
          styles: 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig(role);
  if (!config) return null;

  return (
    <span className={cn(
      "px-1.5 py-0.5 text-[8px] font-bold tracking-widest rounded-md leading-none h-fit self-center uppercase",
      config.styles,
      className
    )}>
      {config.text}
    </span>
  );
}

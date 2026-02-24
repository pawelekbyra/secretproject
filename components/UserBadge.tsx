import { cn } from "@/lib/utils";
import { Chip } from "@heroui/react";

type UserRole = 'user' | 'admin' | 'patron' | 'verified' | 'author';

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
          color: 'danger' as const,
        };
      case 'patron':
        return {
          text: 'Patron',
          color: 'warning' as const,
        };
      case 'author':
      case 'verified':
        return {
          text: role === 'author' ? 'Twórca' : 'Verified',
          color: 'primary' as const,
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig(role);
  if (!config) return null;

  return (
    <Chip
      size="sm"
      variant="flat"
      color={config.color}
      className={cn(
        "h-4 px-1 text-[8px] font-bold tracking-tighter uppercase italic",
        className
      )}
    >
      {config.text}
    </Chip>
  );
}

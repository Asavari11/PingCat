import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  username: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-16 w-16 text-xl",
  lg: "h-24 w-24 text-3xl",
  xl: "h-32 w-32 text-4xl",
};

export function ProfileAvatar({ username, photoUrl, size = "md", className }: ProfileAvatarProps) {
  const initials = username.charAt(0).toUpperCase();

  return (
    <Avatar className={cn(sizeClasses[size], "bg-gradient-primary border-2 border-primary/20", className)}>
      {photoUrl && <AvatarImage src={photoUrl} alt={username} />}
      <AvatarFallback className="bg-transparent text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

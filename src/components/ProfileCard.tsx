import { ProfileAvatar } from "./ProfileAvatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  username: string;
  email: string;
  photoUrl?: string | null;
  onClick: () => void;
  className?: string;
}

export function ProfileCard({ username, email, photoUrl, onClick, className }: ProfileCardProps) {
  return (
    <Card  onClick={onClick}
       className={cn(
        "w-32 h-36 p-4 transition-transform duration-300 cursor-pointer",
        "bg-black/30 hover:bg-black/40 shadow-card hover:shadow-card-hover",
        "border border-border/20 hover:border-border/50",
        "rounded-lg hover:scale-105",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2 h-full">
        <div onClick={onClick}>
          <ProfileAvatar 
            username={username} 
            photoUrl={photoUrl} 
            size="md" 
            className="cursor-pointer hover:scale-110 transition-transform" 
          />
        </div>

        <div className="text-center">
          <h3 className="font-semibold text-foreground text-sm truncate">{username}</h3>
          
        </div>
      </div>
    </Card>
  );
}

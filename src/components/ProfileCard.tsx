import { ProfileAvatar } from "./ProfileAvatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface ProfileCardProps {
  username: string;
  email: string;
  photoUrl?: string | null;
  onClick: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ProfileCard({ username, email, photoUrl, onClick, onDelete, className }: ProfileCardProps) {
  return (
    <Card
      className={cn(
        "w-32 h-36 p-4 transition-transform duration-300 cursor-pointer",
        "bg-black/30 hover:bg-black/40 shadow-card hover:shadow-card-hover",
        "border border-border/20 hover:border-border/50",
        "rounded-lg hover:scale-105",
        "relative",
        className
      )}
    >
      {onDelete && (
        <div className="absolute top-2 right-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-7 w-7 p-0"
            aria-label="Delete profile"
          >
            <Trash className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      )}

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

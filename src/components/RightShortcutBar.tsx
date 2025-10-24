import { Plus, ArrowLeftRight,Grid,X } from "lucide-react";
import { useShortcuts } from "./ShortcutContext";
import { useState } from "react";


export const RightShortcutBar = ({ onToggle }: { onToggle?: () => void }) => {
  const { shortcuts, addShortcut ,deleteShortcut} = useShortcuts();
  const [isHovered, setIsHovered] = useState(false);
   const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      <div
        className="fixed bottom-12 right-5 h-[80vh] flex flex-col-reverse items-start gap-2 z-50 transition-all duration-300"
        style={{
          transform: isHovered ? "translateX(0)" : "translateX(60px)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {onToggle && (
          <button
            onClick={onToggle}
            className=" w-10 h-10 bg-primary/30 rounded-full flex items-center justify-center text-white text-xs hover:bg-primary/50 transition"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        )}

      
        <button
          onClick={addShortcut}
          className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/80 transition transform hover:scale-105"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>

        
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            onMouseEnter={() => setHoveredId(shortcut.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="relative flex flex-col items-center justify-center w-15 cursor-pointer select-none transition-transform transform hover:-translate-y-1"
          >
            
            {hoveredId === shortcut.id && (
              <button
                onClick={() => deleteShortcut(shortcut.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            <a
              href={shortcut.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20 text-primary font-bold text-lg hover:bg-primary/40 overflow-hidden"
            >
              {shortcut.icon ? (
                <img src={shortcut.icon} alt={shortcut.title} className="w-8 h-8" />
              ) : (
                shortcut.title[0]
              )}
            </a>
          </div>
        ))}

      </div>

      {!isHovered && (
        <div
          className="fixed right-4 bottom-5 w-12 h-12 flex items-center justify-center z-40 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
        >
          <Grid className="w-6 h-6 text-primary" />
        </div>
      )}
    </>
  );
};

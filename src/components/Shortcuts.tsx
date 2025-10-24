import { Plus, X, ArrowLeftRight } from "lucide-react";
import { useShortcuts } from "./ShortcutContext";
import { useState } from "react";

export const ChromeShortcutBar = ({ onToggle }: { onToggle?: () => void }) => {
  const { shortcuts, addShortcut, deleteShortcut } = useShortcuts();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex gap-5 items-center">
        {onToggle && (
          <button
            onClick={onToggle}
            className="flex flex-col items-center justify-center w-15 cursor-pointer select-none transition-transform transform hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20 text-primary hover:bg-primary/40">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
          </button>
        )}

        <div
          onClick={addShortcut}
          className="flex flex-col items-center justify-center w-15 cursor-pointer select-none transition-transform transform hover:-translate-y-1"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20 text-primary font-bold text-lg hover:bg-primary/40">
            <Plus className="h-5 w-5" />
          </div>
        </div>

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
    </div>
  );
};

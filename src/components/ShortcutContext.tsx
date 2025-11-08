import React, { createContext, useContext, useState } from "react";

interface Shortcut {
  id: string;
  url: string;
  icon?: string;
}

interface ShortcutContextType {
  shortcuts: Shortcut[];
  addShortcut: () => void;
  deleteShortcut: (id: string) => void;
}

const ShortcutContext = createContext<ShortcutContextType | null>(null);

export const ShortcutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleAddShortcut = () => setShowPopup(true);

  const handleConfirm = () => {
    if (!inputValue.trim()) {
      setShowPopup(false);
      return;
    }

    const icon = `https://www.google.com/s2/favicons?domain=${inputValue}&sz=64`;
    const newShortcut: Shortcut = {
      id: Date.now().toString(),
      url: inputValue,
      icon,
    };

    setShortcuts((prev) => [...prev, newShortcut]);
    setInputValue("");
    setShowPopup(false);
  };

  const deleteShortcut = (id: string) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <ShortcutContext.Provider value={{ shortcuts, addShortcut: handleAddShortcut, deleteShortcut }}>
      {children}

      {/* Simple custom popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-xl w-80 text-center border border-border">
            <h2 className="text-lg font-semibold mb-3">Add Shortcut</h2>
            <input
              type="text"
              placeholder="Enter website URL"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="border w-full p-2 rounded mb-4 outline-none bg-input text-foreground"
            />
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 rounded bg-background/50 hover:bg-background/60 border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </ShortcutContext.Provider>
  );
};

export const useShortcuts = () => {
  const ctx = useContext(ShortcutContext);
  if (!ctx) throw new Error("useShortcuts must be used inside ShortcutProvider");
  return ctx;
};

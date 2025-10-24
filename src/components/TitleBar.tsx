import React from "react";


declare global {
  interface Window {
    electronAPI: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    }
  }
}

export const TitleBar = () => {
  return (
    <div className="flex justify-end items-center bg-gray-800 text-white h-8">
      <button
        className="w-8 h-8 hover:bg-gray-700"
        onClick={() => window.electronAPI.minimize()}
      >
        -
      </button>
      <button
        className="w-8 h-8 hover:bg-gray-700"
        onClick={() => window.electronAPI.maximize()}
      >
        □
      </button>
      <button
        className="w-8 h-8 hover:bg-red-600"
        onClick={() => window.electronAPI.close()}
      >
        ×
      </button>
    </div>
  );
};

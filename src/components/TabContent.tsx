import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Search, Terminal } from "lucide-react";
import { RightShortcutBar } from "./RightShortcutBar";
import { ChromeShortcutBar } from "./Shortcuts";
import { ShortcutProvider } from "./ShortcutContext";
import { WebView, WebViewRef } from "./WebView";
import { historyService } from "@/services/historyService";

export interface TabContentRef {
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  webviewRef: React.RefObject<WebViewRef>;
}

export const TabContent = forwardRef<TabContentRef, { url?: string; onUrlSubmit?: (url: string) => void; onPageLoad?: (url: string, title: string, favicon?: string) => void; style?: React.CSSProperties }>(({ url, onUrlSubmit, onPageLoad, style }, ref) => {
  const [centerSearch, setCenterSearch] = useState("");
  const [showChromeShortcuts, setShowChromeShortcuts] = useState(true);
  const webviewRef = useRef<WebViewRef>(null);

  useImperativeHandle(ref, () => ({
    goBack: () => {
      if (webviewRef.current) {
        webviewRef.current.goBack();
      }
    },
    goForward: () => {
      if (webviewRef.current) {
        webviewRef.current.goForward();
      }
    },
    reload: () => {
      if (webviewRef.current) {
        webviewRef.current.reload();
      }
    },
    canGoBack: () => {
      return webviewRef.current ? webviewRef.current.canGoBack() : false;
    },
    canGoForward: () => {
      return webviewRef.current ? webviewRef.current.canGoForward() : false;
    },
  }));

  useEffect(() => {
    if (url) {
      // If there's a URL, we could render an iframe or webview here
      // For now, just log it
      console.log('Navigating to:', url);
    }
  }, [url]);

  const handleGoBack = () => {
    if (webviewRef.current) {
      webviewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webviewRef.current) {
      webviewRef.current.goForward();
    }
  };

  const handleReload = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  if (url && url.trim()) {
    console.log('Rendering WebView with URL:', url);
    return (
      <div className="flex-1 flex flex-col relative" style={style}>
        <WebView
          ref={webviewRef}
          src={url}
          onPageLoad={onPageLoad}
        />
      </div>
    );
  }

  return (
    <ShortcutProvider>
      <div className="flex-1 flex flex-col relative bg-tab-content top-20" style={style}>

        <div className="flex flex-col items-center mt-32 mb-8">
          <div className="flex items-center gap-3">
            <img src="/cat.png" alt="Cat" className="h-12 w-auto" />
            <h1 className="text-4xl font-medium leading-[1.3] bg-gradient-to-r from-blue-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent select-none pb-2">
              PingCat
            </h1>
          </div>
        </div>

        <div className="relative flex-1 flex flex-col items-center">
          <div className="absolute top-0 transform -translate-y-1/4 w-full max-w-lg px-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search />
              </span>
              <input
                type="text"
                placeholder="Search or type a URL"
                value={centerSearch}
                onChange={(e) => setCenterSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onUrlSubmit) {
                    onUrlSubmit(centerSearch);
                    setCenterSearch("");
                  }
                }}
                className="w-full h-10 pl-12 pr-4 rounded-full border border-border
                           bg-gradient-to-r from-blue-50/10 via-cyan-50/10 to-teal-50/10
                           text-foreground shadow focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {showChromeShortcuts && (
            <div className="mt-16">
              <ChromeShortcutBar onToggle={() => setShowChromeShortcuts(false)} />
            </div>
          )}
        </div>

        {!showChromeShortcuts && (
          <RightShortcutBar onToggle={() => setShowChromeShortcuts(true)} />
        )}
      </div>
    </ShortcutProvider>
  );
});

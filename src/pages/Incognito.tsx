import React, { useState, useEffect, useRef } from "react";
import { TabBar, Tab } from "@/components/TabBar";
import { TabContent, TabContentRef } from "@/components/TabContent";
import { BrowserToolbar } from "@/components/BrowserToolbar";
import { EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const Incognito: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([{ id: "incognito-1", title: "New Incognito Tab" }]);
  const [activeTabId, setActiveTabId] = useState("incognito-1");
  const [tabSearch, setTabSearch] = useState<Record<string, string>>({ "incognito-1": "" });
  const [tabUrl, setTabUrl] = useState<Record<string, string>>({ "incognito-1": "" });
  const tabContentRefs = useRef<Record<string, TabContentRef | null>>({});
  const { theme } = useTheme();

  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        if (event.key === 't' || event.key === 'T') {
          event.preventDefault();
          handleTabAdd();
        } else if (event.key === 'w' || event.key === 'W') {
          event.preventDefault();
          handleTabClose(activeTabId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTabId, tabs.length]);

  const handleTabAdd = () => {
    const newTab: Tab = { id: `incognito-${Date.now()}`, title: "New Incognito Tab" };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setTabSearch((prev) => ({ ...prev, [newTab.id]: "" }));
    setTabUrl((prev) => ({ ...prev, [newTab.id]: "" }));
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) {
      
      window.close();
      return;
    }
    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    setTabSearch((prev) => {
      const copy = { ...prev };
      delete copy[tabId];
      return copy;
    });
    setTabUrl((prev) => {
      const copy = { ...prev };
      delete copy[tabId];
      return copy;
    });
    if (tabId === activeTabId) {
      const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
      setActiveTabId(newTabs[newActiveIndex].id);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleGoBack = () => {
    const activeTabRef = tabContentRefs.current[activeTabId];
    if (activeTabRef) {
      if (activeTabRef.canGoBack()) {
        activeTabRef.goBack();
      } else {
        setTabUrl((prev) => ({ ...prev, [activeTabId]: "" }));
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === activeTabId ? { ...tab, title: "New Incognito Tab" } : tab
          )
        );
      }
    }
  };

  const handleGoForward = () => {
    const activeTabRef = tabContentRefs.current[activeTabId];
    if (activeTabRef && activeTabRef.canGoForward()) {
      activeTabRef.goForward();
    }
  };

  const handleReload = () => {
    const activeTabRef = tabContentRefs.current[activeTabId];
    if (activeTabRef) {
      activeTabRef.reload();
    }
  };

  const handleUrlSubmit = (url: string) => {
    if (!url.trim()) return;

    const isUrl = url.includes('.') || url.startsWith('http://') || url.startsWith('https://');

    let finalUrl: string;
    if (isUrl) {
      finalUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    } else {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }

    setTabUrl((prev) => ({ ...prev, [activeTabId]: finalUrl }));

    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, title: isUrl ? url : `Search: ${url}` }
          : tab
      )
    );
  };

  const handleCloseIncognito = () => {
    window.close();
  };

  return (
    <div className={`flex flex-col h-screen w-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Incognito Header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
        <div className="flex items-center gap-2">
          <EyeOff className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          <span className="text-sm font-medium">Incognito Mode</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
          onClick={handleCloseIncognito}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={handleTabChange}
        onTabClose={handleTabClose}
        onTabAdd={handleTabAdd}
        isVertical={false}
        onLayoutToggle={() => {}}
      />

      {/* Browser Toolbar */}
      <BrowserToolbar
        searchValue={tabSearch[activeTabId] ?? ""}
        onSearchChange={(value) =>
          setTabSearch((prev) => ({ ...prev, [activeTabId]: value }))
        }
        onUrlSubmit={handleUrlSubmit}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        activeTabId={activeTabId}
        activeProfileId="incognito"
        profileName="Incognito"
        allProfiles={[]}
        onProfileSwitch={() => {}}
      />

      {/* Tab Content */}
      <div className="flex-1 relative">
        {tabs.map((tab) => (
          <TabContent
            key={tab.id}
            ref={(ref) => {
              tabContentRefs.current[tab.id] = ref;
            }}
            url={tabUrl[tab.id]}
            onUrlSubmit={handleUrlSubmit}
            style={{
              display: tab.id === activeTabId ? 'block' : 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Incognito;

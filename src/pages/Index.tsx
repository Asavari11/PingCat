import { useState, useEffect, useRef } from "react";
import { TabBar, Tab } from "@/components/TabBar";
import { TabContent, TabContentRef } from "@/components/TabContent";
import { Sidebar } from "@/components/Sidebar";
import { BrowserToolbar } from "@/components/BrowserToolbar";
import { AIAssistant } from "@/components/AIAssistant";
import { BookmarkList } from "@/components/BookmarkList";
import React from "react";
import { historyService } from "@/services/historyService";
import { useNavigate } from "react-router-dom";

export interface ActiveProfile {
  _id: string;
  username: string;
  email: string;
  photo_url?: string | null;
}

interface IndexProps {
  profile: ActiveProfile;
  allProfiles: ActiveProfile[];
  onProfileSwitch: (profile: ActiveProfile) => void;
}

const Index: React.FC<IndexProps> = ({ profile, allProfiles, onProfileSwitch }) => {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<Tab[]>([{ id: "tab-1", title: "New Tab" }]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [tabSearch, setTabSearch] = useState<Record<string, string>>({ "tab-1": "" });
  const [tabUrl, setTabUrl] = useState<Record<string, string>>({ "tab-1": "" });
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isIncognitoMode, setIsIncognitoMode] = useState(false);
  const [theme, setTheme] = useState<'default' | 'incognito'>('default');
  const tabContentRefs = useRef<Record<string, TabContentRef | null>>({});

  
  const [localProfiles, setLocalProfiles] = useState<ActiveProfile[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("profiles");
    if (saved) {
      setLocalProfiles(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (localProfiles.length > 0) {
      localStorage.setItem("profiles", JSON.stringify(localProfiles));
    }
  }, [localProfiles]);

  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        if (event.key === 't' || event.key === 'T') {
          event.preventDefault();
          handleTabAdd();
        } else if (event.key === 'w' || event.key === 'W') {
          event.preventDefault();
          handleTabClose(activeTabId);
        } else if (event.key === 'h' || event.key === 'H') {
          event.preventDefault();
          
          window.location.href = '/history';
        } else if (event.key === 'j' || event.key === 'J') {
          event.preventDefault();
          
          window.location.href = '/downloads';
        }
      }

      
      if (event.ctrlKey && event.shiftKey && (event.key === 'n' || event.key === 'N')) {
        event.preventDefault();
        
        handleIncognitoToggle();
      }

     
      if (event.ctrlKey && event.altKey) {
        if (event.key === 't' || event.key === 'T') {
          event.preventDefault();
          
          if ((window as any).electronAPI && (window as any).electronAPI.createNewWindow) {
            (window as any).electronAPI.createNewWindow();
          } else {
           
            window.open(window.location.href, "_blank", "width=1200,height=800");
          }
        } else if (event.key === 'w' || event.key === 'W') {
          event.preventDefault();
          
          if ((window as any).electronAPI && (window as any).electronAPI.close) {
            (window as any).electronAPI.close();
          } else {
            
            window.close();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTabId, tabs.length]);

  const handleTabAdd = () => {
    const newTab: Tab = { id: `tab-${Date.now()}`, title: "New Tab" };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setTabSearch((prev) => ({ ...prev, [newTab.id]: "" }));
    setTabUrl((prev) => ({ ...prev, [newTab.id]: "" }));
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) {
      
      if ((window as any).electronAPI && (window as any).electronAPI.closeWindow) {
        (window as any).electronAPI.closeWindow();
      } else {
       
        window.close();
      }
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
            tab.id === activeTabId ? { ...tab, title: "New Tab" } : tab
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

  const handleProfileSwitch = (id: string) => {
    const matchedProfile =
      localProfiles.find((p) => p._id === id) ||
      allProfiles.find((p) => p._id === id);
    if (matchedProfile) {
      onProfileSwitch(matchedProfile);
    }
  };

  const handleUrlSubmit = (url: string) => {
    if (!url.trim()) return;

    // Check if it's a URL or search query
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

    
    if (!isIncognitoMode) {
      
    }
  };

  const handleIncognitoToggle = () => {
    const nextIncognito = !isIncognitoMode;
    setIsIncognitoMode(nextIncognito);
    setTheme(nextIncognito ? 'incognito' : 'default');
    
    if (nextIncognito) {
      setTabs([{ id: "incognito-1", title: "New Incognito Tab" }]);
      setActiveTabId("incognito-1");
      setTabSearch({ "incognito-1": "" });
      setTabUrl({ "incognito-1": "" });
    } else {
      
      setTabs([{ id: "tab-1", title: "New Tab" }]);
      setActiveTabId("tab-1");
      setTabSearch({ "tab-1": "" });
      setTabUrl({ "tab-1": "" });
    }
  };

  const handlePageLoad = (url: string, title: string, favicon?: string) => {
    console.log('handlePageLoad called with:', { url, title, favicon });

    
    let displayTitle = title?.trim();
    if (!displayTitle && url) {
      try {
        const urlObj = new URL(url);
        displayTitle = urlObj.hostname.replace('www.', '');
        console.log('Using domain as title:', displayTitle);
      } catch {
        displayTitle = url;
        console.log('Using URL as title:', displayTitle);
      }
    }
    if (!displayTitle) {
      displayTitle = 'New Tab';
      console.log('Using default title:', displayTitle);
    }

    console.log('Final display title:', displayTitle);

    
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === activeTabId) {
          console.log('Updating tab:', tab.id, 'with title:', displayTitle, 'and favicon:', favicon);
          return { ...tab, title: displayTitle, icon: favicon };
        }
        return tab;
      })
    );

    
    if (!isIncognitoMode && url && title) {
      historyService.addEntry({
        url: url,
        title: title,
        favicon: favicon,
      });
    }
  };

  const [bookmarks, setBookmarks] = useState<Array<{
    url: string;
    title?: string;
    favicon?: string;
    id?: string;
  }>>([]);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bookmarks");
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load bookmarks from localStorage', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarks]);

  const currentUrl = tabUrl[activeTabId] || "";
  const isBookmarked = currentUrl ? bookmarks.some(b => b.url === currentUrl) : false;

  const toggleBookmark = (url?: string) => {
    const target = url || currentUrl;
    if (!target) {
      
      openBookmarks();
      return;
    }
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.url === target);
      if (exists) {
        return prev.filter((b) => b.url !== target);
      }
     
      const title = tabs.find(t => t.id === activeTabId)?.title || target;
      
      const tab = tabs.find(t => t.id === activeTabId);
      const favicon = tab?.icon;
      return [...prev, { url: target, title, favicon, id: `bm-${Date.now()}` }];
    });
  };

  const navigateToUrl = (url: string) => {
    
    setTabUrl(prev => ({ ...prev, [activeTabId]: url }));
    
    
    setTabs(prevTabs =>
      prevTabs.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, title: url }
          : tab
      )
    );

    setIsBookmarksOpen(false); 
  };

  const openBookmarks = () => {
    setIsBookmarksOpen(true);
  };

  return (
    <div className={`flex h-screen w-full relative ${theme === 'incognito' ? 'bg-gray-900 text-gray-100' : ''}`}>
      <BookmarkList
        open={isBookmarksOpen}
        onOpenChange={setIsBookmarksOpen}
        bookmarks={bookmarks}
        onNavigate={navigateToUrl}
        onRemoveBookmark={toggleBookmark}
      />

      {!isVerticalLayout &&
        (isAssistantOpen ? (
          <AIAssistant
            onClose={() => setIsAssistantOpen(false)}
            currentTab={{
              url: tabUrl[activeTabId] || "",
              title: tabs.find(t => t.id === activeTabId)?.title || "",
              searchQuery: tabSearch[activeTabId] || ""
            }}
            webviewRef={tabContentRefs.current[activeTabId] as any}
            onNavigate={handleUrlSubmit}
            onSearch={handleUrlSubmit}
            onOpenSettings={(section) => navigate('/settings')}
          />
        ) : (
          <Sidebar
            isVerticalLayout={isVerticalLayout}
            isAssistantOpen={isAssistantOpen}
            onAssistantToggle={() => setIsAssistantOpen(true)}
            currentUrl={currentUrl}
            onToggleBookmark={toggleBookmark}
            onOpenBookmarks={openBookmarks}
            isBookmarked={isBookmarked}
          />
        ))}

      <div className="flex flex-col flex-1 overflow-hidden relative">
        {isVerticalLayout ? (
          <div className="flex flex-1 overflow-hidden">
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabChange={handleTabChange}
              onTabClose={handleTabClose}
              onTabAdd={handleTabAdd}
              isVertical={isVerticalLayout}
              onLayoutToggle={() => setIsVerticalLayout(!isVerticalLayout)}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
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
                activeProfileId={profile._id}
                profileName={profile.username}
                allProfiles={localProfiles.map((p) => ({
                  id: p._id,
                  name: p.username,
                }))}
                onProfileSwitch={(id) => handleProfileSwitch(id)}
              />
              <div className="flex-1 relative">
                {tabs.map((tab) => (
                  <TabContent
                    key={tab.id}
                    ref={(ref) => {
                      tabContentRefs.current[tab.id] = ref;
                    }}
                    url={tabUrl[tab.id]}
                    onUrlSubmit={handleUrlSubmit}
                    onPageLoad={handlePageLoad}
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

            <Sidebar
              isVerticalLayout={isVerticalLayout}
              isAssistantOpen={false}
              onAssistantToggle={() => {}}
              currentUrl={currentUrl}
              onToggleBookmark={toggleBookmark}
              onOpenBookmarks={openBookmarks}
              isBookmarked={isBookmarked}
            />
          </div>
        ) : (
          <>
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabChange={handleTabChange}
              onTabClose={handleTabClose}
              onTabAdd={handleTabAdd}
              isVertical={isVerticalLayout}
              onLayoutToggle={() => setIsVerticalLayout(!isVerticalLayout)}
            />

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
              activeProfileId={profile._id}
              profileName={profile.username}
              allProfiles={localProfiles.map((p) => ({
                id: p._id,
                name: p.username,
              }))}
              onProfileSwitch={(id) => handleProfileSwitch(id)}
            />

              <div className="flex-1 relative">
                {tabs.map((tab) => (
                  <TabContent
                    key={tab.id}
                    ref={(ref) => {
                      tabContentRefs.current[tab.id] = ref;
                    }}
                    url={tabUrl[tab.id]}
                    onUrlSubmit={handleUrlSubmit}
                    onPageLoad={handlePageLoad}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Index;

import { useState, useMemo } from "react";
import { TabBar, Tab } from "@/components/TabBar";
import { TabContent } from "@/components/TabContent";
import { Sidebar } from "@/components/Sidebar";
import { BrowserToolbar } from "@/components/BrowserToolbar";
import { AIAssistant } from "@/components/AIAssistant"; 
import React from 'react';

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
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "tab-1", title: `New Tab` },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [tabSearch, setTabSearch] = useState<Record<string, string>>({ "tab-1": "" });
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);
  
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantWidth, setAssistantWidth] = useState(320); 

  
  const handleTabAdd = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: "New Tab",
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setTabSearch((prev) => ({ ...prev, [newTab.id]: "" }));
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;
    
    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    setTabSearch((prev) => {
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

  return (
    <div className="flex h-screen w-full relative"> 
      
      {!isVerticalLayout && (
          isAssistantOpen ? (
            <AIAssistant 
              onClose={() => setIsAssistantOpen(false)}
              onWidthChange={setAssistantWidth}
            />
          ) : (
            <Sidebar 
              isVerticalLayout={isVerticalLayout} 
              isAssistantOpen={isAssistantOpen}
              onAssistantToggle={() => setIsAssistantOpen(true)} 
            />
          )
      )}
      
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
              activeTabId={activeTabId}
              activeProfileId={profile._id}        
              profileName={profile.username}       
              allProfiles={allProfiles.map(p => ({ id: p._id, name: p.username }))}
              onProfileSwitch={(id, name) => {
                const matchedProfile = allProfiles.find(p => p._id === id);
                if (matchedProfile) onProfileSwitch(matchedProfile);
                else onProfileSwitch({ _id: '', username: '', email: '' }); 
              }}
            />


            <TabContent key={activeTabId}/>
            </div>
            <Sidebar isVerticalLayout={isVerticalLayout} isAssistantOpen={false} onAssistantToggle={() => {}} /> 
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
              activeTabId={activeTabId}
              activeProfileId={profile._id}       
              profileName={profile.username}       
              allProfiles={allProfiles.map(p => ({ id: p._id, name: p.username }))} 
              onProfileSwitch={(id, name) => {
                const matchedProfile = allProfiles.find(p => p._id === id);
                if (matchedProfile) onProfileSwitch(matchedProfile);
                else onProfileSwitch({ _id: '', username: '', email: '' });
              }}
            />

            <TabContent key={activeTabId}/>
          </>
        )}
      </div>
      
    </div>
  );
};

export default Index;
import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { SettingsModal } from './components/SettingsModal';
import { useChatStore } from './stores/chatStore';

const App: React.FC = () => {
  const { theme } = useChatStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex h-[100dvh] w-full bg-white dark:bg-surface-900 overflow-hidden">
      <Sidebar />
      <ChatWindow />
      <SettingsModal />
    </div>
  );
};

export default App;

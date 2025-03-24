import { Chat } from '@/components/Chat.tsx';
import { Sidebar } from '@/components/Sidebar';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Menu, X } from 'lucide-react';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleChatSelected = () => {
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('sidebarclose', handleChatSelected);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('sidebarclose', handleChatSelected);
    };
  }, []);

  useEffect(() => sessionStorage.clear(), []);

  return (
    <div className="flex items-center justify-center h-screen max-w-7xl mx-auto">
      <button
        className="fixed top-4 right-4 z-20 sm:hidden bg-blue-600 dark:bg-teal-700 text-white p-2 rounded-md"
        onClick={() => setIsMobileMenuOpen(prev => !prev)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div className="flex h-3/4 w-full mx-4 sm:mx-20 justify-center relative">
        <div
          className={`fixed sm:hidden top-0 left-0 h-full w-3/4 max-w-xs z-10 transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar />
        </div>
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        <Chat />
      </div>
      <Toaster />
    </div>
  );
}

export default App;

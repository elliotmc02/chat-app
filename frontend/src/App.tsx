import { Chat } from '@/components/Chat.tsx';
import { Sidebar } from '@/components/Sidebar';
import { Toaster } from 'react-hot-toast';

function App() {
  sessionStorage.clear();
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex h-3/4 w-full mx-20">
        <Sidebar />
        <Chat />
      </div>
      <Toaster />
    </div>
  );
}

export default App;

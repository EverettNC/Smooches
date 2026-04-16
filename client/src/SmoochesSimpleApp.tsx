// Smooches App – Frontend with Login/Logout, Live Screen, and Video Feed (React + Tailwind + Context)

import React, { useState, createContext, useContext } from "react";

// Create context for authentication
const AuthContext = createContext<any>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'live' | 'feed'>('home');

  const login = (username: string) => setUser({ name: username });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, activeTab, setActiveTab }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// Simplified login page
function LoginPage() {
  const [name, setName] = useState("");
  const { login } = useAuth();

  return (
    <div className="p-6 max-w-sm mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Login to Smooches</h1>
      <input
        className="border p-2 rounded w-full mb-4"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors"
        onClick={() => login(name)}
      >
        Login
      </button>
    </div>
  );
}

// Feed Page component
function FeedPage() {
  const videos = [
    { 
      id: 1, 
      user: "Kiki", 
      url: "https://cdn.ebaumsworld.com/mediaFiles/video/2198054/82679290.mp4", 
      caption: "🔥 Morning vibes!" 
    },
    { 
      id: 2, 
      user: "Lash", 
      url: "https://cdn.ebaumsworld.com/mediaFiles/video/2198054/82679290.mp4", 
      caption: "Manifesting chaos 💅" 
    },
    { 
      id: 3, 
      user: "Big Tank", 
      url: "https://cdn.ebaumsworld.com/mediaFiles/video/2198054/82679290.mp4", 
      caption: "Late-night rants incoming." 
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4">🎥 Video Feed</h2>
      {videos.map((vid) => (
        <div key={vid.id} className="bg-white rounded-xl shadow p-4">
          <video
            className="w-full rounded"
            src={vid.url}
            controls
            loop
            poster="https://placehold.co/600x400/black/white?text=Loading+Video..."
          />
          <div className="mt-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                {vid.user.charAt(0)}
              </div>
              <strong className="text-gray-800">@{vid.user}</strong>
            </div>
            <p className="text-gray-600 ml-10">{vid.caption}</p>
            
            <div className="flex gap-4 mt-3 ml-10">
              <button className="flex items-center gap-1 text-gray-500 hover:text-pink-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>Like</span>
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-pink-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>Comment</span>
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-pink-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Live Stream page
function LivePage() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">🔴 Live Smooches</h2>
      <iframe
        className="w-full h-64 rounded border"
        src="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID"
        title="Live Stream"
        allowFullScreen
      ></iframe>
      <p className="mt-4 text-sm text-gray-600">Live stream is powered via external service. Replace URL with your live source.</p>
    </div>
  );
}

// Home page with welcome message
function HomePage() {
  const { user, logout, setActiveTab } = useAuth();
  
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Smooches, {user?.name} 💋</h1>
      <div className="mb-6 space-x-4">
        <button 
          onClick={() => setActiveTab('live')} 
          className="text-pink-600 underline font-medium hover:text-pink-700"
        >
          Join Live
        </button>
        <button 
          onClick={() => setActiveTab('feed')} 
          className="text-pink-600 underline font-medium hover:text-pink-700"
        >
          Watch Feed
        </button>
      </div>
      <button
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition-colors"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}

// Navigation component
function Navigation() {
  const { activeTab, setActiveTab } = useAuth();
  
  return (
    <nav className="p-4 bg-pink-100 text-center flex justify-center space-x-6">
      <button 
        onClick={() => setActiveTab('home')}
        className={`px-4 py-1 rounded-full transition-colors ${activeTab === 'home' ? 'bg-pink-500 text-white' : 'text-pink-800 hover:bg-pink-200'}`}
      >
        Home
      </button>
      <button 
        onClick={() => setActiveTab('live')}
        className={`px-4 py-1 rounded-full transition-colors ${activeTab === 'live' ? 'bg-pink-500 text-white' : 'text-pink-800 hover:bg-pink-200'}`}
      >
        Live
      </button>
      <button 
        onClick={() => setActiveTab('feed')}
        className={`px-4 py-1 rounded-full transition-colors ${activeTab === 'feed' ? 'bg-pink-500 text-white' : 'text-pink-800 hover:bg-pink-200'}`}
      >
        Feed
      </button>
    </nav>
  );
}

// Main App Component
function SmoochesSimpleApp() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 shadow-md">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-xl font-bold">SMOOCHES</h1>
          </div>
        </header>
        
        <Content />
      </div>
    </AuthProvider>
  );
}

// Content component that handles showing login or app pages
function Content() {
  const { user, activeTab } = useAuth();
  
  if (!user) {
    return <LoginPage />;
  }
  
  return (
    <>
      <Navigation />
      <div className="container mx-auto max-w-2xl">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'live' && <LivePage />}
        {activeTab === 'feed' && <FeedPage />}
      </div>
    </>
  );
}

export default SmoochesSimpleApp;
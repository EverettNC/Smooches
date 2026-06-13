import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth-simple";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircle, Settings, Crown, Home, Video, Radio as RadioIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/">
            <div className="flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform">
              <img 
                src="/smooches-logo.jpeg" 
                alt="SMOOCHES" 
                className="w-16 h-16 object-cover rounded-full animate-pulse shadow-lg border-2 border-orange-700 hover:border-red-700 transition-colors"
                style={{filter: 'saturate(3) contrast(2) brightness(1.3) hue-rotate(5deg)'}}
              />
              <span className="text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-blue-700 bg-clip-text text-transparent tracking-wider drop-shadow-lg" style={{filter: 'saturate(2) contrast(1.5)'}}>
                SMOOCHES
              </span>
            </div>
          </Link>
          
          {/* Main Navigation + Search */}
          {user && (
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="lg" className="flex items-center space-x-2 text-xl font-black hover:bg-orange-400/20 hover:text-orange-500 transition-all transform hover:scale-110 border-2 border-transparent hover:border-orange-400">
                  <Home className="w-6 h-6" />
                  <span>For You</span>
                </Button>
              </Link>
              <Link href="/live">
                <Button variant="ghost" size="lg" className="flex items-center space-x-2 text-xl font-black hover:bg-red-400/20 hover:text-red-500 transition-all transform hover:scale-110 border-2 border-transparent hover:border-red-400">
                  <Video className="w-6 h-6" />
                  <span>Live</span>
                </Button>
              </Link>
              <Link href="/radio">
                <Button variant="ghost" size="lg" className="flex items-center space-x-2 text-xl font-black hover:bg-blue-400/20 hover:text-blue-500 transition-all transform hover:scale-110 border-2 border-transparent hover:border-blue-400">
                  <RadioIcon className="w-6 h-6" />
                  <span>Radio</span>
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="ghost" size="lg" className="flex items-center space-x-2 text-xl font-black hover:bg-orange-500/20 hover:text-orange-600 transition-all transform hover:scale-110 border-2 border-transparent hover:border-orange-500">
                  <Plus className="w-6 h-6" />
                  <span>Create</span>
                </Button>
              </Link>
              <Link href={`/profile/${user.id}`}>
                <Button variant="ghost" size="lg" className="flex items-center space-x-2 text-xl font-black hover:bg-purple-400/20 hover:text-purple-500 transition-all transform hover:scale-110 border-2 border-transparent hover:border-purple-400">
                  <UserCircle className="w-6 h-6" />
                  <span>Profile</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Search (basic discovery / indexing) */}
          {user && (
            <div className="relative w-64">
              <input
                className="w-full bg-background border border-border rounded-full px-3 py-1 text-sm focus:outline-none focus:border-primary"
                placeholder="Search videos, clips, radio..."
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && (e.currentTarget as HTMLInputElement).value.trim()) {
                    const q = (e.currentTarget as HTMLInputElement).value.trim();
                    try {
                      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { credentials: 'include' });
                      const data = await r.json();
                      // Simple: alert top result or could navigate
                      if (data.videos?.[0]) {
                        // could setLocation but for minimal impact use console + toast via global not here
                        window.location.href = '/';
                      }
                    } catch {}
                  }
                }}
              />
            </div>
          )}
          
          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              {user.role === "admin" && (
                <div className="hidden sm:flex items-center gap-1 text-primary">
                  <Crown size={16} />
                  <span className="text-sm font-medium">Admin</span>
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} alt={user.displayName} />
                      <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={`/profile/${user.id}`}>
                    <DropdownMenuItem>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
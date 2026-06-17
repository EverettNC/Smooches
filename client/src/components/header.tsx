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
import { LogOut, UserCircle, Settings, Crown, Home, Video, Radio as RadioIcon, Plus, Cog, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-panel/95 backdrop-blur border-b border-brass/30 shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <Link href="/">
              <div className="flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <div className="absolute -inset-1 bg-brass-gradient opacity-20 blur-lg rounded-full animate-pulse-slow"></div>
                  <img
                    src="/smooches-logo.jpeg"
                    alt="SMOOCHES"
                    className="w-16 h-16 object-cover rounded-full relative z-10 border-2 border-brass/50 hover:border-brass transition-all duration-300 shadow-[0_0_20px_rgba(201,162,75,0.3)]"
                    style={{filter: 'saturate(1.5) contrast(1.2) sepia(0.2) hue-rotate(-10deg)'}}
                  />
                </div>
                <span className="text-2xl font-black bg-brass-gradient bg-clip-text text-transparent tracking-wider drop-shadow-[0_2px_10px_rgba(201,162,75,0.4)]">
                  SMOOCHES
                </span>
                <Cog className="w-6 h-6 text-brass/60 animate-spin-slow opacity-50" />
              </div>
            </Link>
         
            {/* Main Navigation + Search */}
            {user && (
              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="lg" className="flex items-center gap-2 text-lg font-bold hover:bg-brass/10 hover:text-brass transition-all duration-300 border border-transparent hover:border-brass/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-brass/5 via-transparent to-brass/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <Home className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">For You</span>
                  </Button>
                </Link>
                <Link href="/live">
                  <Button variant="ghost" size="lg" className="flex items-center gap-2 text-lg font-bold hover:bg-teal/10 hover:text-teal transition-all duration-300 border border-transparent hover:border-teal/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal/5 via-transparent to-teal/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <Video className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Live</span>
                    <Zap className="w-4 h-4 relative z-10 text-teal animate-pulse" />
                  </Button>
                </Link>
                <Link href="/radio">
                  <Button variant="ghost" size="lg" className="flex items-center gap-2 text-lg font-bold hover:bg-brass-mid/10 hover:text-brass-mid transition-all duration-300 border border-transparent hover:border-brass-mid/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-brass-mid/5 via-transparent to-brass-mid/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <RadioIcon className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Radio</span>
                  </Button>
                </Link>
                <Link href="/create">
                  <Button variant="ghost" size="lg" className="flex items-center gap-2 text-lg font-bold hover:bg-brass-hi/10 hover:text-brass-hi transition-all duration-300 border border-transparent hover:border-brass-hi/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-brass-hi/5 via-transparent to-brass-hi/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <Plus className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Create</span>
                  </Button>
                </Link>
                <Link href={`/profile/${user.id}`}>
                  <Button variant="ghost" size="lg" className="flex items-center gap-2 text-lg font-bold hover:bg-brass-lo/10 hover:text-brass-lo transition-all duration-300 border border-transparent hover:border-brass-lo/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-brass-lo/5 via-transparent to-brass-lo/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <UserCircle className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Profile</span>
                  </Button>
                </Link>
              </div>
            )}

          {/* Search (basic discovery / indexing) */}
          {user && (
            <div className="relative w-64">
              <input
                className="w-full bg-panel border border-brass/30 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/30 bg-panel/80 backdrop-blur placeholder:text-ink-tertiary"
                placeholder="Search videos, clips, radio..."
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && (e.currentTarget as HTMLInputElement).value.trim()) {
                    const q = (e.currentTarget as HTMLInputElement).value.trim();
                    try {
                      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { credentials: 'include' });
                      const data = await r.json();
                      if (data.videos?.[0]) {
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
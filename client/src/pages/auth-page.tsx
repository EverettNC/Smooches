import { useState, useEffect, FormEvent } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth-simple";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Radio, Video, Users } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");

  const { user, login, register, isLoading } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Debug: log when activeTab changes
  useEffect(() => {
    console.log('activeTab changed:', activeTab);
  }, [activeTab]);

  // Handle form submissions
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login({ username, password });
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      await register({ username, password, email, displayName });
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setRegisterLoading(false);
    }
  };

  const [, setLocation] = useLocation();

  // Redirect if user is already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Auth form */}
      <div className="flex-1 flex flex-col justify-center p-10">
        <div className="max-w-md mx-auto w-full">
          <div className="flex flex-col items-center gap-8 mb-12">
            <img
              src="/smooches-mark.png"
              alt="SMOOCHES lips logo"
              className="w-48 h-48 md:w-56 md:h-56 rounded-full"
            />
            <h1 className="text-6xl md:text-7xl font-black text-primary tracking-wide text-center">
              SMOOCHES
            </h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Your platform for interactive audio streaming and content creation
          </p>

          {/* Custom tabs - replaces broken Radix UI Tabs */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={activeTab === "login" ? "default" : "outline"}
                className="w-full"
                onClick={() => setActiveTab("login")}
              >
                Login
              </Button>
              <Button
                variant={activeTab === "register" ? "default" : "outline"}
                className="w-full"
                onClick={() => setActiveTab("register")}
              >
                Register
              </Button>
            </div>
          </div>

          {activeTab === "login" && (
            <Card className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full font-black py-4 text-xl" disabled={loginLoading}>
                  {loginLoading ? "Logging in..." : "🚀 LOGIN"}
                </Button>
              </form>

            </Card>
          )}

          {activeTab === "register" && (
            <Card className="p-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                    Display Name
                  </label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reg-username" className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <Input
                    id="reg-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full font-black py-4 text-xl" disabled={registerLoading}>
                  {registerLoading ? "Creating account..." : "✨ CREATE ACCOUNT"}
                </Button>
              </form>
            </Card>
          )}

        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="p-10 flex flex-col justify-center max-w-lg mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Stream, Share, and Succeed
          </h2>
          <p className="mb-8 text-white/80">
            Smooches is the platform where content creators connect and collaborate
            through interactive radio stations and social broadcasting.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">Video Sharing</h3>
                <p className="text-sm text-white/80">
                  Share your content with followers and receive feedback in real-time
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">Interactive Radio</h3>
                <p className="text-sm text-white/80">
                  Host your own radio station and connect with your audience
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">Creator Community</h3>
                <p className="text-sm text-white/80">
                  Join a thriving community of creators to collaborate and grow
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
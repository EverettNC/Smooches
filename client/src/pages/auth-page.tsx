import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth-simple";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

  // Handle form submissions
  const handleLogin = async (e: React.FormEvent) => {
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

  const handleRegister = async (e: React.FormEvent) => {
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
              src="/smooches-logo.jpeg" 
              alt="SMOOCHES" 
              className="w-[3840px] h-[3840px] object-cover rounded-full animate-pulse shadow-2xl border-[40px] border-orange-700 hover:border-red-700 transition-colors"
              style={{filter: 'saturate(3) contrast(2) brightness(1.3) hue-rotate(5deg)'}}
            />
            <h1 className="text-9xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-blue-700 bg-clip-text text-transparent tracking-wider drop-shadow-2xl text-center animate-bounce" style={{filter: 'saturate(2) contrast(1.5)'}}>
              SMOOCHES
            </h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Your platform for interactive audio streaming and content creation
          </p>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
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
                  <Button type="submit" className="w-full bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-800 hover:to-red-800 text-white font-black py-4 text-xl transition-all transform hover:scale-110 shadow-xl hover:shadow-2xl border-2 border-orange-600" style={{filter: 'saturate(2) contrast(1.5) brightness(1.2)'}} disabled={loginLoading}>
                    {loginLoading ? "Logging in..." : "🚀 LOGIN"}
                  </Button>
                </form>
                
                {/* Quick Admin Login */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2 text-center">Quick Access</p>
                  <Button 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={async () => {
                      setUsername("superadmin");
                      setPassword("admin123");
                      setLoginLoading(true);
                      try {
                        await login({ username: "superadmin", password: "admin123" });
                      } catch (error) {
                        // Error handled by mutation
                      } finally {
                        setLoginLoading(false);
                      }
                    }}
                    disabled={loginLoading}
                  >
                    Admin Login
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="register">
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
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white font-black py-4 text-xl transition-all transform hover:scale-110 shadow-xl hover:shadow-2xl border-2 border-blue-600" style={{filter: 'saturate(2) contrast(1.5) brightness(1.2)'}} disabled={registerLoading}>
                    {registerLoading ? "Creating account..." : "✨ CREATE ACCOUNT"}
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
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
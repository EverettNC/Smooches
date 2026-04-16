import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { Send } from "lucide-react";

interface Message {
  userId: number;
  username: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

interface ChatSidebarProps {
  streamId: number;
  userId: number;
  username: string;
}

export function ChatSidebar({ streamId, userId, username }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only attempt WebSocket connection if page is not loaded in an iframe
    if (window.top === window.self) {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log("Chat: Attempting to connect to WebSocket:", wsUrl);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("Chat: WebSocket connection established");
          try {
            ws.send(JSON.stringify({ type: 'join', streamId }));
          } catch (err) {
            console.error("Chat: Error sending join message:", err);
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'chat') {
              setMessages(prev => [...prev, data]);
              setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          } catch (err) {
            console.error("Chat: Error parsing WebSocket message:", err);
          }
        };

        ws.onerror = (error) => {
          console.error("Chat: WebSocket error:", error);
        };

        ws.onclose = (event) => {
          console.log("Chat: WebSocket connection closed:", event.code, event.reason);
        };

        wsRef.current = ws;
        return () => {
          try {
            ws.close();
          } catch (err) {
            console.error("Chat: Error closing WebSocket:", err);
          }
        };
      } catch (error) {
        console.error("Chat: Failed to establish WebSocket connection:", error);
      }
    }
  }, [streamId]);

  const sendMessage = () => {
    if (!message.trim() || !wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      type: 'chat',
      streamId,
      userId,
      username,
      content: message.trim()
    }));

    setMessage("");
  };

  return (
    <div className="w-80 border-l border-border bg-card/50 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Live Chat</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <ChatMessage key={i} {...msg} />
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <form 
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

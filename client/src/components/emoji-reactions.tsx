import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import type { Reaction } from '@shared/schema';

const EMOJI_LIST = ['❤️', '😂', '😮', '😢', '😡', '👏'];

interface EmojiReactionsProps {
  targetType: 'video' | 'radio' | 'live';
  targetId: number;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
}

export function EmojiReactions({ targetType, targetId }: EmojiReactionsProps) {
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const { data: reactions } = useQuery<Reaction[]>({
    queryKey: [`/api/reactions/${targetType}/${targetId}`],
  });

  useEffect(() => {
    // Only attempt WebSocket connection if page is not loaded in an iframe
    // This helps prevent WebSocket connection errors in certain contexts
    if (window.top === window.self) {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log("Attempting to connect to WebSocket:", wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log("WebSocket connection established");
          socket.send(JSON.stringify({ 
            type: 'join_reactions',
            targetType,
            targetId
          }));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'reaction') {
              addFloatingEmoji(data.emoji);
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        socket.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason);
        };

        setWs(socket);
        return () => {
          try {
            socket.close();
          } catch (err) {
            console.error("Error closing WebSocket:", err);
          }
        };
      } catch (error) {
        console.error("Failed to establish WebSocket connection:", error);
      }
    }
  }, [targetType, targetId]);

  const addFloatingEmoji = (emoji: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const x = Math.random() * 80; // Random x position within container
    
    setFloatingEmojis(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 3000);
  };

  const sendReaction = async (emoji: string) => {
    try {
      await apiRequest('POST', '/api/reactions', {
        targetType,
        targetId,
        emoji,
        userId: 1 // TODO: Replace with actual user ID from auth
      });

      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'reaction',
          targetType,
          targetId,
          emoji
        }));
      }
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  };

  return (
    <div className="relative">
      {/* Floating emojis container */}
      <div className="absolute bottom-full w-full h-96 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {floatingEmojis.map(({ id, emoji, x }) => (
            <motion.div
              key={id}
              className="absolute text-2xl"
              initial={{ bottom: 0, x: `${x}%`, opacity: 0, scale: 0.5 }}
              animate={{ 
                bottom: '100%', 
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 1, 0.8]
              }}
              transition={{ duration: 3, ease: 'easeOut' }}
              exit={{ opacity: 0 }}
            >
              {emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Emoji buttons */}
      <div className="flex gap-2 p-2 bg-background/80 backdrop-blur-sm rounded-full">
        {EMOJI_LIST.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            onClick={() => sendReaction(emoji)}
            className="hover:bg-accent rounded-full h-8 w-8 p-0"
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  );
}

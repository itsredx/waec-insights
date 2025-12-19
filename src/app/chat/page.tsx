"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Loader2, Send, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Message = {
  role: 'user' | 'ai';
  content: string;
}

export default function ChatPage() {
  // Note: avoid using next/navigation's useSearchParams in this page because
  // it causes a prerender-time hook call that fails during static export.
  // Read the query param from window.location inside a client-only effect below.
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I have access to the Kano WAEC data (2016-2021). Ask me anything about pass rates, gender gaps, or school performance.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const hasProcessedQuery = useRef(false)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading])

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return
    const userMessage: Message = { role: 'user', content: messageText }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const reader = await api.chat(messageText);
      const decoder = new TextDecoder();

      // Add initial empty AI message
      setMessages(prev => [...prev, { role: 'ai', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'ai') {
            lastMsg.content = lastMsg.content + chunk;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error connecting to the server." }]);
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    await sendMessage(input)
  }

  // Handle initial query from URL (from prediction page)
  useEffect(() => {
    // Read the `q` parameter from the URL on the client to avoid server-side
    // usage of `useSearchParams`, which can cause prerender errors.
    if (typeof window === 'undefined') return
    try {
      const params = new URLSearchParams(window.location.search)
      const query = params.get('q')
      if (query && !hasProcessedQuery.current) {
        hasProcessedQuery.current = true
        // Small delay to ensure component is mounted
        setTimeout(() => {
          sendMessage(query)
        }, 100)
      }
    } catch (err) {
      // Fail silently if parsing the URL fails in any environment.
      // This keeps the component robust during prerender/build.
      // eslint-disable-next-line no-console
      console.error('Failed to read query param for chat page', err)
    }
  }, [sendMessage])

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col shadow-lg w-full h-full max-w-3xl mx-auto">
        <CardHeader className="border-b">
          <CardTitle>Data Analyst Agent</CardTitle>
          <CardDescription>Powered by WAEC 2016-2021 Dataset</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex items-start gap-3", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {m.role === 'ai' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    "p-3 rounded-lg text-sm max-w-[85%]",
                    m.role === 'user' ? 'bg-primary text-primary-foreground whitespace-pre-wrap' : 'bg-muted prose prose-sm dark:prose-invert max-w-none'
                  )}>
                    {m.role === 'ai' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    ) : (
                      m.content
                    )}
                  </div>
                  {m.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><User size={20} /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                  </Avatar>
                  <div className="p-3 rounded-lg bg-muted flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 border-t">
          <div className="w-full flex gap-2">
            <Input
              placeholder="Ask a question about the data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              autoFocus
            />
            <Button onClick={handleSend} size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

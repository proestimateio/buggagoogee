import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

export default function ChatBox({ saveData, world }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === "create" && event.data?.world === world) {
        setMessages(prev => [...prev.slice(-49), event.data]);
        if (!open) setUnread(u => u + 1);
      }
    });
    return () => unsub();
  }, [world, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [open, messages]);

  async function loadMessages() {
    const msgs = await base44.entities.ChatMessage.filter({ world }, "-created_date", 30);
    setMessages(msgs.reverse());
  }

  async function sendMessage() {
    if (!input.trim() || !saveData) return;
    const msg = input.trim().slice(0, 100);
    setInput("");
    await base44.entities.ChatMessage.create({
      username: saveData.username,
      character: saveData.character,
      character_color: saveData.character_color,
      message: msg,
      world,
    });
  }

  const CHAR_EMOJIS = { eli: "🧑", lyla: "👧", buggagoogee: "🐕", shadow: "🦊", blaze: "🔥" };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative glass-card rounded-2xl p-3 border border-white/20 hover:border-purple-400/50 transition-all"
      >
        <MessageCircle className="w-5 h-5 text-white" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
          >
            <div className="glass-card rounded-2xl border border-purple-500/30 overflow-hidden"
              style={{ boxShadow: "0 0 20px rgba(168,85,247,0.2)" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                  <span className="font-black text-white text-sm">World Chat</span>
                  <span className="text-xs text-white/40">({world})</span>
                </div>
                <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-white/50 hover:text-white" /></button>
              </div>

              {/* Messages */}
              <div className="h-56 overflow-y-auto px-3 py-2 space-y-2" style={{ scrollbarWidth: "thin" }}>
                {messages.length === 0 && (
                  <p className="text-white/30 text-xs text-center mt-8">No messages yet. Say hi! 👋</p>
                )}
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className="flex items-start gap-2">
                    <span className="text-lg shrink-0">{CHAR_EMOJIS[msg.character] || "🎮"}</span>
                    <div>
                      <span className="text-xs font-black" style={{ color: msg.character_color || "#a855f7" }}>
                        {msg.username}
                      </span>
                      <p className="text-white/80 text-sm leading-tight">{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/10 p-3 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value.slice(0, 100))}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Say something..."
                  className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-purple-400 transition-colors"
                />
                <button onClick={sendMessage}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}>
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
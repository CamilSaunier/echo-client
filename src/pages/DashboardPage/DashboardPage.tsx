// src/pages/DashboardPage/DashboardPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { useChatStore } from "../../stores/chat.store";
import { useAuthStore } from "../../stores/auth.stores";
import { socketService } from "../../services/socket.service";
import "./DashboardPage.css";

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { conversations, activeConversationId, messages, fetchConversations, sendMessage, initSocketListeners, cleanupSocketListeners } =
    useChatStore();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socketService.connect();
    fetchConversations();
    initSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, [fetchConversations, initSocketListeners, cleanupSocketListeners]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    await sendMessage(inputMessage);
    setInputMessage("");
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="chat-main-container">
      {activeConversationId ? (
        <>
          <header className="chat-header">
            <h3>{activeConversation?.name || activeConversation?.participants.find((p) => p.userId !== user?.id)?.user.username || "Discussion"}</h3>
          </header>

          <div className="messages-feed">
            {messages.map((msg) => {
              const isMine = msg.userId === user?.id;
              return (
                <div key={msg.id} className={`message-bubble-wrapper ${isMine ? "mine" : "other"}`}>
                  {!isMine && <span className="message-author">{msg.user?.username || "Inconnu"}</span>}
                  <div className="message-bubble">
                    <p>{msg.content}</p>
                    <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input type="text" placeholder="Écrivez votre message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
            <button type="submit" disabled={!inputMessage.trim()}>
              Envoyer
            </button>
          </form>
        </>
      ) : (
        <div className="empty-chat-state">
          <h3>Bienvenue dans Echo</h3>
          <p>Sélectionnez une discussion dans la barre latérale pour commencer.</p>
        </div>
      )}
    </div>
  );
};

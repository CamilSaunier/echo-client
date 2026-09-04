import React, { useEffect, useRef, useState } from "react";
import { Send, Hash, MessageSquare } from "lucide-react";
import { useChatStore } from "../../stores/chat.store";
import { useAuthStore } from "../../stores/auth.stores";
import "./ChatArea.css";

export const ChatArea: React.FC = () => {
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const { activeConversationId, conversations, messages, sendMessage, isLoading } = useChatStore();

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const otherParticipant = activeConversation?.participants?.find((p) => p.userId !== currentUser?.id);

  const chatTitle = activeConversation?.name || otherParticipant?.user?.username || "Discussion";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const messageText = content;
    setContent("");
    await sendMessage(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatMessageTime = (dateInput: string) => {
    return new Date(dateInput).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!activeConversationId) {
    return (
      <div className="chat-empty-state">
        <MessageSquare size={48} className="empty-icon" />
        <h3>Aucune discussion sélectionnée</h3>
        <p>Choisissez un canal dans la barre latérale pour commencer à échanger.</p>
      </div>
    );
  }

  return (
    <div className="chat-area-container">
      {/* En-tête */}
      <div className="chat-header">
        <Hash size={20} className="channel-icon" />
        <h2 className="channel-title">{chatTitle}</h2>
      </div>

      {/* Liste des messages */}
      <div className="messages-container">
        {isLoading && messages.length === 0 ? (
          <div className="messages-loading">Chargement des messages...</div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.userId === currentUser?.id;

            return (
              <div key={msg.id} className={`message-wrapper ${isMine ? "mine" : "other"}`}>
                {!isMine && <span className="message-author">{msg.user?.username || "Utilisateur"}</span>}
                <div className="message-bubble">
                  <p className="message-text">{msg.content}</p>
                  <span className="message-time">{formatMessageTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire de saisie */}
      <form className="chat-input-container" onSubmit={handleSend}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Envoyer un message dans #${chatTitle}...`}
          rows={1}
        />
        <button type="submit" className="send-btn" disabled={!content.trim()} aria-label="Envoyer le message">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

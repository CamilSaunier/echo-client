// src/components/ChatArea/ChatArea.tsx
import React, { useEffect, useRef, useState } from "react";
import { Send, Hash, MessageSquare, ArrowLeft } from "lucide-react";
import { useChatStore } from "../../stores/chat.store";
import { useAuthStore } from "../../stores/auth.stores";
import { LeaveConversationButton } from "../LeaveConversationButton/LeaveConversationButton";
import "./ChatArea.css";

export const ChatArea: React.FC = () => {
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const { activeConversationId, conversations, messages, sendMessage, isLoading, typingUsers, sendTypingStatus } = useChatStore();

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const otherParticipant = activeConversation?.participants?.find((p) => p.userId !== currentUser?.id);

  const chatTitle = activeConversation?.name || otherParticipant?.user?.username || "Discussion";

  // Gestion du statut de frappe avec debounce
  useEffect(() => {
    if (!activeConversationId) return;

    let timeout: ReturnType<typeof setTimeout>;
    if (content.trim()) {
      sendTypingStatus(activeConversationId, true);

      // Stoppe automatiquement le signal si l'utilisateur s'arrête d'écrire pendant 2 secondes
      timeout = setTimeout(() => {
        sendTypingStatus(activeConversationId, false);
      }, 2000);
    } else {
      sendTypingStatus(activeConversationId, false);
    }

    return () => clearTimeout(timeout);
  }, [content, activeConversationId, sendTypingStatus]);

  // Récupère l'état de frappe de l'autre participant
  const otherUserId = otherParticipant?.userId;
  const isOtherUserTyping = otherUserId ? typingUsers[otherUserId] : false;

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

    // Stoppe immédiatement l'indicateur de frappe à l'envoi
    if (activeConversationId) {
      sendTypingStatus(activeConversationId, false);
    }

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
        <div className="chat-header-info">
          <button className="chat-back-btn" onClick={() => useChatStore.setState({ activeConversationId: null })} title="Retour aux amis">
            <ArrowLeft size={18} />
          </button>
          <Hash size={20} className="channel-icon" />
          <h2 className="channel-title">{chatTitle}</h2>
        </div>

        {activeConversationId && <LeaveConversationButton conversationId={activeConversationId} showText={true} />}
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

      {/* Indicateur de frappe */}
      {isOtherUserTyping && (
        <div
          className="typing-indicator"
          style={{ padding: "0.25rem 1rem", fontSize: "0.85rem", color: "var(--text-secondary, #888)", fontStyle: "italic" }}
        >
          {chatTitle} est en train d'écrire...
        </div>
      )}

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

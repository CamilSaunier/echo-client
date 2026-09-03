// src/pages/DashboardPage/DashboardPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { useChatStore } from "../../stores/chat.store";
import { useAuthStore } from "../../stores/auth.stores";
import { socketService } from "../../services/socket.service";
import "./DashboardPage.css";

/**
 * Main dashboard component rendering the chat sidebar and active conversation thread.
 *
 * @returns {React.JSX.Element} The rendered dashboard view
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    error,
    fetchConversations,
    selectConversation,
    sendMessage,
    initSocketListeners,
    cleanupSocketListeners,
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialisation du cycle de vie : connexion socket, chargement et écouteurs
  useEffect(() => {
    // Connexion du WebSocket au chargement du Dashboard
    socketService.connect();

    // Chargement de la liste initiale des conversations
    fetchConversations();

    // Initialisation des écouteurs d'événements temps réel
    initSocketListeners();

    // Nettoyage à la fermeture ou au démontage du composant
    return () => {
      cleanupSocketListeners();
    };
  }, [fetchConversations, initSocketListeners, cleanupSocketListeners]);

  // Auto-scroll vers le bas à chaque nouveau message dans le fil
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handles conversation selection and socket room joining.
   *
   * @param conversationId - Target conversation identifier
   */
  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);
  };

  /**
   * Submits a new message to the active thread.
   *
   * @param e - Form submission event
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    await sendMessage(inputMessage);
    setInputMessage(""); // Réinitialisation du champ de saisie
  };

  // Récupération de la conversation active pour l'en-tête du chat
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="dashboard-container">
      {/* Sidebar : Liste des salons et conversations */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Conversations</h2>
        </div>

        {error && <div className="dashboard-error">{error}</div>}

        <div className="conversations-list">
          {isLoading && conversations.length === 0 ? (
            <p className="loading-text">Chargement des conversations...</p>
          ) : conversations.length === 0 ? (
            <p className="empty-text">Aucune conversation trouvée.</p>
          ) : (
            conversations.map((conv) => {
              // Récupération du nom d'affichage (nom du groupe ou second participant)
              const otherParticipant = conv.participants.find((p) => p.userId !== user?.id);
              const displayName = conv.name || otherParticipant?.user.username || "Discussion";
              const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;

              return (
                <div
                  key={conv.id}
                  className={`conversation-item ${activeConversationId === conv.id ? "active" : ""}`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="conversation-info">
                    <span className="conversation-name">{displayName}</span>
                    {lastMessage && (
                      <span className="conversation-preview">
                        {lastMessage.user?.username ? `${lastMessage.user.username} : ` : ""}
                        {lastMessage.content}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Zone principale : Fil de discussion et zone de saisie */}
      <main className="chat-area">
        {activeConversationId ? (
          <>
            {/* En-tête de la discussion active */}
            <header className="chat-header">
              <h3>
                {activeConversation?.name || activeConversation?.participants.find((p) => p.userId !== user?.id)?.user.username || "Discussion"}
              </h3>
            </header>

            {/* Fil des messages affichés */}
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
              {/* Ancre pour l'auto-scroll automatique */}
              <div ref={messagesEndRef} />
            </div>

            {/* Formulaire d'envoi de message */}
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input type="text" placeholder="Écrivez votre message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
              <button type="submit" disabled={!inputMessage.trim()}>
                Envoyer
              </button>
            </form>
          </>
        ) : (
          /* État vide si aucun salon n'est sélectionné */
          <div className="empty-chat-state">
            <h3>Bienvenue dans Echo</h3>
            <p>Sélectionnez une conversation dans la barre latérale pour commencer à échanger.</p>
          </div>
        )}
      </main>
    </div>
  );
};

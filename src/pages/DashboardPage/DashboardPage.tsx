import React, { useEffect } from "react";
import { useChatStore } from "../../stores/chat.store";
import { socketService } from "../../services/socket.service";
import { ChatArea } from "../../components/ChatArea/ChatArea";
import { FriendsManager } from "../../components/FriendsManager/FriendsManager";
import "./DashboardPage.css";

export const DashboardPage: React.FC = () => {
  const { activeConversationId, fetchConversations, initSocketListeners, cleanupSocketListeners } = useChatStore();

  useEffect(() => {
    socketService.connect();
    fetchConversations();
    initSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, [fetchConversations, initSocketListeners, cleanupSocketListeners]);

  return (
    <div className="chat-main-container">
      {/* Affichage conditionnel : la liste d'amis s'affiche si aucune conversation n'est sélectionnée */}
      {activeConversationId ? <ChatArea /> : <FriendsManager />}
    </div>
  );
};

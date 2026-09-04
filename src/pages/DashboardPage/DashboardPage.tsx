import React, { useEffect } from "react";
import { useChatStore } from "../../stores/chat.store";
import { socketService } from "../../services/socket.service";
import { ChatArea } from "../../components/ChatArea/ChatArea";
import "./DashboardPage.css";

export const DashboardPage: React.FC = () => {
  const { fetchConversations, initSocketListeners, cleanupSocketListeners } = useChatStore();

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
      <ChatArea />
    </div>
  );
};

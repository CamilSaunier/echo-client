// src/components/LeaveConversationButton/LeaveConversationButton.tsx
import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { useChatStore } from "../../stores/chat.store";
import "./LeaveConversationButton.css";

interface LeaveConversationButtonProps {
  conversationId: string;
  className?: string;
  showText?: boolean;
}

export const LeaveConversationButton: React.FC<LeaveConversationButtonProps> = ({ conversationId, className = "", showText = false }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const leaveConversation = useChatStore((state) => state.leaveConversation);

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    await leaveConversation(conversationId);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(false);
  };

  if (isConfirming) {
    return (
      <div className="leave-confirm-group" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="leave-btn confirm" onClick={handleLeave} title="Confirmer la sortie">
          Confirmer
        </button>
        <button type="button" className="leave-btn cancel" onClick={handleCancel} title="Annuler">
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button type="button" className={`leave-btn ${className}`} onClick={handleLeave} title="Quitter la conversation">
      <LogOut size={16} />
      {showText && <span>Quitter</span>}
    </button>
  );
};

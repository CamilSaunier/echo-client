import React, { useEffect, useState } from "react";
import { UserPlus, Check, X, UserX, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useFriendStore } from "../../stores/friend.store";
import { userService } from "../../services/user.service";
import type { User } from "../../types/user.types";
import "./FriendsManager.css";

/**
 * Main UI component for managing friend requests and friend list.
 * Composant UI principal pour la gestion des demandes et de la liste d'amis.
 */
export const FriendsManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { friends, pendingRequests, isLoading, fetchAll, sendRequest, respondToRequest, removeFriend } = useFriendStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /**
   * Triggers user search on input change with debounce.
   * Recherche dynamique des utilisateurs par pseudo.
   */
  useEffect(() => {
    const cleanQuery = searchQuery.trim();
    if (cleanQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await userService.searchUsers(cleanQuery);
        setSearchResults(results);
      } catch (err) {
        toast.error("Erreur lors de la recherche");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Handles sending a friend request to a selected user.
   * Gère l'envoi d'une demande d'ami.
   */
  const handleSendRequest = async (targetUserId: string) => {
    setSendingId(targetUserId);
    try {
      await sendRequest(targetUserId);
      toast.success("Demande d'ami envoyée avec succès");
      setSearchResults((prev) => prev.filter((u) => u.id !== targetUserId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi de la demande");
    } finally {
      setSendingId(null);
    }
  };

  /**
   * Handles accepting or rejecting a pending request.
   */
  const handleRespond = async (friendshipId: string, accept: boolean) => {
    try {
      await respondToRequest(friendshipId, accept);
      toast.success(accept ? "Demande d'ami acceptée" : "Demande d'ami refusée");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors du traitement de la demande");
    }
  };

  /**
   * Handles removing a friend.
   */
  const handleRemove = async (friendId: string) => {
    try {
      await removeFriend(friendId);
      toast.success("Ami retiré de la liste");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="friends-manager__loader">
        <Loader2 className="animate-spin" size={20} />
        <span>Chargement du réseau d'amis…</span>
      </div>
    );
  }

  return (
    <div className="friends-manager">
      {/* Recherche et ajout d'ami */}
      <section className="friends-manager__section">
        <h2 className="friends-manager__title">Ajouter un ami</h2>
        <div className="friends-manager__search-box">
          <div className="friends-manager__input-wrapper">
            <Search size={16} className="friends-manager__search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par pseudo…"
              className="friends-manager__input"
            />
            {isSearching && <Loader2 className="animate-spin" size={16} />}
          </div>

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <ul className="friends-manager__results">
              {searchResults.map((user) => (
                <li key={user.id} className="friends-manager__item">
                  <div className="friends-manager__user-info">
                    <div className="friends-manager__avatar">{(user.username?.[0] || "U").toUpperCase()}</div>
                    <span className="friends-manager__username">{user.username}</span>
                  </div>
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    disabled={sendingId === user.id}
                    className="friends-manager__btn friends-manager__btn--primary"
                  >
                    {sendingId === user.id ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                    <span>Ajouter</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Demandes en attente */}
      {pendingRequests.length > 0 && (
        <section className="friends-manager__section">
          <h2 className="friends-manager__title">Demandes en attente ({pendingRequests.length})</h2>
          <ul className="friends-manager__list">
            {pendingRequests.map((req) => (
              <li key={req.id} className="friends-manager__item">
                <span className="friends-manager__username">{req.friend?.username || req.user?.username || req.userId}</span>
                <div className="friends-manager__actions">
                  <button onClick={() => handleRespond(req.id, true)} className="friends-manager__btn friends-manager__btn--success" title="Accepter">
                    <Check size={16} />
                  </button>
                  <button onClick={() => handleRespond(req.id, false)} className="friends-manager__btn friends-manager__btn--danger" title="Refuser">
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Liste effective des amis */}
      <section className="friends-manager__section">
        <h2 className="friends-manager__title">Mes amis ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="friends-manager__empty">Aucun ami pour le moment.</p>
        ) : (
          <ul className="friends-manager__list">
            {friends.map((item) => {
              const displayUser = item.friend || item.user;
              const displayId = item.friendId;

              return (
                <li key={item.id} className="friends-manager__item">
                  <div className="friends-manager__user-info">
                    <div className="friends-manager__avatar">{(displayUser?.username?.[0] || "U").toUpperCase()}</div>
                    <span className="friends-manager__username">{displayUser?.username || displayId}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(displayId)}
                    className="friends-manager__btn friends-manager__btn--ghost"
                    title="Supprimer l'ami"
                  >
                    <UserX size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

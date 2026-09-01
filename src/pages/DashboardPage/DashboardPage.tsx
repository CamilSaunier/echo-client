import { useAuthStore } from "../../stores/auth.stores"; // Ajuste selon le chemin réel de ton store
import "./DashboardPage.css";

export function DashboardPage() {
  // Récupération de la déconnexion ou d'infos du store si dispo
  // const { logout, user } = useAuthStore();

  const handleLogout = () => {
    // TODO: Appel de la fonction de logout du store
    console.log("Déconnexion");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Tableau de bord (Provisoire)</h1>
        <p>🎉 Félicitations, tu es connecté et le guard a autorisé l'accès !</p>

        <button onClick={handleLogout} className="btn-logout">
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;

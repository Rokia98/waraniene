"use client";
import { useState } from "react";
import KkiapayButton from "@/components/KkiapayButton";
import { useSession } from "@supabase/auth-helpers-react";

export default function PaiementPage() {
  // Exemple de récupération d'utilisateur connecté (optionnel)
  const session = useSession();
  const [status, setStatus] = useState<string | null>(null);

  // À adapter selon votre logique métier
  const montant = 4000;
  const email = session?.user?.email || "test@waraniene.com";
  const phone = "0700000000";
  const apiKey = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY || "";
  const sandbox = process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === "true";

  function handleSuccess(response: any) {
    setStatus("Paiement réussi !");
    // TODO: Appeler l'API callback pour valider côté serveur
    // fetch('/api/paiement/callback', { method: 'POST', body: JSON.stringify({ ... }) })
  }

  function handleFailure(error: any) {
    setStatus("Paiement échoué ou annulé.");
  }

  return (
    <div className="max-w-lg mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Paiement sécurisé Kkiapay</h1>
      <KkiapayButton
        amount={montant}
        email={email}
        phone={phone}
        apiKey={apiKey}
        sandbox={sandbox}
        onSuccess={handleSuccess}
        onFailure={handleFailure}
      >
        Payer {montant} FCFA
      </KkiapayButton>
      {status && <div className="mt-4 text-center text-green-700">{status}</div>}
    </div>
  );
}

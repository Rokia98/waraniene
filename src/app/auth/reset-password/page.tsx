"use client";
import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!token) {
      setMessage("Lien invalide ou expiré.");
      return;
    }
    if (password.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.");
      } else {
        setMessage(data.error || "Erreur lors de la réinitialisation.");
      }
    } catch (err) {
      setMessage("Erreur réseau ou serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Nouveau mot de passe</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          required
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Envoi..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
      {message && <div className="mt-4 text-center text-sm text-gray-700">{message}</div>}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto mt-16 p-6 text-center">Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

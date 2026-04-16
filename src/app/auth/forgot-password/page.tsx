"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Un email de réinitialisation a été envoyé si l'adresse existe.");
      } else {
        setMessage(data.error || "Erreur lors de la demande.");
      }
    } catch (err) {
      setMessage("Erreur réseau ou serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Mot de passe oublié</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Votre email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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

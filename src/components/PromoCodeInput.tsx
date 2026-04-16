'use client';
import { useState } from 'react';
import { Gift, Check, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface PromoCodeInputProps {
  montantTotal: number;
  onPromoApplied: (reduction: number, code: string) => void;
}

export default function PromoCodeInput({ montantTotal, onPromoApplied }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [reduction, setReduction] = useState(0);
  const [error, setError] = useState('');

  const handleApplyCode = async () => {
    if (!code.trim()) {
      setError('Entrez un code promo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/codes-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          montant: montantTotal
        })
      });

      const data = await res.json();

      if (res.ok) {
        const reductionAmount = data.type_reduction === 'pourcentage'
          ? (montantTotal * data.valeur_reduction) / 100
          : data.valeur_reduction;

        setReduction(reductionAmount);
        setApplied(true);
        onPromoApplied(reductionAmount, code.toUpperCase());
        toast.success(`✓ Promo appliquée! Réduction: ${reductionAmount.toFixed(0)} FCFA`);
      } else {
        setError(data.error || 'Code invalide');
        toast.error(data.error || 'Ce code n\'est pas valide');
      }
    } catch (error) {
      setError('Erreur serveur');
      toast.error('Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCode = () => {
    setApplied(false);
    setCode('');
    setReduction(0);
    setError('');
    onPromoApplied(0, '');
  };

  if (applied) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">{code}</p>
            <p className="text-sm text-green-700">-{reduction.toFixed(0)} FCFA</p>
          </div>
        </div>
        <button
          onClick={handleRemoveCode}
          className="text-green-600 hover:text-green-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold">
        <Gift className="w-4 h-4" />
        Code promo
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Entrez votre code..."
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          disabled={loading}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase disabled:bg-gray-100"
        />
        <button
          onClick={handleApplyCode}
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            'Appliquer'
          )}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

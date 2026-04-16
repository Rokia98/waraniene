"use client";
import { useKKiaPay } from "kkiapay-react";
import { useEffect } from "react";

export interface KkiapayButtonProps {
  amount: number;
  email: string;
  phone: string;
  apiKey: string;
  sandbox?: boolean;
  onSuccess?: (response: any) => void;
  onFailure?: (error: any) => void;
  reason?: string;
  children?: React.ReactNode;
}

export default function KkiapayButton({
  amount,
  email,
  phone,
  apiKey,
  sandbox = true,
  onSuccess,
  onFailure,
  reason = "Paiement Tissés de Waraniéné",
  children,
}: KkiapayButtonProps) {
  const {
    openKkiapayWidget,
    addKkiapayListener,
    removeKkiapayListener,
  } = useKKiaPay();

  function open() {
    openKkiapayWidget({
      amount,
      api_key: apiKey,
      sandbox,
      email,
      phone,
      reason,
    });
  }

  useEffect(() => {
    if (onSuccess) addKkiapayListener("success", onSuccess);
    if (onFailure) addKkiapayListener("failed", onFailure);
    return () => {
      if (onSuccess) removeKkiapayListener("success");
      if (onFailure) removeKkiapayListener("failed");
    };
  }, [addKkiapayListener, removeKkiapayListener, onSuccess, onFailure]);

  return (
    <button type="button" onClick={open} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
      {children || "Payer avec Kkiapay"}
    </button>
  );
}

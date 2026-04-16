// src/lib/kkiapay.ts
// Service utilitaire pour intégrer Kkiapay dans l'app Next.js

export interface KkiapayPaymentInit {
  amount: number;
  name: string;
  email: string;
  phone: string;
  reason?: string;
  sandbox?: boolean;
  callback?: (response: any) => void;
}

export const getKkiapayPublicKey = () => {
  return process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY || '';
};

export const isKkiapaySandbox = () => {
  return process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === 'true';
};

// Utilitaire pour préparer les props du widget Kkiapay
export function getKkiapayWidgetProps({ amount, name, email, phone, reason, callback }: KkiapayPaymentInit) {
  return {
    amount,
    key: getKkiapayPublicKey(),
    sandbox: isKkiapaySandbox(),
    name,
    email,
    phone,
    reason: reason || 'Paiement Tissés de Waraniéné',
    callback,
  };
}

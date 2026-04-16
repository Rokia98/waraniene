/**
 * Service CinetPay pour gérer les paiements
 * Supporte: Orange Money, MTN Money, Moov Money, Wave, Cartes Bancaires
 * Documentation: https://docs.cinetpay.com
 */

interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  secretKey: string;
  baseUrl: string;
  mode: 'test' | 'live';
}

interface InitiatePaymentParams {
  amount: number;
  currency: string;
  transaction_id: string;
  description: string;
  customer_name: string;
  customer_surname: string;
  customer_email: string;
  customer_phone_number: string;
  notify_url: string;
  return_url: string;
  channels?: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  code: string;
  message: string;
  data?: {
    payment_token: string;
    payment_url: string;
  };
  description?: string;
}

interface PaymentStatusResponse {
  code: string;
  message: string;
  data?: {
    cpm_trans_id: string;
    cpm_site_id: string;
    cpm_amount: number;
    cpm_currency: string;
    cpm_trans_status: string;
    cpm_payment_config: string;
    cpm_payment_date: string;
    cpm_custom: string;
    signature: string;
    payment_method: string;
    cel_phone_num: string;
    cpm_phone_prefixe: string;
    cpm_language: string;
    cpm_version: string;
    cpm_payment_time: string;
    cpm_trans_date: string;
  };
}

class CinetPayService {
  private config: CinetPayConfig;

  constructor() {
    this.config = {
      apiKey: process.env.CINETPAY_API_KEY || '',
      siteId: process.env.CINETPAY_SITE_ID || '',
      secretKey: process.env.CINETPAY_SECRET_KEY || '',
      baseUrl: process.env.CINETPAY_BASE_URL || 'https://api-checkout.cinetpay.com/v2',
      mode: (process.env.NEXT_PUBLIC_CINETPAY_MODE as 'test' | 'live') || 'test',
    };

    if (!this.config.apiKey || !this.config.siteId) {
      console.warn('⚠️ CinetPay: Clés API non configurées');
    }
  }

  /**
   * Initier un paiement avec CinetPay
   */
  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResponse> {
    try {
      console.log('💳 Initiation paiement CinetPay:', {
        amount: params.amount,
        customer: params.customer_name,
        transaction_id: params.transaction_id,
      });

      const payload = {
        apikey: this.config.apiKey,
        site_id: this.config.siteId,
        transaction_id: params.transaction_id,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        customer_name: params.customer_name,
        customer_surname: params.customer_surname,
        customer_email: params.customer_email,
        customer_phone_number: params.customer_phone_number,
        notify_url: params.notify_url,
        return_url: params.return_url,
        channels: params.channels || 'ALL',
        metadata: JSON.stringify(params.metadata || {}),
        lang: 'FR',
      };

      const response = await fetch(`${this.config.baseUrl}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: PaymentResponse = await response.json();

      if (result.code === '201' && result.data) {
        console.log('✅ Paiement CinetPay initié:', result.data.payment_token);
        return result;
      } else {
        console.error('❌ Erreur CinetPay:', result.message);
        return {
          code: result.code,
          message: result.message || 'Erreur lors de l\'initiation du paiement',
          description: result.description,
        };
      }
    } catch (error: any) {
      console.error('❌ Erreur initiation paiement CinetPay:', error);
      return {
        code: '500',
        message: error.message || 'Erreur lors de l\'initiation du paiement',
      };
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(transaction_id: string): Promise<PaymentStatusResponse | null> {
    try {
      console.log('🔍 Vérification statut paiement CinetPay:', transaction_id);

      const payload = {
        apikey: this.config.apiKey,
        site_id: this.config.siteId,
        transaction_id: transaction_id,
      };

      const response = await fetch(`${this.config.baseUrl}/payment/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: PaymentStatusResponse = await response.json();

      if (result.code === '00') {
        console.log('✅ Statut récupéré:', result.data?.cpm_trans_status);
        return result;
      } else {
        console.error('❌ Erreur vérification:', result.message);
        return null;
      }
    } catch (error: any) {
      console.error('❌ Erreur vérification statut:', error);
      return null;
    }
  }

  /**
   * Mapper le statut CinetPay vers notre format
   */
  mapStatus(status: string): 'en_attente' | 'paye' | 'echec' | 'annule' {
    const statusMap: Record<string, 'en_attente' | 'paye' | 'echec' | 'annule'> = {
      'ACCEPTED': 'paye',
      'REFUSED': 'echec',
      'PENDING': 'en_attente',
      'CANCELLED': 'annule',
    };

    return statusMap[status] || 'en_attente';
  }
}

// Instance unique
export const cinetPayService = new CinetPayService();

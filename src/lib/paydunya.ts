/**
 * Service PayDunya pour gérer les paiements
 * Supporte: Orange Money, MTN Money, Moov Money, Airtel Money, Cartes Bancaires
 * Documentation: https://paydunya.com/developers
 */

console.log('Chargement du module PayDunya...');
import * as PayDunya from 'paydunya';

interface PayDunyaConfig {
  masterKey: string;
  privateKey: string;
  token: string;
  mode: 'test' | 'live';
}

interface InitiatePaymentParams {
  amount: number;
  description: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  metadata?: Record<string, any>;
  return_url: string;
  cancel_url: string;
}

interface PaymentResponse {
  success: boolean;
  token?: string;
  response_code?: string;
  response_text?: string;
  invoice_url?: string;
  error?: string;
}

interface PaymentStatus {
  success: boolean;
  status?: 'pending' | 'completed' | 'cancelled';
  transaction_id?: string;
  amount?: number;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  created_at?: string;
}

class PayDunyaService {
  private config: PayDunyaConfig;
  private setup: any;
  private store: any;
  private invoice: any;

  constructor() {
    this.config = {
      masterKey: process.env.PAYDUNYA_MASTER_KEY || '',
      privateKey: process.env.PAYDUNYA_PRIVATE_KEY || '',
      token: process.env.PAYDUNYA_TOKEN || '',
      mode: (process.env.PAYDUNYA_MODE as 'test' | 'live') || 'test',
    };

    console.log('PayDunya config:', this.config);

    if (!this.config.masterKey || !this.config.privateKey || !this.config.token) {
      console.error('❌ PayDunya: Clés API non configurées - les paiements ne fonctionneront pas');
      // On ne fait pas de return ni de throw ici, juste un log
    }

    // Configuration PayDunya
    this.setup = new PayDunya.Setup({
      masterKey: this.config.masterKey,
      privateKey: this.config.privateKey,
      token: this.config.token,
      mode: this.config.mode,
    });

    // Configuration du magasin
    this.store = new PayDunya.Store({
      name: 'Tissés de Waraniéné',
      tagline: 'Textiles traditionnels Senoufo',
      phoneNumber: '+225 0100533949',
      postalAddress: 'Waraniéné, Côte d\'Ivoire',
      websiteURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      logoURL: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
    });

    // Initialiser l'invoice
    this.invoice = new PayDunya.CheckoutInvoice(this.setup, this.store);
  }

  /**
   * Initier un paiement avec PayDunya
   */
  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResponse> {
    try {
      console.log('💳 Initiation paiement PayDunya:', {
        amount: params.amount,
        customer: params.customer.name,
      });

      // Vérifier que PayDunya est configuré
      if (!this.setup || !this.store) {
        console.error('❌ PayDunya non configuré - vérifiez les variables d\'environnement');
        return {
          success: false,
          error: 'PayDunya non configuré. Vérifiez PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY et PAYDUNYA_TOKEN',
        };
      }

      // Créer une nouvelle invoice
      this.invoice = new PayDunya.CheckoutInvoice(this.setup, this.store);

      // Ajouter l'article
      this.invoice.addItem(
        params.description,
        1,
        params.amount,
        params.amount
      );

      // Définir le montant total
      this.invoice.totalAmount = params.amount;

      // Ajouter les informations client comme custom data
      this.invoice.addCustomData('customer_name', params.customer.name);
      this.invoice.addCustomData('customer_email', params.customer.email);
      this.invoice.addCustomData('customer_phone', params.customer.phone);

      // Ajouter les métadonnées supplémentaires
      if (params.metadata) {
        for (const [key, value] of Object.entries(params.metadata)) {
          this.invoice.addCustomData(key, value);
        }
      }

      // URLs de retour
      this.invoice.returnURL = params.return_url;
      this.invoice.cancelURL = params.cancel_url;

      // Créer l'invoice
      const result = await new Promise<PaymentResponse>((resolve) => {
        this.invoice.create()
          .then(() => {
            // Après create(), les données sont dans this.invoice
            console.log('✅ PayDunya invoice créée:', this.invoice.token);
            resolve({
              success: true,
              token: this.invoice.token,
              response_code: '00',
              response_text: this.invoice.url,
              invoice_url: this.invoice.url, // URL de paiement
            });
          })
          .catch((error: any) => {
            console.error('❌ Erreur PayDunya:', error);
            resolve({
              success: false,
              error: error.data?.response_text || error.message || 'Erreur lors de l\'initiation du paiement',
            });
          });
      });

      return result;
    } catch (error: any) {
      console.error('❌ Erreur initiation paiement PayDunya:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'initiation du paiement',
      };
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(token: string): Promise<PaymentStatus | null> {
    try {
      console.log('🔍 Vérification statut paiement PayDunya:', token);

      if (!this.invoice) {
        throw new Error('PayDunya non configuré');
      }

      const result = await new Promise<PaymentStatus | null>((resolve) => {
        this.invoice.confirm(token)
          .then(() => {
            // Après confirm(), les données sont dans this.invoice
            console.log('✅ Statut PayDunya:', this.invoice.status);
            
            const status = this.invoice.status === 'completed' ? 'completed' :
                          this.invoice.status === 'cancelled' ? 'cancelled' :
                          'pending';

            resolve({
              success: true,
              status,
              transaction_id: token,
              amount: this.invoice.totalAmount,
              customer: this.invoice.customer,
              created_at: new Date().toISOString(),
            });
          })
          .catch((error: any) => {
            console.error('❌ Erreur vérification PayDunya:', error);
            resolve(null);
          });
      });

      return result;
    } catch (error: any) {
      console.error('❌ Erreur vérification statut:', error);
      return null;
    }
  }

  /**
   * Mapper le statut PayDunya vers notre format
   */
  mapStatus(status: string): 'en_attente' | 'paye' | 'echec' | 'annule' {
    const statusMap: Record<string, 'en_attente' | 'paye' | 'echec' | 'annule'> = {
      'completed': 'paye',
      'cancelled': 'annule',
      'pending': 'en_attente',
      'failed': 'echec',
    };

    return statusMap[status] || 'en_attente';
  }
}

// Instance unique
export const payDunyaService = new PayDunyaService();

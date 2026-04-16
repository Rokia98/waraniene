/**
 * Déclarations TypeScript pour le module PayDunya
 */

declare module 'paydunya' {
  export class Setup {
    constructor(data: {
      masterKey?: string;
      privateKey?: string;
      token?: string;
      mode?: 'test' | 'live';
    });
    config: Record<string, string>;
    baseURL: string;
  }

  export class Store {
    constructor(data: {
      name: string;
      tagline?: string;
      phoneNumber?: string;
      postalAddress?: string;
      logoURL?: string;
      websiteURL?: string;
      cancelURL?: string;
      returnURL?: string;
      callbackURL?: string;
    });
    name: string;
    tagline?: string;
    phone_number?: string;
    postal_address?: string;
    logo_url?: string;
    website_url?: string;
    cancel_url?: string;
    return_url?: string;
    callback_url?: string;
  }

  export class CheckoutInvoice {
    constructor(setup: Setup, store: Store);
    addItem(name: string, quantity: number, unitPrice: number, totalPrice: number, description?: string): void;
    setTotalAmount(amount: number): void;
    setCustomerInfo(info: { name: string; phone: string; email?: string }): void;
    setCustomData(key: string, value: any): void;
    create(): Promise<any>;
    confirm(token: string): Promise<any>;
  }
}

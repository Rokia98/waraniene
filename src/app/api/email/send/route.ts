import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configuration Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.MAILTRAP_PORT || '2525'),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

interface EmailData {
  to: string;
  type: 'commande_confirmee' | 'commande_expediem' | 'commande_livree' | 'artisan_bienvenue';
  data: any;
}

const emailTemplates: Record<string, (data: any) => { subject: string; html: string }> = {
  commande_confirmee: (data) => ({
    subject: `✅ Votre commande #${data.commande_id.slice(0, 8)} est confirmée`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #333;">Merci pour votre commande! 🎉</h2>
          
          <p>Bonjour <strong>${data.nom_acheteur}</strong>,</p>
          
          <p>Votre commande a bien été reçue et confirmée.</p>
          
          <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Détails de la commande</h3>
            <p><strong>Numéro:</strong> ${data.commande_id.slice(0, 8)}</p>
            <p><strong>Montant total:</strong> ${data.montant_total.toLocaleString('fr-CI')} CFA</p>
            <p><strong>Date:</strong> ${new Date(data.date_commande).toLocaleDateString('fr-FR')}</p>
            <p><strong>Adresse de livraison:</strong> ${data.adresse_livraison}</p>
          </div>
          
          <div style="background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Articles commandés</h3>
            ${data.articles.map((a: any) => `
              <p>• <strong>${a.nom_produit}</strong> x${a.quantite} = ${(a.prix_unitaire * a.quantite).toLocaleString('fr-CI')} CFA</p>
            `).join('')}
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Vous recevrez un email de confirmation de paiement dès que votre transaction sera traitée.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Tissés de Waraniéné - Tous droits réservés
          </p>
        </div>
      </div>
    `
  }),

  commande_expediem: (data) => ({
    subject: `📦 Votre commande est en route!`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #333;">Votre commande est expédiée! 📦</h2>
          
          <p>Bonjour <strong>${data.nom_acheteur}</strong>,</p>
          
          <p>Excellente nouvelle! Votre commande a été expédiée et est en route vers vous.</p>
          
          <div style="background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Informations de suivi</h3>
            <p><strong>Numéro de commande:</strong> ${data.commande_id.slice(0, 8)}</p>
            <p><strong>Adresse de livraison:</strong> ${data.adresse_livraison}</p>
            <p><strong>Statut:</strong> En cours de livraison</p>
          </div>
          
          <p style="color: #666;">Vous recevrez un dernier email lorsque votre commande sera livrée.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Tissés de Waraniéné
          </p>
        </div>
      </div>
    `
  }),

  commande_livree: (data) => ({
    subject: `🎉 Votre commande a été livrée!`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #27ae60;">Votre commande a été livrée! 🎉</h2>
          
          <p>Bonjour <strong>${data.nom_acheteur}</strong>,</p>
          
          <p>Votre commande vous a été livrée avec succès!</p>
          
          <div style="background: #d5f4e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Numéro de commande:</strong> ${data.commande_id.slice(0, 8)}</p>
            <p><strong>Montant:</strong> ${data.montant_total.toLocaleString('fr-CI')} CFA</p>
          </div>
          
          <p style="color: #666;">Merci de votre achat! Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Tissés de Waraniéné
          </p>
        </div>
      </div>
    `
  }),

  artisan_bienvenue: (data) => ({
    subject: `🎨 Bienvenue sur Tissés de Waraniéné!`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #333;">Bienvenue, ${data.nom}! 🎨</h2>
          
          <p>Votre profil artisan a été créé avec succès sur Tissés de Waraniéné.</p>
          
          <div style="background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Prochaines étapes:</h3>
            <ol>
              <li>Complétez votre profil avec une photo</li>
              <li>Ajoutez vos produits à la boutique</li>
              <li>Configurez vos paramètres de paiement</li>
              <li>Commencez à vendre!</li>
            </ol>
          </div>
          
          <p>Vous pouvez accéder à votre dashboard ici:</p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/artisan/dashboard" 
               style="background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">
              Accéder au Dashboard
            </a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Tissés de Waraniéné
          </p>
        </div>
      </div>
    `
  })
};

export async function POST(request: NextRequest) {
  try {
    const body: EmailData = await request.json();
    const { to, type, data } = body;

    if (!to || !type || !data) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const template = emailTemplates[type];
    if (!template) {
      return NextResponse.json(
        { error: 'Type d\'email invalide' },
        { status: 400 }
      );
    }

    const { subject, html } = template(data);

    const info = await transporter.sendMail({
      from: 'noreply@waraniene.com',
      to,
      subject,
      html
    });

    console.log('✅ Email envoyé:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
      messageId: info.messageId
    });

  } catch (error: any) {
    console.error('Erreur envoi email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email: ' + error.message },
      { status: 500 }
    );
  }
}

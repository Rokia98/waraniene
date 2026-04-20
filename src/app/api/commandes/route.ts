import { NextRequest, NextResponse } from 'next/server';
import { db, DB_TYPE, generateUUID } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const acheteur_id = searchParams.get('acheteur_id');
    const statut = searchParams.get('statut');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construire les conditions de filtrage
    const where: any = {};
    if (acheteur_id) where.acheteur_id = acheteur_id;
    if (statut) where.statut = statut;

    // Récupérer les commandes
    const commandes = await db.select('commandes', {
      where,
      orderBy: sortBy,
      orderDirection: sortOrder as 'asc' | 'desc',
      limit,
      offset
    });

    // Enrichir avec acheteur et détails
    const commandesEnrichies = await Promise.all(
      (commandes || []).map(async (commande: any) => {
        // Récupérer l'acheteur si acheteur_id existe
        let acheteurData = null;
        if (commande.acheteur_id) {
          const acheteurs = await db.select('acheteurs', {
            where: { id: commande.acheteur_id },
            limit: 1
          });
          const acheteur = acheteurs && acheteurs.length > 0 ? acheteurs[0] : null;
          if (acheteur) {
            acheteurData = {
              id: acheteur.id,
              nom: acheteur.nom,
              email: acheteur.email,
              telephone: acheteur.telephone
            };
          }
        }

        // Récupérer les détails de commande
        const details = await db.select('detail_commandes', {
          where: { commande_id: commande.id }
        });

        // Enrichir chaque détail avec le produit et l'artisan
        const detailsEnrichis = await Promise.all(
          (details || []).map(async (detail: any) => {
            const produits = await db.select('produits', {
              where: { id: detail.produit_id },
              limit: 1
            });
            const produit = produits && produits.length > 0 ? produits[0] : null;

            if (produit) {
              const artisans = await db.select('artisans', {
                where: { id: produit.artisan_id },
                limit: 1
              });
              const artisan = artisans && artisans.length > 0 ? artisans[0] : null;

              return {
                id: detail.id,
                quantite: detail.quantite,
                prix_unitaire: detail.prix_unitaire,
                produit: {
                  id: produit.id,
                  nom_produit: produit.nom_produit,
                  photos: typeof produit.photos === 'string' ? JSON.parse(produit.photos) : (produit.photos || []),
                  artisan: artisan ? { nom: artisan.nom } : null
                }
              };
            }
            return null;
          })
        );

        return {
          ...commande,
          acheteur: acheteurData,
          detail_commandes: detailsEnrichis.filter(d => d !== null)
        };
      })
    );

    // Compter le total
    const allCommandes = await db.select('commandes', { where });
    const total = allCommandes?.length || 0;

    return NextResponse.json({
      commandes: commandesEnrichies,
      total,
      hasMore: offset + limit < total
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      // Checkout anonyme (nouveau système)
      nom_acheteur,
      email_acheteur,
      telephone_acheteur,
      
      // Ancien système (optionnel, pour compatibilité)
      acheteur_id,
      
      // Communs
      items, 
      mode_paiement,
      methode_paiement,
      adresse_livraison,
      montant_total
    } = body;

    console.log('📦 Création commande:', {
      anonyme: !!nom_acheteur,
      avec_compte: !!acheteur_id,
      items_count: items?.length
    });

    // Validation des données
    if (!items || !Array.isArray(items) || items.length === 0 || !mode_paiement) {
      return NextResponse.json(
        { error: 'Données de commande invalides - items et mode_paiement requis' },
        { status: 400 }
      );
    }

    // Pour checkout anonyme, vérifier les infos acheteur
    if (!acheteur_id && (!nom_acheteur || !email_acheteur || !telephone_acheteur)) {
      return NextResponse.json(
        { error: 'Informations acheteur requises (nom, email, téléphone)' },
        { status: 400 }
      );
    }

    // Si acheteur_id fourni, vérifier qu'il existe (ancien système)
    if (acheteur_id) {
      const acheteurs = await db.select('acheteurs', {
        where: { id: acheteur_id },
        limit: 1
      });

      if (!acheteurs || acheteurs.length === 0) {
        return NextResponse.json(
          { error: 'Acheteur introuvable' },
          { status: 404 }
        );
      }
    }

    // Création automatique de compte pour le checkout anonyme
    let autoCreatedAccount = false;
    let autoToken: string | null = null;
    let autoAcheteur: any = null;
    let resolvedAcheteurId = acheteur_id;

    if (!acheteur_id && nom_acheteur && email_acheteur && telephone_acheteur) {
      // Chercher si un compte existe déjà avec cet email
      const existingByEmail = await db.select('acheteurs', {
        where: { email: email_acheteur },
        limit: 1
      });

      // Ou avec ce téléphone
      const existingByPhone = await db.select('acheteurs', {
        where: { telephone: telephone_acheteur },
        limit: 1
      });

      if (existingByEmail.length > 0) {
        // Compte existant trouvé par email - lier la commande
        resolvedAcheteurId = existingByEmail[0].id;
        autoAcheteur = existingByEmail[0];
        console.log('👤 Compte existant trouvé par email:', email_acheteur);
      } else if (existingByPhone.length > 0) {
        // Compte existant trouvé par téléphone - lier la commande
        resolvedAcheteurId = existingByPhone[0].id;
        autoAcheteur = existingByPhone[0];
        console.log('👤 Compte existant trouvé par téléphone:', telephone_acheteur);
      } else {
        // Aucun compte trouvé - créer automatiquement
        const tempPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        const userId = generateUUID();

        // Extraire prénom et nom depuis nom_acheteur
        const nameParts = nom_acheteur.trim().split(' ');
        const prenom = nameParts[0] || '';
        const nom = nameParts.slice(1).join(' ') || nameParts[0] || '';

        const acheteurData = {
          id: userId,
          nom: nom,
          prenom: prenom,
          email: email_acheteur,
          mot_de_passe: hashedPassword,
          telephone: telephone_acheteur,
          adresse: adresse_livraison || ''
        };

        try {
          autoAcheteur = await db.insert('acheteurs', acheteurData);
          resolvedAcheteurId = userId;
          autoCreatedAccount = true;

          // Générer un token JWT pour auto-login
          autoToken = jwt.sign(
            {
              userId: userId,
              email: email_acheteur,
              nom: nom,
              prenom: prenom,
              telephone: telephone_acheteur,
              type_utilisateur: 'acheteur'
            },
            JWT_SECRET,
            { expiresIn: '30d' }
          );

          console.log('✅ Compte acheteur créé automatiquement:', email_acheteur);
        } catch (error: any) {
          console.error('⚠️ Erreur création compte auto (commande continue):', error);
          // On continue sans créer le compte - la commande reste anonyme
        }
      }
    }

    // Vérifier les produits et calculer le total
    let montantCalcule = 0;
    const produitDetails: Array<{
      id: string;
      nom_produit: string;
      prix: number;
      stock: number;
      quantite: number;
    }> = [];

    for (const item of items) {
      const produits = await db.select('produits', {
        where: { id: item.produit_id },
        limit: 1
      });
      const produit = produits && produits.length > 0 ? produits[0] : null;

      if (!produit) {
        return NextResponse.json(
          { error: `Produit ${item.produit_id} introuvable` },
          { status: 404 }
        );
      }

      if (produit.stock < item.quantite) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${produit.nom_produit}` },
          { status: 409 }
        );
      }

      // Utiliser le prix de l'item ou du produit
      const prixUnitaire = item.prix_unitaire || produit.prix;
      montantCalcule += prixUnitaire * item.quantite;
      
      produitDetails.push({
        ...produit,
        quantite: item.quantite
      });
    }

    // Utiliser le montant fourni ou le montant calculé
    const montantFinal = montant_total || montantCalcule;

    console.log('💰 Montant commande:', {
      fourni: montant_total,
      calculé: montantCalcule,
      final: montantFinal
    });

    // Créer la commande (avec ou sans acheteur_id)
    const commandeData: any = {
      montant_total: montantFinal,
      mode_paiement,
      adresse_livraison,
      statut: mode_paiement === 'paiement_livraison' ? 'confirmee' : 'en_attente',
      date_commande: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    // Ajouter la méthode de paiement spécifique (pour paiement immédiat)
    if (methode_paiement) {
      commandeData.methode_paiement = methode_paiement;
    }

    // Ajouter acheteur_id (résolu automatiquement ou fourni)
    if (resolvedAcheteurId) {
      commandeData.acheteur_id = resolvedAcheteurId;
    }

    // Ajouter infos acheteur pour référence (nouveau système)
    if (nom_acheteur) {
      commandeData.nom_acheteur = nom_acheteur;
      commandeData.email_acheteur = email_acheteur;
      commandeData.telephone_acheteur = telephone_acheteur;
    }

    const commande = await db.insert('commandes', commandeData);

    if (!commande) {
      console.error('❌ Erreur création commande');
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      );
    }

    console.log('✅ Commande créée:', commande.id);

    // Créer les détails de commande
    const detailsCommande = items.map((item: any) => ({
      commande_id: commande.id,
      produit_id: item.produit_id,
      quantite: item.quantite,
      prix_unitaire: produitDetails.find(p => p.id === item.produit_id)?.prix || 0
    }));

    // Insérer les détails de commande
    let detailsInsertSuccess = true;
    for (const detail of detailsCommande) {
      const inserted = await db.insert('detail_commandes', detail);
      if (!inserted) {
        detailsInsertSuccess = false;
        break;
      }
    }

    if (!detailsInsertSuccess) {
      console.error('Erreur détails commande');
      // Supprimer la commande créée en cas d'erreur
      await db.delete('commandes', commande.id);
      
      return NextResponse.json(
        { error: 'Erreur lors de la création des détails de commande' },
        { status: 500 }
      );
    }

    // Mettre à jour les stocks
    for (const item of items) {
      const produit = produitDetails.find(p => p.id === item.produit_id);
      if (produit) {
        await db.update('produits', item.produit_id, {
          stock: produit.stock - item.quantite,
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
      }
    }

    // Récupérer les détails de commande enrichis
    const detailsCommandes = await db.select('detail_commandes', {
      where: { commande_id: commande.id }
    });

    const detailsEnrichis = await Promise.all(
      (detailsCommandes || []).map(async (detail: any) => {
        const produits = await db.select('produits', {
          where: { id: detail.produit_id },
          limit: 1
        });
        const produit = produits && produits.length > 0 ? produits[0] : null;

        return {
          id: detail.id,
          quantite: detail.quantite,
          prix_unitaire: detail.prix_unitaire,
          produit: produit ? {
            id: produit.id,
            nom_produit: produit.nom_produit,
            photos: produit.photos
          } : null
        };
      })
    );

    const commandeComplete = {
      ...commande,
      detail_commandes: detailsEnrichis
    };

    // Construire la réponse avec les infos de compte si créé
    const responseData: any = { 
      commande: commandeComplete 
    };

    if (autoCreatedAccount && autoToken && autoAcheteur) {
      responseData.account_created = true;
      responseData.token = autoToken;
      responseData.acheteur = {
        id: autoAcheteur.id,
        nom: autoAcheteur.nom,
        prenom: autoAcheteur.prenom,
        email: autoAcheteur.email,
        telephone: autoAcheteur.telephone
      };
    }

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
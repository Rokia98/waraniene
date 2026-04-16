-- Migration pour la table articles de blog

CREATE TABLE IF NOT EXISTS articles_blog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  extrait TEXT NOT NULL,
  contenu TEXT NOT NULL,
  image VARCHAR(500),
  auteur VARCHAR(100) NOT NULL,
  date_publication DATE NOT NULL,
  temps_lecture INT DEFAULT 5,
  categorie VARCHAR(50) NOT NULL,
  tags JSON,
  statut ENUM('brouillon', 'publie', 'archive') DEFAULT 'publie',
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour améliorer les performances
CREATE INDEX idx_blog_categorie ON articles_blog(categorie);
CREATE INDEX idx_blog_statut ON articles_blog(statut);
CREATE INDEX idx_blog_date_publication ON articles_blog(date_publication);

-- Insertion d'articles de démonstration
INSERT INTO articles_blog (titre, extrait, contenu, auteur, date_publication, temps_lecture, categorie, tags) VALUES
(
  'L\'histoire du tissage sénoufo à Waraniéné',
  'Plongez dans l\'histoire fascinante du tissage traditionnel sénoufo et découvrez comment cet art ancestral perdure à travers les générations dans notre village.',
  'Le tissage sénoufo est un art millénaire qui se transmet de génération en génération dans notre village de Waraniéné. Cette pratique ancestrale ne se limite pas à la simple fabrication de textiles, elle est l\'expression vivante de notre identité culturelle.\n\nNos ancêtres ont développé des techniques sophistiquées de tissage qui ont traversé les siècles. Chaque motif, chaque couleur raconte une histoire, porte un message, célèbre un événement important de notre communauté.\n\nDans les années 1950, le village comptait plus de 200 tisserands actifs. Aujourd\'hui, grâce à la digitalisation et à cette plateforme, nous donnons une nouvelle vie à cet artisanat en le rendant accessible au monde entier tout en préservant son authenticité.\n\nLes jeunes générations redécouvrent cet art grâce aux opportunités économiques qu\'il offre désormais. C\'est une véritable renaissance culturelle que nous vivons à Waraniéné.',
  'Mamadou Koné',
  '2024-03-01',
  5,
  'Histoire',
  JSON_ARRAY('tradition', 'culture', 'sénoufo', 'tissage')
),
(
  'Les motifs traditionnels et leur signification',
  'Chaque motif tissé dans nos créations raconte une histoire. Découvrez la symbolique profonde des motifs géométriques sénoufo.',
  'Les motifs géométriques du tissage sénoufo ne sont pas de simples décorations. Ils constituent un véritable langage visuel porteur de sens profonds.\n\nLe losange représente la protection et l\'union familiale. Les lignes parallèles symbolisent le chemin de vie et la persévérance. Les triangles évoquent les montagnes sacrées et la connexion avec les ancêtres.\n\nChaque artisan maîtrise une palette de motifs qu\'il combine de manière unique. C\'est comme une signature personnelle qui permet de reconnaître le travail d\'un tisserand particulier.\n\nCertains motifs sont réservés à des occasions spéciales : mariages, cérémonies de passage, célébrations communautaires. D\'autres sont portés au quotidien comme des talismans de protection.\n\nComprendre ces motifs, c\'est comprendre notre vision du monde, nos valeurs, notre philosophie de vie ancestrale.',
  'Fatima Ouattara',
  '2024-02-28',
  7,
  'Culture',
  JSON_ARRAY('motifs', 'symbolisme', 'géométrie', 'art')
),
(
  'La teinture naturelle : secrets et techniques',
  'Apprenez comment nos artisans préparent les teintures naturelles à partir de plantes locales pour donner vie à nos textiles.',
  'La préparation des teintures naturelles est un art en soi qui demande patience, connaissance et respect de la nature.\n\nNos artisans utilisent l\'indigo sauvage pour obtenir les magnifiques bleus profonds caractéristiques de nos tissus. Les racines de certains arbres donnent des rouges éclatants, tandis que les feuilles de baobab produisent des jaunes lumineux.\n\nLe processus commence par la récolte des plantes au bon moment de l\'année. Chaque plante a sa saison optimale pour une couleur intense. Les matières végétales sont ensuite séchées, broyées et bouillies selon des recettes ancestrales.\n\nLes fibres de coton sont trempées dans les bains de teinture à des températures précises. Parfois, plusieurs bains successifs sont nécessaires pour obtenir la nuance désirée.\n\nCette approche écologique garantit des textiles non toxiques, doux pour la peau et respectueux de l\'environnement.',
  'Mariam Coulibaly',
  '2024-02-25',
  6,
  'Technique',
  JSON_ARRAY('teinture', 'naturel', 'plantes', 'technique')
),
(
  'Portrait d\'artisan : Ibrahim Silué, l\'innovateur',
  'Rencontrez Ibrahim Silué, jeune tisserand qui allie tradition et modernité pour créer des accessoires contemporains.',
  'Ibrahim Silué représente la nouvelle génération d\'artisans de Waraniéné. À 28 ans, il a appris le tissage avec son grand-père, maître tisserand reconnu dans tout le village.\n\nMais Ibrahim ne se contente pas de reproduire les créations traditionnelles. Il expérimente de nouveaux formats : pochettes pour ordinateurs portables, sacs à dos urbains, coussins design, tout en utilisant les techniques et motifs ancestraux.\n\n"Je veux montrer que notre patrimoine peut s\'adapter au monde moderne sans perdre son âme", explique-t-il. Ses créations rencontrent un succès particulier auprès de la jeunesse ivoirienne et de la diaspora.\n\nIbrahim utilise aussi les réseaux sociaux pour documenter son travail et inspirer d\'autres jeunes à s\'intéresser au tissage. Il organise des ateliers gratuits pour les enfants du village chaque samedi.\n\nGrâce à cette plateforme, ses créations touchent désormais un public international. C\'est l\'exemple parfait de la fusion réussie entre tradition et innovation.',
  'Équipe Tissés de Waraniéné',
  '2024-02-20',
  4,
  'Portrait',
  JSON_ARRAY('artisan', 'innovation', 'jeunesse', 'modernité')
),
(
  'L\'impact économique du tissage sur notre communauté',
  'Découvrez comment la digitalisation de notre activité transforme l\'économie locale et offre de nouvelles opportunités aux artisans.',
  'Le projet Tissés de Waraniéné a lancé une véritable révolution économique dans notre village. Avant la création de cette plateforme, nos artisans vendaient principalement au marché régional, avec des revenus modestes et irréguliers.\n\nAujourd\'hui, ils accèdent à un marché national et international. Les commandes sont plus régulières, les prix plus justes car nous éliminons les intermédiaires. Un tisserand peut désormais tripler ses revenus mensuels.\n\nCette amélioration économique a des effets en cascade sur toute la communauté. Plus de jeunes choisissent d\'apprendre le tissage plutôt que d\'émigrer vers les grandes villes. Des femmes développent des activités complémentaires : teinture, finition, emballage.\n\nLes revenus supplémentaires permettent aux familles d\'investir dans l\'éducation des enfants, l\'amélioration des habitations, l\'achat de matériel agricole.\n\nNous avons créé 47 emplois directs depuis le lancement et touché indirectement plus de 200 personnes. C\'est la preuve que le digital peut être un outil puissant de développement local.',
  'Seydou Diabaté',
  '2024-02-15',
  8,
  'Économie',
  JSON_ARRAY('économie', 'communauté', 'développement', 'digital')
),
(
  'Les défis de la préservation des traditions',
  'Comment concilier préservation des traditions ancestrales et adaptation aux réalités du monde moderne ? Nos réflexions.',
  'La préservation des traditions face à la mondialisation est un défi majeur pour notre communauté. Comment rester authentiques tout en évoluant ?\n\nNous croyons que la tradition n\'est pas figée. Nos ancêtres ont toujours su innover, adapter leurs techniques aux nouvelles réalités. La vraie tradition, c\'est cette capacité d\'adaptation tout en gardant l\'essentiel : les valeurs, le savoir-faire, le respect du métier.\n\nLa digitalisation n\'est pas une trahison de nos racines. C\'est un outil, comme l\'étaient en leur temps l\'introduction de nouveaux métiers à tisser ou de nouvelles fibres.\n\nLe vrai risque serait de produire en masse, de sacrifier la qualité pour la quantité, d\'oublier le sens des motifs pour ne garder que l\'esthétique. C\'est pourquoi nous avons établi une charte de qualité stricte.\n\nChaque produit vendu sur cette plateforme est accompagné de l\'histoire de son créateur, de l\'explication des motifs utilisés. Nous ne vendons pas que des textiles, nous transmettons un patrimoine vivant.\n\nL\'avenir de nos traditions passe par leur compréhension profonde et leur transmission créative aux nouvelles générations.',
  'Aminata Traoré',
  '2024-02-10',
  6,
  'Réflexion',
  JSON_ARRAY('tradition', 'modernité', 'préservation', 'avenir')
);

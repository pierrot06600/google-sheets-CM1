import { evaluateCell, SheetGrid } from './spreadsheetEngine';

export interface CourseTask {
  id: string;
  instruction: string;
  hint: string;
  sticky?: boolean;
  check: (grid: SheetGrid, selectedCell: string) => boolean;
}

export interface CourseStep {
  id: string;
  number: number;
  title: string;
  summary: string;
  tutorialTitle: string;
  tutorialPoints: string[];
  visualDemoType: 'coordinates' | 'table-headers' | 'planner' | 'formulas' | 'champion';
  badgeName: string;
  badgeCaption: string;
  initialGrid: SheetGrid;
  initialSelectedCell: string;
  tasks: CourseTask[];
}

export interface SheetTemplate {
  id: string;
  name: string;
  description: string;
  grid: SheetGrid;
}

export const COURSE_STEPS: CourseStep[] = [
  {
    id: 'step-1',
    number: 1,
    title: 'La bataille navale des cellules',
    summary: 'Découvre comment se repérer dans un tableau avec les colonnes (lettres) et les lignes (chiffres).',
    tutorialTitle: 'Comment lire une adresse de cellule ?',
    tutorialPoints: [
      'Les colonnes montent et descendent : ce sont les lettres A, B, C, D...',
      'Les lignes vont de gauche à droite : ce sont les chiffres 1, 2, 3, 4...',
      'Une cellule est le croisement des deux ! Exemple : colonne C + ligne 3 = cellule C3.',
    ],
    visualDemoType: 'coordinates',
    badgeName: 'Explorateur de Cellules',
    badgeCaption: 'Tu sais lire toutes les coordonnées de la grille !',
    initialSelectedCell: 'A1',
    initialGrid: {
      A1: { raw: 'Carte au Trésor', bold: true, color: 'emerald' },
      B2: { raw: 'Cahier', color: 'sky' },
      C3: { raw: 'Boussole', color: 'amber' },
      D4: { raw: 'Étoile', color: 'lavender' },
      B5: { raw: 'Crayon', color: 'peach' },
    },
    tasks: [
      {
        id: 's1-t1',
        instruction: 'Clique sur la cellule C3 pour trouver la Boussole.',
        hint: 'Regarde la colonne C en haut et descends jusqu’à la ligne 3.',
        sticky: true,
        check: (_grid, selectedCell) => selectedCell.toUpperCase() === 'C3',
      },
      {
        id: 's1-t2',
        instruction: 'Clique sur la cellule D4 qui contient l’Étoile.',
        hint: 'Cherche la lettre D en haut et le chiffre 4 à gauche.',
        sticky: true,
        check: (_grid, selectedCell) => selectedCell.toUpperCase() === 'D4',
      },
      {
        id: 's1-t3',
        instruction: 'Écris le mot « Trésor » dans la cellule B3 (puis appuie sur Entrée).',
        hint: 'Sélectionne B3, tape Trésor dans la barre ou la case, puis valide.',
        check: (grid) => (grid['B3']?.raw ?? '').trim().toLowerCase().includes('trésor') || (grid['B3']?.raw ?? '').trim().toLowerCase().includes('tresor'),
      },
    ],
  },
  {
    id: 'step-2',
    number: 2,
    title: 'Créer mon premier petit tableau',
    summary: 'Construis un tableau clair avec des titres en haut (en-têtes), du texte, des nombres et des couleurs.',
    tutorialTitle: 'Les 3 secrets d’un beau tableau',
    tutorialPoints: [
      'La ligne 1 sert toujours aux titres des colonnes (on appelle ça les en-têtes).',
      'Mets les titres en Gras (G) et ajoute une couleur douce pour bien les voir.',
      'Range chaque information dans sa bonne colonne : texte à gauche, nombres bien séparés.',
    ],
    visualDemoType: 'table-headers',
    badgeName: 'Architecte de Tableau',
    badgeCaption: 'Tes tableaux sont propres, colorés et faciles à lire !',
    initialSelectedCell: 'A1',
    initialGrid: {
      A1: { raw: 'Objet scolaire', color: 'none' },
      B1: { raw: 'Quantité', color: 'none', align: 'center' },
      C1: { raw: 'Couleur', color: 'none' },
      A2: { raw: 'Cahier de maths', color: 'none' },
      B2: { raw: '2', align: 'center' },
      C2: { raw: 'Bleu' },
      A3: { raw: 'Stylo bille', color: 'none' },
      B3: { raw: '4', align: 'center' },
      C3: { raw: 'Vert' },
    },
    tasks: [
      {
        id: 's2-t1',
        instruction: 'Mets les titres A1, B1 et C1 en Gras avec le bouton G.',
        hint: 'Clique sur A1 puis appuie sur G, fais pareil pour B1 et C1.',
        check: (grid) => Boolean(grid['A1']?.bold && grid['B1']?.bold && grid['C1']?.bold),
      },
      {
        id: 's2-t2',
        instruction: 'Colorie au moins une case titre (A1, B1 ou C1) avec les pastilles de couleur.',
        hint: 'Sélectionne A1 puis choisis une couleur claire dans la barre d’outils.',
        check: (grid) =>
          (grid['A1']?.color && grid['A1']?.color !== 'none') ||
          (grid['B1']?.color && grid['B1']?.color !== 'none') ||
          (grid['C1']?.color && grid['C1']?.color !== 'none') || false,
      },
      {
        id: 's2-t3',
        instruction: 'Ajoute une nouvelle fourniture sur la ligne 4 : écris un nom en A4 et un nombre en B4.',
        hint: 'Par exemple : « Règle » en A4 et « 1 » en B4.',
        check: (grid) => {
          const name = (grid['A4']?.raw ?? '').trim();
          const qty = evaluateCell('B4', grid).numericValue;
          return name.length >= 2 && qty !== null && qty > 0;
        },
      },
    ],
  },
  {
    id: 'step-3',
    number: 3,
    title: 'Organiser mes devoirs et activités favorites',
    summary: 'Utilise un tableau pré-rempli pour organiser tes devoirs de CM1 et tes loisirs préférés sans rien oublier.',
    tutorialTitle: 'Classer ses devoirs et ses loisirs',
    tutorialPoints: [
      'Chaque ligne représente une tâche (un devoir ou une activité favorite).',
      'Utilise des couleurs différentes : par exemple Bleu pour les Devoirs et Jaune pour les Loisirs.',
      'Mets à jour la colonne Statut quand tu as fini (« Fait ») !',
    ],
    visualDemoType: 'planner',
    badgeName: 'As de l’Organisation',
    badgeCaption: 'Devoirs et activités sont parfaitement classés !',
    initialSelectedCell: 'E2',
    initialGrid: {
      A1: { raw: 'Activité ou Devoir', bold: true, color: 'emerald' },
      B1: { raw: 'Catégorie', bold: true, color: 'emerald' },
      C1: { raw: 'Jour', bold: true, color: 'emerald' },
      D1: { raw: 'Points', bold: true, color: 'emerald', align: 'center' },
      E1: { raw: 'Statut', bold: true, color: 'emerald', align: 'center' },

      A2: { raw: 'Tables de multiplication', color: 'sky' },
      B2: { raw: 'Devoir', color: 'sky' },
      C2: { raw: 'Lundi', color: 'sky' },
      D2: { raw: '20', color: 'sky', align: 'center' },
      E2: { raw: 'À faire', color: 'peach', align: 'center' },

      A3: { raw: 'Lecture du roman', color: 'sky' },
      B3: { raw: 'Devoir', color: 'sky' },
      C3: { raw: 'Mardi', color: 'sky' },
      D3: { raw: '25', color: 'sky', align: 'center' },
      E3: { raw: 'Fait', color: 'emerald', align: 'center' },

      A4: { raw: 'Entraînement football', color: 'amber' },
      B4: { raw: 'Loisir', color: 'amber' },
      C4: { raw: 'Mercredi', color: 'amber' },
      D4: { raw: '60', color: 'amber', align: 'center' },
      E4: { raw: 'Fait', color: 'emerald', align: 'center' },

      A5: { raw: 'Poésie à apprendre', color: 'sky' },
      B5: { raw: 'Devoir', color: 'sky' },
      C5: { raw: 'Jeudi', color: 'sky' },
      D5: { raw: '15', color: 'sky', align: 'center' },
      E5: { raw: 'À faire', color: 'peach', align: 'center' },
    },
    tasks: [
      {
        id: 's3-t1',
        instruction: 'Passe le statut des tables de multiplication (E2) à « Fait ».',
        hint: 'Clique sur E2 et remplace « À faire » par « Fait ».',
        check: (grid) => (grid['E2']?.raw ?? '').trim().toLowerCase() === 'fait',
      },
      {
        id: 's3-t2',
        instruction: 'Ajoute ton activité favorite sur la ligne 6 (nom en A6, catégorie en B6, jour en C6, points en D6).',
        hint: 'Ex : A6 = « Dessin », B6 = « Loisir », C6 = « Samedi », D6 = « 40 ».',
        check: (grid) => {
          const a6 = (grid['A6']?.raw ?? '').trim();
          const b6 = (grid['B6']?.raw ?? '').trim();
          const d6 = evaluateCell('D6', grid).numericValue;
          return a6.length >= 2 && b6.length >= 2 && d6 !== null && d6 > 0;
        },
      },
      {
        id: 's3-t3',
        instruction: 'Colorie ta nouvelle ligne (au moins A6) avec une couleur de ton choix.',
        hint: 'Clique sur A6 puis choisis une couleur joyeuse dans la barre d’outils.',
        check: (grid) => Boolean(grid['A6']?.color && grid['A6']?.color !== 'none'),
      },
    ],
  },
  {
    id: 'step-4',
    number: 4,
    title: 'Les formules magiques (=SOMME et =MOYENNE)',
    summary: 'Laisse Google Sheets calculer tout seul le total de points et la moyenne de tes activités !',
    tutorialTitle: 'La règle d’or des formules',
    tutorialPoints: [
      'Une formule commence TOUJOURS par le signe égal « = ».',
      '=SOMME(D2:D6) additionne toutes les cases de D2 jusqu’à D6 en un instant.',
      'Si tu changes un chiffre dans la colonne D, le total se met à jour tout seul !',
    ],
    visualDemoType: 'formulas',
    badgeName: 'Magicien des Formules',
    badgeCaption: 'Tu fais calculer l’ordinateur à ta place grâce au signe = !',
    initialSelectedCell: 'D7',
    initialGrid: {
      A1: { raw: 'Activité', bold: true, color: 'emerald' },
      B1: { raw: 'Catégorie', bold: true, color: 'emerald' },
      C1: { raw: 'Jour', bold: true, color: 'emerald' },
      D1: { raw: 'Points', bold: true, color: 'emerald', align: 'center' },

      A2: { raw: 'Maths : Fractions', color: 'sky' },
      B2: { raw: 'Devoir', color: 'sky' },
      C2: { raw: 'Lundi', color: 'sky' },
      D2: { raw: '20', color: 'sky', align: 'center' },

      A3: { raw: 'Dictée préparée', color: 'sky' },
      B3: { raw: 'Devoir', color: 'sky' },
      C3: { raw: 'Mardi', color: 'sky' },
      D3: { raw: '15', color: 'sky', align: 'center' },

      A4: { raw: 'Atelier LEGO / Dessin', color: 'amber' },
      B4: { raw: 'Loisir', color: 'amber' },
      C4: { raw: 'Mercredi', color: 'amber' },
      D4: { raw: '45', color: 'amber', align: 'center' },

      A5: { raw: 'Sciences : Les planètes', color: 'sky' },
      B5: { raw: 'Devoir', color: 'sky' },
      C5: { raw: 'Jeudi', color: 'sky' },
      D5: { raw: '25', color: 'sky', align: 'center' },

      A6: { raw: 'Vélo au parc', color: 'amber' },
      B6: { raw: 'Loisir', color: 'amber' },
      C6: { raw: 'Samedi', color: 'amber' },
      D6: { raw: '45', color: 'amber', align: 'center' },

      C7: { raw: 'TOTAL :', bold: true, color: 'lavender', align: 'right' },
      D7: { raw: '', bold: true, color: 'lavender', align: 'center' },
      C8: { raw: 'MOYENNE :', bold: true, color: 'sky', align: 'right' },
      D8: { raw: '', bold: true, color: 'sky', align: 'center' },
    },
    tasks: [
      {
        id: 's4-t1',
        instruction: 'Dans la case D7, tape au clavier =SOMME(D2:D6) puis appuie sur Entrée.',
        hint: 'Sélectionne D7, puis écris =SOMME(D2:D6) avec ton clavier et valide.',
        check: (grid) => {
          const raw = (grid['D7']?.raw ?? '').trim().toUpperCase();
          const res = evaluateCell('D7', grid);
          return raw.startsWith('=') && (raw.includes('SOMME') || raw.includes('SUM')) && res.error === null && res.numericValue !== null;
        },
      },
      {
        id: 's4-t2',
        instruction: 'Dans la case D8, calcule la moyenne avec =MOYENNE(D2:D6).',
        hint: 'Sélectionne D8 et tape =MOYENNE(D2:D6) puis appuie sur Entrée.',
        check: (grid) => {
          const raw = (grid['D8']?.raw ?? '').trim().toUpperCase();
          const res = evaluateCell('D8', grid);
          return raw.startsWith('=') && (raw.includes('MOYENNE') || raw.includes('AVERAGE')) && res.error === null && res.numericValue !== null;
        },
      },
      {
        id: 's4-t3',
        instruction: 'Fais le test magique : change le nombre en D2 (ex: mets 30) et observe D7 et D8 changer seuls !',
        hint: 'Clique sur D2, change 20 par un autre nombre (ex: 30) et valide.',
        check: (grid) => {
          const d2 = evaluateCell('D2', grid).numericValue;
          const d7 = evaluateCell('D7', grid);
          return d2 !== null && d2 !== 20 && d7.error === null && d7.numericValue !== null;
        },
      },
    ],
  },
  {
    id: 'step-5',
    number: 5,
    title: 'Défi final : Mon tableau de champion',
    summary: 'Complète ton propre tableau de semaine et utilise une formule =NB.SI pour compter tes missions réussies !',
    tutorialTitle: 'Tout combiner comme un pro de Google Sheets',
    tutorialPoints: [
      'Tu sais nommer une cellule (A1, B3...), colorier et mettre en gras les titres.',
      'Tu sais additionner toute une colonne automatiquement avec =SOMME(D2:D5).',
      'Tu peux aussi compter les missions terminées avec =NB.SI(E2:E6; "Fait").',
    ],
    visualDemoType: 'champion',
    badgeName: 'Champion CM1 du Tableur',
    badgeCaption: 'Toutes les étapes réussies avec brio !',
    initialSelectedCell: 'E7',
    initialGrid: {
      A1: { raw: 'Mission de la semaine', bold: true, color: 'emerald' },
      B1: { raw: 'Type', bold: true, color: 'emerald' },
      C1: { raw: 'Jour', bold: true, color: 'emerald' },
      D1: { raw: 'Points', bold: true, color: 'emerald', align: 'center' },
      E1: { raw: 'Statut', bold: true, color: 'emerald', align: 'center' },

      A2: { raw: 'Problème de géométrie', color: 'sky' },
      B2: { raw: 'Devoir', color: 'sky' },
      C2: { raw: 'Lundi', color: 'sky' },
      D2: { raw: '20', color: 'sky', align: 'center' },
      E2: { raw: 'Fait', color: 'emerald', align: 'center' },

      A3: { raw: 'Histoire : Le Moyen Âge', color: 'sky' },
      B3: { raw: 'Devoir', color: 'sky' },
      C3: { raw: 'Mardi', color: 'sky' },
      D3: { raw: '20', color: 'sky', align: 'center' },
      E3: { raw: 'Fait', color: 'emerald', align: 'center' },

      A4: { raw: 'Natation / Sport', color: 'amber' },
      B4: { raw: 'Loisir', color: 'amber' },
      C4: { raw: 'Mercredi', color: 'amber' },
      D4: { raw: '60', color: 'amber', align: 'center' },
      E4: { raw: 'Fait', color: 'emerald', align: 'center' },

      A5: { raw: 'Jeu de société en famille', color: 'amber' },
      B5: { raw: 'Loisir', color: 'amber' },
      C5: { raw: 'Vendredi', color: 'amber' },
      D5: { raw: '45', color: 'amber', align: 'center' },
      E5: { raw: 'À faire', color: 'peach', align: 'center' },

      C7: { raw: 'Total points :', bold: true, color: 'lavender', align: 'right' },
      D7: { raw: '=SOMME(D2:D5)', bold: true, color: 'lavender', align: 'center' },
      C8: { raw: 'Missions faites :', bold: true, color: 'sky', align: 'right' },
      E7: { raw: '', bold: true, color: 'sky', align: 'center' },
    },
    tasks: [
      {
        id: 's5-t1',
        instruction: 'Ajoute une nouvelle activité favorite sur la ligne 6 (nom en A6 et points en D6).',
        hint: 'Par exemple : A6 = « Bande dessinée », B6 = « Loisir », C6 = « Dimanche », D6 = « 30 ».',
        check: (grid) => {
          const a6 = (grid['A6']?.raw ?? '').trim();
          const d6 = evaluateCell('D6', grid).numericValue;
          return a6.length >= 2 && d6 !== null && d6 > 0;
        },
      },
      {
        id: 's5-t2',
        instruction: 'Dans la case E7, compte les missions « Fait » en tapant =NB.SI(E2:E6; "Fait").',
        hint: 'Sélectionne E7 et tape au clavier =NB.SI(E2:E6; "Fait") puis valide.',
        check: (grid) => {
          const raw = (grid['E7']?.raw ?? '').trim().toUpperCase();
          const res = evaluateCell('E7', grid);
          return raw.startsWith('=') && (raw.includes('NB.SI') || raw.includes('COUNTIF')) && res.error === null && res.numericValue !== null;
        },
      },
    ],
  },
];

export const SANDBOX_TEMPLATES: SheetTemplate[] = [
  {
    id: 'devoirs-cm1',
    name: 'Mes Devoirs de CM1',
    description: 'Modèle pré-rempli avec matières, points et calcul automatique du total.',
    grid: {
      A1: { raw: 'Matière', bold: true, color: 'emerald' },
      B1: { raw: 'Exercice', bold: true, color: 'emerald' },
      C1: { raw: 'Jour', bold: true, color: 'emerald' },
      D1: { raw: 'Points', bold: true, color: 'emerald', align: 'center' },
      E1: { raw: 'Statut', bold: true, color: 'emerald', align: 'center' },
      A2: { raw: 'Français', color: 'sky' },
      B2: { raw: 'Conjugaison passé composé', color: 'sky' },
      C2: { raw: 'Lundi', color: 'sky' },
      D2: { raw: '20', color: 'sky', align: 'center' },
      E2: { raw: 'Fait', color: 'emerald', align: 'center' },
      A3: { raw: 'Mathématiques', color: 'sky' },
      B3: { raw: 'Fractions décimales', color: 'sky' },
      C3: { raw: 'Mardi', color: 'sky' },
      D3: { raw: '25', color: 'sky', align: 'center' },
      E3: { raw: 'À faire', color: 'peach', align: 'center' },
      A4: { raw: 'Sciences', color: 'sky' },
      B4: { raw: 'Schéma du système solaire', color: 'sky' },
      C4: { raw: 'Jeudi', color: 'sky' },
      D4: { raw: '30', color: 'sky', align: 'center' },
      E4: { raw: 'À faire', color: 'peach', align: 'center' },
      A5: { raw: 'Anglais', color: 'sky' },
      B5: { raw: 'Vocabulaire des animaux', color: 'sky' },
      C5: { raw: 'Vendredi', color: 'sky' },
      D5: { raw: '15', color: 'sky', align: 'center' },
      E5: { raw: 'Fait', color: 'emerald', align: 'center' },
      C7: { raw: 'Total devoirs :', bold: true, color: 'lavender', align: 'right' },
      D7: { raw: '=SOMME(D2:D6)', bold: true, color: 'lavender', align: 'center' },
      C8: { raw: 'Devoirs faits :', bold: true, color: 'emerald', align: 'right' },
      E8: { raw: '=NB.SI(E2:E6; "Fait")', bold: true, color: 'emerald', align: 'center' },
    },
  },
  {
    id: 'activites-favorites',
    name: 'Mes Activités Favorites',
    description: 'Tableau ludique pour noter ses passions, le nombre de séances et sa note sur 10.',
    grid: {
      A1: { raw: 'Activité favorite', bold: true, color: 'amber' },
      B1: { raw: 'Jour', bold: true, color: 'amber' },
      C1: { raw: 'Étoiles', bold: true, color: 'amber', align: 'center' },
      D1: { raw: 'Note /10', bold: true, color: 'amber', align: 'center' },
      A2: { raw: 'Football / Basket', color: 'sky' },
      B2: { raw: 'Mercredi', color: 'sky' },
      C2: { raw: '6', color: 'sky', align: 'center' },
      D2: { raw: '9', color: 'sky', align: 'center' },
      A3: { raw: 'Dessin & BD', color: 'peach' },
      B3: { raw: 'Samedi', color: 'peach' },
      C3: { raw: '5', color: 'peach', align: 'center' },
      D3: { raw: '10', color: 'peach', align: 'center' },
      A4: { raw: 'Musique / Piano', color: 'lavender' },
      B4: { raw: 'Jeudi', color: 'lavender' },
      C4: { raw: '3', color: 'lavender', align: 'center' },
      D4: { raw: '8', color: 'lavender', align: 'center' },
      A5: { raw: 'Cuisine avec papa/maman', color: 'emerald' },
      B5: { raw: 'Dimanche', color: 'emerald' },
      C5: { raw: '4', color: 'emerald', align: 'center' },
      D5: { raw: '10', color: 'emerald', align: 'center' },
      B7: { raw: 'Total étoiles :', bold: true, color: 'sky', align: 'right' },
      C7: { raw: '=SOMME(C2:C6)', bold: true, color: 'sky', align: 'center' },
      B8: { raw: 'Moyenne /10 :', bold: true, color: 'amber', align: 'right' },
      D8: { raw: '=MOYENNE(D2:D6)', bold: true, color: 'amber', align: 'center' },
    },
  },
  {
    id: 'chasse-tresor',
    name: 'Grille de Repérage',
    description: 'Grille simple pour réviser les coordonnées (colonnes + lignes).',
    grid: {
      A1: { raw: 'Départ', bold: true, color: 'emerald' },
      C2: { raw: 'Indice 1', color: 'sky' },
      E4: { raw: 'Indice 2', color: 'amber' },
      B6: { raw: 'Trésor !', bold: true, color: 'lavender' },
    },
  },
  {
    id: 'vierge',
    name: 'Tableau Vierge',
    description: 'Une feuille blanche pour inventer ton propre tableau de A à F.',
    grid: {},
  },
];

export function evaluateStepProgress(
  step: CourseStep,
  grid: SheetGrid,
  selectedCell: string,
  previouslyCompleted: Set<string> = new Set()
): { taskResults: Record<string, boolean>; completedCount: number; allCompleted: boolean } {
  const taskResults: Record<string, boolean> = {};
  let completedCount = 0;
  for (const task of step.tasks) {
    const passed = (task.sticky && previouslyCompleted.has(task.id)) || task.check(grid, selectedCell);
    taskResults[task.id] = passed;
    if (passed) completedCount++;
  }
  return {
    taskResults,
    completedCount,
    allCompleted: completedCount === step.tasks.length,
  };
}

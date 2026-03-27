export interface ISlapTip {
  id: number;
  icon: string;
  tip: string;
}

export const SLAP_TIPS: ISlapTip[] = [
  {
    id: 1,
    icon: "🐢",
    tip: "Commence toujours lentement. Le slap est une technique musculaire — la vitesse viendra naturellement avec la répétition. Travaille chaque exercice à 50% du BPM cible avant d'accélérer.",
  },
  {
    id: 2,
    icon: "🔨",
    tip: "Le son du slap vient du rebond, pas de la force. Ton pouce doit frapper la corde et repartir immédiatement, comme un marteau de piano — si tu restes appuyé, la corde ne peut pas vibrer.",
  },
  {
    id: 3,
    icon: "🎸",
    tip: "Commence sur corde à vide (Mi ou La grave). Avant de fretter des notes, maîtrise le geste du pouce seul sur corde ouverte : slap propre, rebond immédiat, son percussif clair.",
  },
  {
    id: 4,
    icon: "👻",
    tip: "Le muting est aussi important que les notes. Les notes fantômes (ghost notes) — cordes étouffées légèrement par la main gauche puis slappées — donnent le groove funk. C'est le \"chick\" entre les notes.",
  },
  {
    id: 5,
    icon: "🔧",
    tip: "Adapte le setup de ta guitare. Une action (hauteur des cordes) trop haute rend le slap difficile. Une légère baisse de l'action sur les cordes graves facilite l'apprentissage — sans trop descendre pour éviter le fret buzz.",
  },
];

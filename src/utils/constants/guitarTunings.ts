export interface IGuitarTuning {
  id: string;
  name: string;
  strings: [string, string, string, string, string, string]; // corde 6→1 (grave→aigu)
}

export interface IGuitarTuningCategory {
  id: string;
  title: string;
  tunings: IGuitarTuning[];
}

// Couleurs fixes par corde (corde 6 = plus grosse, corde 1 = plus fine)
export const STRING_COLORS: Record<number, string> = {
  6: "#ef4444", // rouge
  5: "#f97316", // orange
  4: "#eab308", // jaune
  3: "#22c55e", // vert
  2: "#3b82f6", // bleu
  1: "#a855f7", // violet
};

// Mapping pour le lookup depuis le nom brut de la DB (ex: "Drop D", "Standard", "Eb")
const TUNING_ALIASES: Record<string, string> = {
  "standard": "standard",
  "eb": "eb",
  "e♭": "eb",
  "d standard": "d-standard",
  "c# standard": "db-standard",
  "db standard": "db-standard",
  "c standard": "c-standard",
  "b standard": "b-standard",
  "drop d": "drop-d",
  "drop c#": "drop-db",
  "drop db": "drop-db",
  "drop c": "drop-c",
  "drop b": "drop-b",
  "drop a": "drop-a",
  "double drop d": "double-drop-d",
  "open e": "open-e",
  "open d": "open-d",
  "open g": "open-g",
  "open a": "open-a",
  "open c": "open-c",
  "open b": "open-b",
  "dadgad": "dadgad",
  "open dm": "open-dm",
  "open g5": "open-g5",
  "all fourths": "all-fourths",
  "celtic": "celtic",
  "lute": "lute",
};

// Retourne un IGuitarTuning à partir du champ tuning de la DB
// Gère les capos ("Capo 2" → Standard), les variantes (Eb, Drop D…)
export interface ITuningResult {
  tuning: IGuitarTuning;
  capo?: number;
}

export const findTuningByName = (raw: string): ITuningResult | null => {
  const normalized = raw.trim().toLowerCase();

  // Détection capo (ex: "Capo 2", "Capo 3")
  const capoMatch = normalized.match(/capo\s*(\d+)/);
  if (capoMatch) {
    const standardTuning = GUITAR_TUNING_CATEGORIES
      .flatMap((c) => c.tunings)
      .find((t) => t.id === "standard") ?? null;
    return standardTuning ? { tuning: standardTuning, capo: parseInt(capoMatch[1]) } : null;
  }

  // Lookup direct via alias
  const id = TUNING_ALIASES[normalized];
  if (id) {
    const found = GUITAR_TUNING_CATEGORIES.flatMap((c) => c.tunings).find((t) => t.id === id);
    return found ? { tuning: found } : null;
  }

  return null;
};

export const GUITAR_TUNING_CATEGORIES: IGuitarTuningCategory[] = [
  {
    id: "standard",
    title: "Standard & Variantes",
    tunings: [
      { id: "standard",    name: "Standard (E)",          strings: ["E",  "A",  "D",  "G",  "B",  "E"]  },
      { id: "eb",          name: "Eb (½ ton en dessous)",  strings: ["Eb", "Ab", "Db", "Gb", "Bb", "Eb"] },
      { id: "d-standard",  name: "D Standard",             strings: ["D",  "G",  "C",  "F",  "A",  "D"]  },
      { id: "db-standard", name: "C# / Db Standard",       strings: ["C#", "F#", "B",  "E",  "G#", "C#"] },
      { id: "c-standard",  name: "C Standard",             strings: ["C",  "F",  "Bb", "Eb", "G",  "C"]  },
      { id: "b-standard",  name: "B Standard",             strings: ["B",  "E",  "A",  "D",  "F#", "B"]  },
    ],
  },
  {
    id: "drop",
    title: "Drop Tunings",
    tunings: [
      { id: "drop-d",        name: "Drop D",            strings: ["D",  "A",  "D",  "G",  "B",  "E"]  },
      { id: "drop-db",       name: "Drop C# / Db",      strings: ["C#", "Ab", "Db", "Gb", "Bb", "Eb"] },
      { id: "drop-c",        name: "Drop C",            strings: ["C",  "G",  "C",  "F",  "A",  "D"]  },
      { id: "drop-b",        name: "Drop B",            strings: ["B",  "F#", "B",  "E",  "G#", "C#"] },
      { id: "drop-a",        name: "Drop A",            strings: ["A",  "E",  "A",  "D",  "F#", "B"]  },
      { id: "double-drop-d", name: "Double Drop D",     strings: ["D",  "A",  "D",  "G",  "B",  "D"]  },
    ],
  },
  {
    id: "open",
    title: "Open Tunings",
    tunings: [
      { id: "open-e", name: "Open E",  strings: ["E", "B",  "E",  "G#", "B",  "E"] },
      { id: "open-d", name: "Open D",  strings: ["D", "A",  "D",  "F#", "A",  "D"] },
      { id: "open-g", name: "Open G",  strings: ["D", "G",  "D",  "G",  "B",  "D"] },
      { id: "open-a", name: "Open A",  strings: ["E", "A",  "E",  "A",  "C#", "E"] },
      { id: "open-c", name: "Open C",  strings: ["C", "G",  "C",  "G",  "C",  "E"] },
      { id: "open-b", name: "Open B",  strings: ["B", "F#", "B",  "D#", "F#", "B"] },
    ],
  },
  {
    id: "alternate",
    title: "Accordages Alternatifs",
    tunings: [
      { id: "dadgad",      name: "DADGAD",            strings: ["D", "A", "D", "G", "A", "D"] },
      { id: "open-dm",     name: "Open Dm (DADFAD)",  strings: ["D", "A", "D", "F", "A", "D"] },
      { id: "open-g5",     name: "Open G5",           strings: ["D", "G", "D", "G", "D", "G"] },
      { id: "all-fourths", name: "All Fourths",       strings: ["E", "A", "D", "G", "C", "F"] },
      { id: "celtic",      name: "Celtic (DADGBE)",   strings: ["D", "A", "D", "G", "B", "E"] },
      { id: "lute",        name: "Luth (EADGBE -3)",  strings: ["E", "A", "D", "F#", "B", "E"] },
    ],
  },
];

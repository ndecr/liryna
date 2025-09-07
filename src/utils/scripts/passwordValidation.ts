// Validation sécurisée des mots de passe côté client
// Cette validation DOIT être dupliquée côté serveur

export interface PasswordStrength {
  score: number; // 0-5 (5 = très fort)
  feedback: string[];
  isValid: boolean;
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  name: string;
  description: string;
  isMet: boolean;
  priority: 'critical' | 'important' | 'recommended';
}

// Liste des mots de passe les plus courants (extrait)
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
  'sunshine', 'master', 'shadow', 'azerty', 'trustno1', '000000',
  'football', 'baseball', 'superman', 'michael', 'jordan', 'harley',
  'ranger', 'hunter', 'buster', 'soccer', 'hockey', 'killer',
  'george', 'sexy', 'andrew', 'charlie', 'superman', 'asshole',
  'computer', 'maverick', 'pepper', 'chelsea', 'mustang', 'denver'
];

// Motifs de claviers courants
const KEYBOARD_PATTERNS = [
  'qwerty', 'azerty', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  '123456789', '1234567890', 'abcdefg', 'abcdefgh'
];

/**
 * Valide la force d'un mot de passe selon des critères stricts
 */
export const validatePasswordStrength = (password: string): PasswordStrength => {
  const requirements: PasswordRequirement[] = [
    {
      name: 'length',
      description: 'Au moins 8 caractères',
      isMet: password.length >= 8,
      priority: 'critical'
    },
    {
      name: 'lowercase',
      description: 'Au moins une lettre minuscule',
      isMet: /[a-z]/.test(password),
      priority: 'critical'
    },
    {
      name: 'uppercase',
      description: 'Au moins une lettre majuscule',
      isMet: /[A-Z]/.test(password),
      priority: 'critical'
    },
    {
      name: 'digit',
      description: 'Au moins un chiffre',
      isMet: /\d/.test(password),
      priority: 'critical'
    },
    {
      name: 'special',
      description: 'Au moins un caractère spécial (@$!%*?&)',
      isMet: /[@$!%*?&]/.test(password),
      priority: 'critical'
    },
    {
      name: 'minLength12',
      description: '12 caractères ou plus (recommandé)',
      isMet: password.length >= 12,
      priority: 'recommended'
    },
    {
      name: 'noCommon',
      description: 'Pas un mot de passe courant',
      isMet: !isCommonPassword(password),
      priority: 'important'
    },
    {
      name: 'noKeyboard',
      description: 'Pas un motif de clavier',
      isMet: !hasKeyboardPattern(password),
      priority: 'important'
    },
    {
      name: 'noRepetitive',
      description: 'Pas de caractères répétitifs',
      isMet: !hasRepetitiveChars(password),
      priority: 'important'
    },
    {
      name: 'variety',
      description: 'Variété de caractères spéciaux',
      isMet: getSpecialCharVariety(password) >= 2,
      priority: 'recommended'
    }
  ];

  const criticalMet = requirements.filter(r => r.priority === 'critical' && r.isMet).length;
  const importantMet = requirements.filter(r => r.priority === 'important' && r.isMet).length;
  const recommendedMet = requirements.filter(r => r.priority === 'recommended' && r.isMet).length;

  // Calcul du score (0-5)
  let score = 0;
  if (criticalMet >= 5) score = 2; // Base si tous les critères critiques sont remplis
  if (criticalMet >= 5 && importantMet >= 2) score = 3;
  if (criticalMet >= 5 && importantMet >= 3) score = 4;
  if (criticalMet >= 5 && importantMet >= 3 && recommendedMet >= 1) score = 5;

  // Le mot de passe est valide si tous les critères critiques sont remplis
  const isValid = criticalMet === 5;

  const feedback = generateFeedback(requirements, score);

  return {
    score,
    feedback,
    isValid,
    requirements
  };
};

/**
 * Génère des messages de retour personnalisés
 */
const generateFeedback = (requirements: PasswordRequirement[], score: number): string[] => {
  const feedback: string[] = [];

  const unmetCritical = requirements.filter(r => r.priority === 'critical' && !r.isMet);
  const unmetImportant = requirements.filter(r => r.priority === 'important' && !r.isMet);

  if (unmetCritical.length > 0) {
    feedback.push('Critères obligatoires manquants :');
    unmetCritical.forEach(req => {
      feedback.push(`• ${req.description}`);
    });
  }

  if (unmetImportant.length > 0 && unmetCritical.length === 0) {
    feedback.push('Pour améliorer la sécurité :');
    unmetImportant.forEach(req => {
      feedback.push(`• ${req.description}`);
    });
  }

  // Messages selon le score
  switch (score) {
    case 0:
    case 1:
      feedback.push('⚠️ Mot de passe très faible - Vulnérable aux attaques');
      break;
    case 2:
      feedback.push('⚠️ Mot de passe faible - Amélioration requise');
      break;
    case 3:
      feedback.push('✅ Mot de passe acceptable - Peut être amélioré');
      break;
    case 4:
      feedback.push('✅ Bon mot de passe - Sécurité correcte');
      break;
    case 5:
      feedback.push('🔒 Excellent mot de passe - Très sécurisé');
      break;
  }

  return feedback;
};

/**
 * Vérifie si le mot de passe est dans la liste des mots de passe courants
 */
const isCommonPassword = (password: string): boolean => {
  const lowercasePassword = password.toLowerCase();
  return COMMON_PASSWORDS.some(common => 
    lowercasePassword === common || 
    lowercasePassword.includes(common) ||
    common.includes(lowercasePassword)
  );
};

/**
 * Vérifie la présence de motifs de clavier
 */
const hasKeyboardPattern = (password: string): boolean => {
  const lowercasePassword = password.toLowerCase();
  return KEYBOARD_PATTERNS.some(pattern => 
    lowercasePassword.includes(pattern) || 
    lowercasePassword.includes(pattern.split('').reverse().join(''))
  );
};

/**
 * Vérifie la présence de caractères répétitifs
 */
const hasRepetitiveChars = (password: string): boolean => {
  // Vérifier les séquences de 3+ caractères identiques
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
      return true;
    }
  }

  // Vérifier les séquences simples (123, abc, etc.)
  for (let i = 0; i < password.length - 2; i++) {
    const char1 = password.charCodeAt(i);
    const char2 = password.charCodeAt(i + 1);
    const char3 = password.charCodeAt(i + 2);
    
    if (char2 === char1 + 1 && char3 === char2 + 1) {
      return true; // Séquence croissante
    }
    if (char2 === char1 - 1 && char3 === char2 - 1) {
      return true; // Séquence décroissante
    }
  }

  return false;
};

/**
 * Compte la variété de caractères spéciaux
 */
const getSpecialCharVariety = (password: string): number => {
  const specialChars = new Set();
  const specialPattern = /[@$!%*?&()_+=\-{}\[\]:";'<>?,./\\|`~]/;
  
  for (const char of password) {
    if (specialPattern.test(char)) {
      specialChars.add(char);
    }
  }
  
  return specialChars.size;
};

// Fonction générée plus bas avec une meilleure implémentation

/**
 * Estime le temps nécessaire pour craquer le mot de passe
 */
export const estimateCrackTime = (password: string): string => {
  const charset = getCharsetSize(password);
  const entropy = Math.log2(Math.pow(charset, password.length));
  
  // Supposer 1 milliard de tentatives par seconde (attaque moderne)
  const attemptsPerSecond = 1e9;
  const secondsToCrack = Math.pow(2, entropy - 1) / attemptsPerSecond;
  
  if (secondsToCrack < 60) return 'Moins d\'une minute';
  if (secondsToCrack < 3600) return `${Math.ceil(secondsToCrack / 60)} minutes`;
  if (secondsToCrack < 86400) return `${Math.ceil(secondsToCrack / 3600)} heures`;
  if (secondsToCrack < 31536000) return `${Math.ceil(secondsToCrack / 86400)} jours`;
  if (secondsToCrack < 31536000 * 1000) return `${Math.ceil(secondsToCrack / 31536000)} ans`;
  
  return 'Des millénaires';
};

/**
 * Calcule la taille de l'ensemble de caractères utilisés
 */
const getCharsetSize = (password: string): number => {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/\d/.test(password)) size += 10;
  if (/[@$!%*?&()_+=\-{}\[\]:";'<>?,./\\|`~]/.test(password)) size += 32;
  return size;
};

/**
 * Génère un mot de passe fort aléatoirement
 */
export const generateStrongPassword = (length: number = 16): string => {
  // Caractères EXACTEMENT comme attendus par le serveur
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '@$!%*?&'; // SEULEMENT ceux autorisés par le backend
  
  // S'assurer d'un minimum de 8 caractères même si demandé moins
  const finalLength = Math.max(length, 8);
  
  // S'assurer qu'on a au moins un caractère de chaque catégorie REQUISE
  let password = '';
  
  // Ajouter au moins un caractère de chaque type requis (backend validation)
  password += getRandomChar(lowercase);   // au moins 1 minuscule
  password += getRandomChar(uppercase);   // au moins 1 majuscule  
  password += getRandomChar(numbers);     // au moins 1 chiffre
  password += getRandomChar(specialChars); // au moins 1 caractère spécial
  
  // Compléter avec des caractères aléatoires (tous autorisés)
  const allChars = lowercase + uppercase + numbers + specialChars;
  for (let i = password.length; i < finalLength; i++) {
    password += getRandomChar(allChars);
  }
  
  // Mélanger le mot de passe pour éviter un pattern prévisible
  return shuffleString(password);
};

/**
 * Sélectionne un caractère aléatoire dans une chaîne
 */
const getRandomChar = (chars: string): string => {
  const randomIndex = Math.floor(Math.random() * chars.length);
  return chars[randomIndex];
};

/**
 * Mélange aléatoirement les caractères d'une chaîne
 */
const shuffleString = (str: string): string => {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
};
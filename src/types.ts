export type VoiceType = 'ember_ur' | 'guardian_oracle' | 'lucifera' | 'kael' | 'scarlet' | string;
export type TierType = 'free' | 'adept' | 'sovereign';

export interface DocumentSection {
  id: string;
  text: string;
  type: 'paragraph' | 'heading' | 'quote' | 'poetry';
  isPending?: boolean;
  annotation?: string; // Optional margin-comment / lore note
}

export interface DocumentState {
  id: string;
  title: string;
  sections: DocumentSection[];
  createdAt: string;
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  content: string; // Base64 or plain text depending on mimeType
  isImage: boolean;
}

export interface ActiveSuggestion {
  id: string;
  sectionId: string;
  originalText: string;
  suggestedText: string;
  feedback: string; // The "why" from Ember Ur or Guardian Oracle
  voice: VoiceType;
  type: 'rewrite' | 'proactive_feedback';
}

export interface TarotCard {
  name: string;
  number: number;
  arcana: 'Major' | 'Minor';
  uprightKeywords: string[];
  reversedKeywords: string[];
  description: string;
  emberUrInterpretation: string;
  oracleInterpretation: string;
  iconName: string; // Lucide icon name or symbol
}

export interface TarotReading {
  spreadType: 'one_card' | 'three_card'; // Present Guidance or Past-Present-Future
  cards: {
    card: TarotCard;
    isReversed: boolean;
    positionLabel: string;
  }[];
  guidanceText: string;
  voice: VoiceType;
}

export interface AIHistoryItem {
  id: string;
  timestamp: string;
  prompt: string;
  response: string;
  voice: VoiceType;
  type: 'draft' | 'iteration' | 'tarot' | 'proactive';
}

export interface SeekerUser {
  name: string;
  email: string;
  photoUrl?: string;
  uid: string;
}


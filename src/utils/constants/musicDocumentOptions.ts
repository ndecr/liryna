import { MusicDocumentType } from "../types/musicDocument.types.ts";

export interface IDocumentTypeOption {
  value: MusicDocumentType;
  label: string;
}

export type IFilterTypeOption = { value: MusicDocumentType | ""; label: string };

export const DOCUMENT_TYPE_LABELS: Record<MusicDocumentType, string> = {
  partition: "Partition",
  grille_accords: "Grille d'accords",
  tab: "Tablature",
  paroles: "Paroles",
  theorie: "Théorie",
  autre: "Autre",
};

export const DOCUMENT_TYPE_OPTIONS: IDocumentTypeOption[] = Object.entries(
  DOCUMENT_TYPE_LABELS
).map(([value, label]) => ({ value: value as MusicDocumentType, label }));

export const FILTER_TYPE_OPTIONS: IFilterTypeOption[] = [
  { value: "", label: "Tous les types" },
  ...DOCUMENT_TYPE_OPTIONS,
];

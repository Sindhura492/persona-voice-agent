export type FaqPreviewEntry = {
  id: string;
  question_en: string;
  question_de: string;
  answer_en: string;
  answer_de: string;
  tags: string[];
};

export const SKI_FAQ_PREVIEW: readonly FaqPreviewEntry[] = [
  {
    id: "ski-1",
    question_en: "What time is mountain breakfast served?",
    question_de: "Wann wird das Bergfrühstück serviert?",
    answer_en:
      "House breakfast is served in the timber dining room from 7:00 to 10:30 AM, with a lighter alpine tray available from 6:30 for early lifts.",
    answer_de:
      "Das Hausfrühstück wird von 7:00 bis 10:30 Uhr im Holzspeisesaal serviert; ab 6:30 Uhr gibt es ein leichtes Alpen-Tablett für frühe Lifte.",
    tags: ["breakfast", "dining"],
  },
  {
    id: "ski-2",
    question_en: "How do lift passes work with my stay?",
    question_de: "Wie funktionieren Skipässe mit meinem Aufenthalt?",
    answer_en:
      "Lift passes can be bundled into your package or collected at the gondola desk with your room folio. We activate passes the evening before your first ski day.",
    answer_de:
      "Skipässe können im Paket enthalten sein oder an der Gondel mit Ihrer Zimmerrechnung abgeholt werden. Wir aktivieren sie am Abend vor Ihrem ersten Skitag.",
    tags: ["lift-pass", "ski"],
  },
  {
    id: "ski-3",
    question_en: "Can I store equipment overnight?",
    question_de: "Kann ich Ausrüstung über Nacht lagern?",
    answer_en:
      "Yes. Heated ski lockers are complimentary for all guests. Boot dryers and a tuning bench are available in the gear atelier until 9:00 PM.",
    answer_de:
      "Ja. Beheizte Skischränke sind für alle Gäste kostenfrei. Schuhtrockner und ein Wachstisch stehen bis 21:00 Uhr in der Ausrüstungswerkstatt bereit.",
    tags: ["gear", "lockers"],
  },
  {
    id: "ski-4",
    question_en: "What is the lesson cancellation policy?",
    question_de: "Wie lautet die Stornoregelung für Skistunden?",
    answer_en:
      "Lessons cancelled before 5:00 PM the prior day receive a full credit. Later cancellations are charged in full unless the school can fill the spot.",
    answer_de:
      "Stornierungen bis 17:00 Uhr am Vortag erhalten volle Gutschrift. Spätere Absagen werden voll berechnet, sofern der Platz nicht neu vergeben werden kann.",
    tags: ["lessons", "cancellation"],
  },
] as const;

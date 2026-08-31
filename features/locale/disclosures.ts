import type { Locale } from "./localeTypes";

export const GDPR_DISCLOSURE_EN =
  "Before you begin, please note: this call may be recorded and transcribed for quality and booking purposes. Any health-related information you share, for gear fitting or safety, is handled according to our data policy." as const;

export const GDPR_DISCLOSURE_DE =
  "Bevor Sie beginnen, weisen wir Sie darauf hin: Dieses Gespräch kann zu Qualitäts- und Buchungszwecken aufgezeichnet und transkribiert werden. Gesundheitsbezogene Angaben, die Sie uns mitteilen, etwa für die Ausrüstungsanprobe oder aus Sicherheitsgründen, behandeln wir gemäß unserer Datenschutzrichtlinie." as const;

export const MIC_DISCLOSURE_EN =
  "When you start the call, your browser will ask for microphone access. Choose Allow so the concierge can hear you." as const;

export const MIC_DISCLOSURE_DE =
  "Beim Start des Anrufs fragt Ihr Browser nach Mikrofonzugriff. Bitte wählen Sie Erlauben, damit der Concierge Sie hören kann." as const;

export const MIC_DISCLOSURES: Record<Locale, string> = {
  en: MIC_DISCLOSURE_EN,
  de: MIC_DISCLOSURE_DE,
};

export const GDPR_DISCLOSURES: Record<Locale, string> = {
  en: GDPR_DISCLOSURE_EN,
  de: GDPR_DISCLOSURE_DE,
};

export const SPOKEN_GDPR_EN =
  "Before we continue, please know this call may be recorded and transcribed for quality and booking purposes, and any health-related information you share, for gear fitting or safety, is handled according to our data policy." as const;

export const SPOKEN_GDPR_DE =
  "Bevor wir fortfahren, weisen wir Sie darauf hin, dass dieses Gespräch zu Qualitäts- und Buchungszwecken aufgezeichnet und transkribiert werden kann. Gesundheitsbezogene Angaben, die Sie uns mitteilen, etwa für die Ausrüstungsanprobe oder aus Sicherheitsgründen, behandeln wir gemäß unserer Datenschutzrichtlinie." as const;

export const HEADER_TALK_LABEL: Record<Locale, string> = {
  en: "Talk to us",
  de: "Sprechen Sie mit uns",
};

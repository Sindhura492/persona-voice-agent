-- Seed bilingual FAQ for Snowveil ski concierge
delete from public.faq_entries;

insert into public.faq_entries (
  question_en,
  question_de,
  answer_en,
  answer_de,
  tags
) values
(
  'What is your booking policy?',
  'Wie lautet Ihre Buchungsrichtlinie?',
  'Packages are held as pending until our team confirms within one hour. A valid contact and arrival dates are required. Lift passes and lessons can be bundled at booking.',
  'Pakete bleiben bis zur Bestätigung durch unser Team (in der Regel innerhalb einer Stunde) ausstehend. Kontakt und Anreisedaten sind erforderlich. Skipass und Unterricht können bei der Buchung ergänzt werden.',
  array['booking', 'policy']
),
(
  'How do weather-related cancellations work?',
  'Wie funktionieren wetterbedingte Stornierungen?',
  'If the resort closes lifts due to weather, cancellations are fee-free. Guest-choice cancellations may incur a EUR 150 administrative fee; weather-related cancellations waive all fees.',
  'Schließt das Resort die Lifte wetterbedingt, sind Stornierungen gebührenfrei. Stornierungen auf Wunsch des Gastes können eine Bearbeitungsgebühr von EUR 150 nach sich ziehen; wetterbedingte Stornierungen sind gebührenfrei.',
  array['cancellation', 'weather', 'policy']
),
(
  'How does gear rental and fitting work?',
  'Wie funktionieren Ausrüstungsverleih und Anprobe?',
  'Share your height, EU boot size, and skill level during your call or at the gear atelier. Equipment is staged before your first ski day. Heated lockers are complimentary overnight.',
  'Teilen Sie Größe, EU-Schuhgröße und Niveau im Gespräch oder in der Ausrüstungswerkstatt mit. Die Ausrüstung wird vor Ihrem ersten Skitag bereitgestellt. Beheizte Schränke über Nacht sind inklusive.',
  array['gear', 'rental', 'fitting']
),
(
  'What about lift passes and the loyalty program?',
  'Wie funktionieren Skipass und Treueprogramm?',
  'Lift passes can be added to your package or collected at the gondola desk. Summit Circle loyalty earns points on stays and qualifying lessons; check or redeem points through the voice concierge.',
  'Skipässe können ins Paket aufgenommen oder an der Gondel abgeholt werden. Summit Circle sammelt Punkte für Aufenthalte und qualifizierte Kurse; Punkte prüfen oder einlösen über den Sprach-Concierge.',
  array['lift-pass', 'loyalty']
),
(
  'What ski school levels do you offer?',
  'Welche Skischulniveaus bieten Sie an?',
  'Lessons are grouped as beginner, intermediate, and advanced. If a class is full, you may join a waitlist for your preferred date and level, we notify you when a spot opens.',
  'Unterricht ist in Anfänger-, Mittel- und Fortgeschrittenenniveau gruppiert. Ist ein Kurs voll, können Sie sich für Datum und Niveau auf die Warteliste setzen lassen, wir melden uns bei freiem Platz.',
  array['ski-school', 'lessons', 'levels']
),
(
  'What should I bring for my stay?',
  'Was soll ich für den Aufenthalt mitbringen?',
  'Pack base layers, goggles, sunscreen, and après attire. We provide robes and slippers in-room; ski outerwear is available through rental if you prefer to travel light.',
  'Packen Sie Unterwäsche, Brille, Sonnenschutz und Après-Bekleidung. Bademantel und Hausschuhe liegen im Zimmer; Skioberbekleidung gibt es bei Bedarf im Verleih.',
  array['packing', 'essentials']
),
(
  'Is the property accessible?',
  'Ist das Haus barrierefrei?',
  'Step-free paths connect the lobby, dining room, and main gondola plaza. Accessible rooms and pool chair access are available, share needs when booking so we can prepare your stay.',
  'Stufenfreie Wege verbinden Lobby, Restaurant und Gondelplaza. Barrierefreie Zimmer und Poolzugang sind verfügbar, teilen Sie Bedürfnisse bei der Buchung mit, damit wir vorbereiten können.',
  array['accessibility', 'mobility']
),
(
  'How is my personal data handled on a voice call?',
  'Wie werden meine Daten in einem Sprachgespräch behandelt?',
  'Calls may be recorded and transcribed for quality and booking. Health-related details for gear or safety are handled under our data policy; injury or medical topics are escalated to a human specialist immediately.',
  'Gespräche können zu Qualitäts- und Buchungszwecken aufgezeichnet werden. Gesundheitsbezogene Angaben für Ausrüstung oder Sicherheit behandeln wir gemäß unserer Datenschutzrichtlinie; medizinische Themen leiten wir sofort an einen Spezialisten weiter.',
  array['privacy', 'gdpr', 'data']
);

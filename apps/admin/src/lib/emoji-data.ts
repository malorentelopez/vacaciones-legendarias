export interface EmojiOption {
  emoji: string;
  keywords: string[];
}

/** Emojis frecuentes en agendas infantiles, con palabras clave en español para búsqueda */
export const EMOJI_OPTIONS: EmojiOption[] = [
  { emoji: "🚶", keywords: ["paseo", "caminar", "walk", "andar"] },
  { emoji: "🏃", keywords: ["correr", "deporte", "ejercicio", "run"] },
  { emoji: "🚴", keywords: ["bici", "bicicleta", "ciclismo", "bike"] },
  { emoji: "🏊", keywords: ["nadar", "piscina", "swim"] },
  { emoji: "⚽", keywords: ["fútbol", "futbol", "balón", "deporte"] },
  { emoji: "🏀", keywords: ["baloncesto", "basket", "deporte"] },
  { emoji: "🎾", keywords: ["tenis", "deporte", "raqueta"] },
  { emoji: "🤸", keywords: ["gimnasia", "deporte", "ejercicio"] },
  { emoji: "🧘", keywords: ["yoga", "relajación", "calma", "meditación"] },
  { emoji: "🥋", keywords: ["karate", "artes marciales", "deporte"] },

  { emoji: "🍳", keywords: ["desayuno", "cocinar", "comida", "huevo"] },
  { emoji: "🥐", keywords: ["desayuno", "pan", "comida"] },
  { emoji: "🍎", keywords: ["fruta", "manzana", "comida", "snack"] },
  { emoji: "🥪", keywords: ["comida", "bocadillo", "almuerzo"] },
  { emoji: "🍽️", keywords: ["comer", "comida", "almuerzo", "cena"] },
  { emoji: "🧃", keywords: ["bebida", "zumo", "merienda"] },
  { emoji: "🍪", keywords: ["merienda", "galleta", "snack"] },
  { emoji: "🍕", keywords: ["pizza", "comida", "cena"] },

  { emoji: "🪥", keywords: ["aseo", "dientes", "higiene", "lavarse"] },
  { emoji: "🚿", keywords: ["ducha", "baño", "aseo", "higiene"] },
  { emoji: "🛁", keywords: ["baño", "aseo", "higiene"] },
  { emoji: "🧼", keywords: ["lavarse", "jabón", "higiene", "manos"] },
  { emoji: "💇", keywords: ["pelo", "peinado", "aseo"] },

  { emoji: "🛏️", keywords: ["cama", "dormir", "habitación", "orden"] },
  { emoji: "🧹", keywords: ["limpiar", "tareas", "casa", "orden"] },
  { emoji: "🧺", keywords: ["ropa", "lavar", "tareas", "casa"] },
  { emoji: "🗑️", keywords: ["basura", "limpiar", "tareas", "casa"] },
  { emoji: "🏠", keywords: ["casa", "hogar", "tareas"] },
  { emoji: "🧸", keywords: ["juguetes", "habitación", "orden"] },

  { emoji: "📚", keywords: ["lectura", "leer", "libro", "estudio"] },
  { emoji: "📖", keywords: ["leer", "libro", "lectura", "estudio"] },
  { emoji: "✏️", keywords: ["escribir", "deberes", "estudio", "lápiz"] },
  { emoji: "📝", keywords: ["deberes", "escribir", "estudio", "notas"] },
  { emoji: "🔤", keywords: ["letras", "alfabeto", "idiomas", "francés", "inglés"] },
  { emoji: "🇫🇷", keywords: ["francés", "frances", "idioma", "francia"] },
  { emoji: "🇬🇧", keywords: ["inglés", "ingles", "idioma"] },
  { emoji: "🧮", keywords: ["matemáticas", "números", "estudio"] },
  { emoji: "🔬", keywords: ["ciencia", "experimento", "estudio"] },
  { emoji: "🌍", keywords: ["geografía", "mundo", "estudio"] },
  { emoji: "💻", keywords: ["ordenador", "informática", "pantalla", "estudio"] },

  { emoji: "🎨", keywords: ["dibujo", "pintar", "creatividad", "arte", "manga"] },
  { emoji: "🖌️", keywords: ["pintar", "arte", "creatividad"] },
  { emoji: "✂️", keywords: ["manualidades", "recortar", "creatividad"] },
  { emoji: "🎭", keywords: ["teatro", "creatividad", "actuar"] },
  { emoji: "🎵", keywords: ["música", "canción", "escuchar"] },
  { emoji: "🎸", keywords: ["música", "guitarra", "instrumento"] },
  { emoji: "🎹", keywords: ["música", "piano", "instrumento"] },
  { emoji: "🎬", keywords: ["película", "vídeo", "cine"] },

  { emoji: "🌅", keywords: ["mañana", "amanecer", "despertar"] },
  { emoji: "☀️", keywords: ["sol", "mañana", "día"] },
  { emoji: "🌙", keywords: ["noche", "dormir", "tarde"] },
  { emoji: "⏰", keywords: ["hora", "reloj", "tiempo", "despertar"] },
  { emoji: "⏳", keywords: ["tiempo", "espera", "descanso"] },
  { emoji: "😴", keywords: ["descanso", "siesta", "dormir"] },
  { emoji: "☕", keywords: ["descanso", "pausa", "merienda"] },

  { emoji: "🌳", keywords: ["naturaleza", "plantas", "parque", "paseo"] },
  { emoji: "🌸", keywords: ["flores", "plantas", "naturaleza"] },
  { emoji: "🐕", keywords: ["perro", "mascota", "paseo"] },
  { emoji: "🐈", keywords: ["gato", "mascota"] },
  { emoji: "🦋", keywords: ["mariposa", "naturaleza", "insectos"] },

  { emoji: "👨‍👧", keywords: ["papá", "papa", "familia", "padre"] },
  { emoji: "👩‍👧", keywords: ["mamá", "mama", "familia", "madre"] },
  { emoji: "👨‍👩‍👧", keywords: ["familia", "padres"] },
  { emoji: "🤝", keywords: ["ayuda", "colaborar", "familia"] },
  { emoji: "💬", keywords: ["hablar", "conversar", "tema", "charla"] },
  { emoji: "📋", keywords: ["planificar", "lista", "organizar", "día"] },

  { emoji: "🎮", keywords: ["juego", "videojuego", "tiempo libre", "pantalla"] },
  { emoji: "📺", keywords: ["televisión", "pantalla", "tiempo libre"] },
  { emoji: "🧩", keywords: ["puzzle", "juego", "tiempo libre"] },
  { emoji: "🎲", keywords: ["juego", "mesa", "tiempo libre"] },
  { emoji: "🎁", keywords: ["regalo", "sorpresa", "recompensa"] },
  { emoji: "⭐", keywords: ["estrella", "logro", "recompensa"] },
  { emoji: "🏆", keywords: ["trofeo", "logro", "recompensa"] },
  { emoji: "✅", keywords: ["hecho", "completado", "tarea"] },
  { emoji: "🎯", keywords: ["objetivo", "meta", "misión"] },
];

export function normalizeSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function filterEmojis(query: string): EmojiOption[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return EMOJI_OPTIONS;

  return EMOJI_OPTIONS.filter(({ emoji, keywords }) =>
    keywords.some(
      (keyword) => keyword.includes(normalized) || normalized.includes(keyword)
    )
  );
}

export function isSingleEmoji(value: string): boolean {
  if (!value) return true;
  const segments = [...new Intl.Segmenter().segment(value)].map((s) => s.segment.trim()).filter(Boolean);
  if (segments.length !== 1) return false;
  return /\p{Extended_Pictographic}/u.test(segments[0]!);
}

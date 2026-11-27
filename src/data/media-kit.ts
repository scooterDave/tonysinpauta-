import { STATS } from './site';

/** Public numbers only. Never add the subscriber count, demographics or prices that Tony hasn't published. */
export const KIT_AS_OF = 'noviembre de 2026';

export const KIT_NUMBERS = [
  ...STATS.map((s) => ({ value: s.value, label: s.label })),
  { value: '+38 mil', label: 'vistas de la entrevista con Alfredo López, hermano de Frank Reyes' },
];

export const KIT_AUDIENCE = [
  { title: 'Desde Nueva York', text: 'El show se hace en Nueva York para la comunidad dominicana y latina, en español.' },
  { title: 'Bachata y merengue', text: 'Artistas, estrenos y farándula de la música dominicana, con entrevistas sin filtro.' },
  { title: 'En YouTube', text: 'Videos, en vivos y Shorts en el canal @tonysinpauta2888, que se ven en el teléfono, la computadora o la tele.' },
];

export const KIT_FORMATS = [
  {
    icon: 'mic',
    title: 'Entrevistas sin filtro',
    text: 'Conversaciones directas con figuras de la bachata y el merengue. Son lo más visto del canal.',
  },
  {
    icon: 'broadcast',
    title: 'Shows en vivo',
    text: 'Transmisiones de hora y media a tres horas, con mezclas del DJ, artistas invitados, karaoke y comentarios en vivo.',
  },
  { icon: 'music', title: 'Estrenos y promoción', text: 'Tony presenta temas y videos nuevos de artistas de bachata y merengue.' },
  { icon: 'disc', title: 'Mega mezclas', text: 'Mezclas del DJ con bachata y merengue para escuchar de corrido.' },
  {
    icon: 'play',
    title: 'Shorts y clips',
    text: 'Videos cortos sobre la música, la actualidad dominicana y negocios de la comunidad.',
  },
] as const;

export const KIT_PACKAGES = [
  {
    title: 'Anuncio o patrocinio',
    text: 'Tony presenta tu negocio o tu marca frente a la comunidad que sigue el show.',
    type: 'Anuncio o patrocinio',
  },
  {
    title: 'Video para tu negocio',
    text: 'Un video dedicado a tu restaurante, tienda o servicio, como los que Tony ya ha hecho para negocios de la comunidad.',
    type: 'Anuncio o patrocinio',
  },
  { title: 'Promoción musical', text: 'Tu tema o tu video nuevo presentado por Tony en el canal.', type: 'Promoción musical' },
  {
    title: 'Entrevista en el show',
    text: 'Una conversación sin filtro con Tony para contar tu carrera o tu proyecto.',
    type: 'Entrevista en el show',
  },
  {
    title: 'Host o DJ para tu evento',
    text: 'Tony anima o pone la música en fiestas, eventos y actividades.',
    type: 'Contratación (host o DJ)',
  },
] as const;

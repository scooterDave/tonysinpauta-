export const CHANNEL = {
  name: 'Tony Sin Pauta',
  tagline: 'Tu Show Nocturno',
  host: 'Tony González',
  handle: '@tonysinpauta2888',
  id: 'UCaLGIWWQ2pX-nJCvwbhYknQ',
  url: 'https://www.youtube.com/@tonysinpauta2888',
  videosUrl: 'https://www.youtube.com/@tonysinpauta2888/videos',
  streamsUrl: 'https://www.youtube.com/@tonysinpauta2888/streams',
  subscribeUrl: 'https://www.youtube.com/@tonysinpauta2888?sub_confirmation=1',
} as const;

/**
 * Sin Pauta TV player source: Tony's "tonysinpauta.com website" playlist (the `list=` value of its YouTube URL).
 * After changing it, run `npm run playlist:refresh`. The channel's automatic uploads playlist is `UUaLGIWWQ2pX-nJCvwbhYknQ`.
 */
export const SIN_PAUTA_TV_PLAYLIST_ID = 'PLDrx9JTRMM-A';

export interface ManualLive {
  /** Calendar date in New York, `YYYY-MM-DD`. */
  date: string;
  /** 24-hour start time in New York (America/New_York), `HH:MM`. */
  time: string;
  title: string;
  /** Defaults to 180 (the show runs 1.5–3 hours). */
  durationMinutes?: number;
  /** Where to watch; defaults to the channel's live tab. */
  url?: string;
}

/**
 * "Próximo en vivo" set by hand. Only shown when YouTube has no scheduled live for the channel,
 * and hidden on its own once it is over. Example:
 * { date: '2026-12-12', time: '21:00', title: 'Tony Sin Pauta en vivo: especial navideño' }
 */
export const PROXIMO_EN_VIVO: ManualLive | null = null;

/**
 * Public channel numbers as of 2026-11-25; written as floors so they stay true as the channel grows.
 * Small counts (subscribers, per-video views) stay off the site; only the totals that read as momentum are shown.
 */
export const STATS = [
  { value: '104K+', label: 'vistas' },
  { value: '246+', label: 'videos' },
  { value: 'Desde 2022', label: 'en YouTube' },
] as const;

const PHONE_DIGITS = '9145126681';

/** Booking email, shown on the site. Set to '' to hide it everywhere. */
const EMAIL = 'contacto@tonysinpauta.com';

/**
 * The inquiry form sends through FormSubmit (https://formsubmit.co, free, no account) only after its one-time
 * activation link, emailed to EMAIL, has been tapped. Until then it opens WhatsApp with the filled-in fields.
 * Activation steps: README → "Formulario de contacto".
 */
const FORM_ACTIVATED = false;

export const CONTACT = {
  phoneDisplay: '(914) 512-6681',
  phoneHref: `tel:+1${PHONE_DIGITS}`,
  whatsappNumber: `1${PHONE_DIGITS}`,
  whatsappHref: `https://wa.me/1${PHONE_DIGITS}?text=${encodeURIComponent('¡Saludos, Tony! Te escribo desde tonysinpauta.com.')}`,
  email: EMAIL,
  emailHref: EMAIL ? `mailto:${EMAIL}` : '',
  formEndpoint: EMAIL ? `https://formsubmit.co/ajax/${EMAIL}` : '',
  formActivated: FORM_ACTIVATED,
} as const;

export const NAV = [
  { href: '#videos', label: 'Videos' },
  { href: '#entrevistas', label: 'Entrevistas' },
  { href: '#sobre-tony', label: 'Sobre Tony' },
  { href: '#en-vivo', label: 'En vivo' },
  { href: '#contrataciones', label: 'Contrataciones' },
] as const;

/** Names taken from the channel's own uploads (interviews and artist promos). */
export const ON_THE_CHANNEL = [
  'Alfredo López',
  'L Manuel',
  'Daniel Monción',
  "Luis D' La Vega",
  'Luis Javier',
  'Jassiell',
  'Marino Arias',
  'Juan Ariel',
  'El Gringo de la Bachata',
  'Frank Martinez',
] as const;

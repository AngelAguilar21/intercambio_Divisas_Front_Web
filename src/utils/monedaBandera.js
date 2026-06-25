// País asociado a cada moneda soportada (estilo Wise: la moneda se identifica con la
// bandera real de su país, no con un color abstracto). Coincide 1:1 con los 27 países
// de US-001. Se usa el código ISO 3166-1 alpha-2 en minúsculas para pedir la imagen
// a flagcdn.com en vez de depender de la fuente de emoji del sistema (en Windows y
// en navegadores sin fuente de emoji a color, las banderas regionales no siempre
// se renderizan como gráfico y caen a las dos letras del código).
const PAIS_POR_MONEDA = {
  USD: 'us',
  EUR: 'de',
  GBP: 'gb',
  CHF: 'ch',
  JPY: 'jp',
  HKD: 'hk',
  CAD: 'ca',
  CNY: 'cn',
  AUD: 'au',
  RUB: 'ru',
  ARS: 'ar',
  BOB: 'bo',
  BRL: 'br',
  CLP: 'cl',
  COP: 'co',
  CRC: 'cr',
  CUP: 'cu',
  GTQ: 'gt',
  HNL: 'hn',
  MXN: 'mx',
  NIO: 'ni',
  PAB: 'pa',
  PYG: 'py',
  PEN: 'pe',
  DOP: 'do',
  UYU: 'uy',
  VES: 've',
}

export function paisPorMoneda(codigoIso = '') {
  return PAIS_POR_MONEDA[codigoIso.toUpperCase()] || null
}

export function urlBandera(codigoIso, anchoPx = 40) {
  const pais = paisPorMoneda(codigoIso)
  return pais ? `https://flagcdn.com/w${anchoPx}/${pais}.png` : null
}

// Relación país de residencia -> moneda principal, según US-009.
const MONEDA_POR_PAIS = {
  'Estados Unidos': 'USD',
  Alemania: 'EUR',
  'Reino Unido': 'GBP',
  Suiza: 'CHF',
  Japón: 'JPY',
  'Hong Kong': 'HKD',
  Canadá: 'CAD',
  China: 'CNY',
  Australia: 'AUD',
  Rusia: 'RUB',
  Argentina: 'ARS',
  Bolivia: 'BOB',
  Brasil: 'BRL',
  Chile: 'CLP',
  Colombia: 'COP',
  'Costa Rica': 'CRC',
  Cuba: 'CUP',
  Guatemala: 'GTQ',
  Honduras: 'HNL',
  México: 'MXN',
  Nicaragua: 'NIO',
  Panamá: 'PAB',
  Paraguay: 'PYG',
  Perú: 'PEN',
  'República Dominicana': 'DOP',
  Uruguay: 'UYU',
  Venezuela: 'VES',
}

export function monedaPorNombrePais(nombrePais = '') {
  return MONEDA_POR_PAIS[nombrePais] || null
}

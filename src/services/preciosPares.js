import { api } from '@/boot/axios'

export function getMenuPrincipal() {
  return api.get('/preciospares/menu-principal')
}

export function getListadoPares(filtro = {}) {
  return api.get('/preciospares', { params: filtro })
}

export function getSerieHistorica(monedaOrigen, monedaDestino, rango = 'UltimoDia') {
  return api.get(`/preciospares/serie/${monedaOrigen}/${monedaDestino}`, {
    params: { rango },
  })
}

export async function resolveParMonedaId(monedaEntregaIso, monedaObtieneIso) {
  const { data } = await getListadoPares({
    monedaEntrega: monedaEntregaIso,
    monedaObtiene: monedaObtieneIso,
    pagina: 1,
    registrosPorPagina: '10',
  })

  return data.registros?.[0]?.parMonedaId ?? null
}

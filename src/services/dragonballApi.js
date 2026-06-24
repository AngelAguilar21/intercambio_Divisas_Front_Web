import { api } from '@/boot/axios'

export async function fetchCharacters({ page = 1, limit = 12, name = '' } = {}) {
  const { data } = await api.get('/characters', {
    params: {
      page,
      limit,
      ...(name ? { name } : {}),
    },
  })

  // When filtering by name the API returns a plain array instead of a paginated object
  if (Array.isArray(data)) {
    return {
      items: data,
      meta: { currentPage: 1, totalPages: 1, totalItems: data.length },
    }
  }

  return data
}

export async function fetchCharacterById(id) {
  const { data } = await api.get(`/characters/${id}`)
  return data
}

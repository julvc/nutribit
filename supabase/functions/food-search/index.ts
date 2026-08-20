// Proxy a la búsqueda de Open Food Facts (search.openfoodfacts.org).
// Necesario porque ese servicio no envía Access-Control-Allow-Origin: el navegador
// bloquea la llamada directa desde el sitio estático. api/v2/search sí tiene CORS
// abierto pero ignora el parámetro de texto libre (deprecado, ver docs de OFF).
//
// Deploy: supabase functions deploy food-search --no-verify-jwt
// (o pegar este archivo en Dashboard -> Edge Functions -> New function)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const q = new URL(req.url).searchParams.get('q')?.trim()
  if (!q) {
    return new Response(JSON.stringify({ hits: [] }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const upstream = await fetch(
    `https://search.openfoodfacts.org/search?${new URLSearchParams({
      q,
      page_size: '10',
      langs: 'es',
      fields: 'product_name,nutriments,code',
    })}`,
    { headers: { 'User-Agent': 'NutriBit/0.1 (https://github.com/julvc/nutribit)' } }
  )

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})

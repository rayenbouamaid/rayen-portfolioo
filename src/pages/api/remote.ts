import type { APIRoute } from 'astro'
import crypto from 'crypto'

export const POST: APIRoute = async ({ request }) => {
  const { action } = await request.json()

  if (!action) {
    return new Response(JSON.stringify({ error: 'Missing action' }), { status: 400 })
  }

  const appId   = import.meta.env.PUSHER_APP_ID
  const key     = import.meta.env.PUSHER_KEY
  const secret  = import.meta.env.PUSHER_SECRET
  const cluster = import.meta.env.PUSHER_CLUSTER

  const body      = JSON.stringify({ name: 'control', channel: 'portfolio-remote', data: JSON.stringify({ action }) })
  const timestamp = Math.floor(Date.now() / 1000)
  const md5Body   = crypto.createHash('md5').update(body).digest('hex')
  const path      = `/apps/${appId}/events`

  const queryParams = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${md5Body}`
  const toSign      = `POST\n${path}\n${queryParams}`
  const signature   = crypto.createHmac('sha256', secret).update(toSign).digest('hex')

  const url = `https://api-${cluster}.pusher.com${path}?${queryParams}&auth_signature=${signature}`

  const pusherRes  = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  await pusherRes.text()

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
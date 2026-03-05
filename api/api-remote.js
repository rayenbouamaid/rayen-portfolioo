import Pusher from 'pusher'

const pusher = new Pusher({
  appId:   process.env.PUSHER_APP_ID,
  key:     process.env.PUSHER_KEY,
  secret:  process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS:  true,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action } = req.body

  if (!action) {
    return res.status(400).json({ error: 'Missing action' })
  }

  await pusher.trigger('portfolio-remote', 'control', { action })

  return res.status(200).json({ ok: true })
}

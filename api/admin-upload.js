import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (req.headers['x-admin-pin'] !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { fileData, fileType, fileName } = req.body
  if (!fileData || !fileName) return res.status(400).json({ error: 'Missing file data' })

  await supabase.storage.createBucket('menu-images', { public: true }).catch(() => {})

  const buffer = Buffer.from(fileData, 'base64')
  const { error } = await supabase.storage
    .from('menu-images')
    .upload(fileName, buffer, { contentType: fileType || 'image/jpeg', upsert: true })

  if (error) return res.status(500).json({ error: error.message })

  const url = `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/menu-images/${fileName}`
  return res.status(200).json({ url })
}

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useLiff } from '../context/LiffContext'

export default function SlipUploadPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { lineUserId } = useLiff()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file || !orderId) return
    setUploading(true)
    setError('')
    try {
      const fileName = `${orderId}_${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('slips')
        .upload(fileName, file, { contentType: file.type, upsert: true })
      if (uploadError) throw uploadError

      const slipUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/slips/${fileName}`

      await fetch('/api/slip-received', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, lineUserId, slipUrl }),
      })
      setDone(true)
    } catch (err) {
      console.error('slip upload error:', err)
      setError(`เกิดข้อผิดพลาด: ${err.message || JSON.stringify(err)}`)
    } finally {
      setUploading(false)
    }
  }

  if (done) {
    return (
      <div className="slip-done">
        <p className="slip-done-icon">✅</p>
        <h2>ส่งสลิปเรียบร้อย!</h2>
        <p>รอเจ้าของร้านยืนยันการชำระเงินครับ</p>
      </div>
    )
  }

  return (
    <div className="slip-page">
      <div className="slip-header">
        <h2>📸 แนบสลิปการโอนเงิน</h2>
        <p>กรุณาแนบรูปสลิปเพื่อยืนยันการชำระเงิน</p>
      </div>
      <form className="slip-form" onSubmit={handleSubmit}>
        <label className="slip-file-label">
          {preview ? (
            <img src={preview} alt="slip preview" className="slip-preview" />
          ) : (
            <div className="slip-placeholder">
              <span>📷</span>
              <p>กดเพื่อเลือกรูปสลิป</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={!file || uploading}>
          {uploading ? 'กำลังส่ง...' : 'ส่งสลิป'}
        </button>
      </form>
    </div>
  )
}

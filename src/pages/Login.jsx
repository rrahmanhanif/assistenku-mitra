import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Simpan session MITRA (bukan customer)
    localStorage.setItem('mitra_session', data.session.access_token)

    // Redirect ke dashboard mitra
    window.location.href = '/'
  }

  return (
    <div className="flex h-screen justify-center items-center bg-blue-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">
          Assistenku Mitra
        </h2>

        <input
          type="email"
          placeholder="Email Mitra"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          required
        />

        <input
          type="password"
          placeholder="Kata Sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Masuk...' : 'Masuk'}
        </button>

        {/* Tombol daftar mitra */}
        <p
          className="text-blue-600 text-center mt-4 cursor-pointer"
          onClick={() => (window.location.href = '/register')}
        >
          Belum punya akun? Daftar Mitra
        </p>
      </form>
    </div>
  )
}

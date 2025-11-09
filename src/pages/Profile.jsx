import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Header from '../components/Header'

export default function Profile() {
  const [customer, setCustomer] = useState(null)

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('customers').select('*').eq('email', user.email).single()
    setCustomer(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('customer_session')
    window.location.href = '/login'
  }

  return (
    <div>
      <Header name={customer?.name} />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">Profil Saya</h2>
        <p><b>Nama:</b> {customer?.name}</p>
        <p><b>Email:</b> {customer?.email}</p>
        <p><b>Status:</b> {customer?.status}</p>
        <button onClick={handleLogout} className="bg-red-600 text-white mt-4 px-4 py-2 rounded">
          Keluar
        </button>
      </div>
    </div>
  )
}

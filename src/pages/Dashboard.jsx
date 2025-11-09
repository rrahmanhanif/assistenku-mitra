import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Header from '../components/Header'
import DashboardCard from '../components/DashboardCard'
import NotificationCard from '../components/NotificationCard'

export default function Dashboard() {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomer()
  }, [])

  const fetchCustomer = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }
    const { data } = await supabase.from('customers').select('*').eq('email', user.email).single()
    setCustomer(data)
    setLoading(false)
  }

  if (loading) return <div className="text-center mt-20">Memuat...</div>

  return (
    <div>
      <Header name={customer?.name} />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Saldo" value={`Rp ${customer?.balance || 0}`} />
        <DashboardCard title="Pesanan Aktif" value={customer?.active_orders || 0} />
        <DashboardCard title="Notifikasi" value={customer?.notifications?.length || 0} />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-3 text-blue-700">Notifikasi Terbaru</h3>
        {customer?.notifications?.length > 0 ? (
          customer.notifications.map((note, idx) => (
            <NotificationCard key={idx} text={note} />
          ))
        ) : (
          <p className="text-gray-500">Tidak ada notifikasi.</p>
        )}
      </div>
    </div>
  )
}

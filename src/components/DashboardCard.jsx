import React from 'react'

export default function DashboardCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md text-center">
      <h4 className="text-blue-600 font-medium mb-2">{title}</h4>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}

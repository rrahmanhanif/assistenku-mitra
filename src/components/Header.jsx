import React from 'react'
import { Link } from 'react-router-dom'

export default function Header({ name }) {
  return (
    <div className="flex justify-between items-center bg-blue-600 text-white px-6 py-3 shadow">
      <h1 className="text-xl font-semibold">Assistenku Customer</h1>
      <div>
        <span className="mr-4">Halo, {name}</span>
        <Link to="/profile" className="underline">Profil</Link>
      </div>
    </div>
  )
}

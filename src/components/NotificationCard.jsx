import React from 'react'

export default function NotificationCard({ text }) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-2">
      <p>{text}</p>
    </div>
  )
}

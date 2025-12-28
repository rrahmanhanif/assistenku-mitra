import React from "react";

export default function LocationRationaleDialog({ onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-xl font-bold">
          Izin lokasi diperlukan
        </h2>

        <p className="mb-3 text-gray-700">
          Kami menggunakan lokasi perangkat Anda (termasuk pembaruan di latar
          belakang) untuk menampilkan status mitra secara realtime dan
          mengirimkan pesanan terdekat. Data lokasi disimpan secara aman dan
          hanya digunakan untuk kebutuhan operasional.
        </p>

        <p className="mb-4 text-gray-700">
          Layar ini adalah penjelasan sebelum dialog izin sistem muncul.
          Pastikan Anda memahami penggunaan lokasi sebelum menekan
          &quot;Lanjutkan&quot; pada dialog perizinan berikutnya.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onDecline}
            className="rounded border border-gray-300 px-4 py-2 text-gray-700"
          >
            Nanti saja
          </button>

          <button
            type="button"
            onClick={onAccept}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Lanjutkan &amp; Beri Izin
          </button>
        </div>
      </div>
    </div>
  );
}

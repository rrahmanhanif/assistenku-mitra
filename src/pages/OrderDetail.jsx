import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ChatRoom from "../components/ChatRoom";

<ChatRoom orderId={orderId} mitraName={mitraName} />

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  const loadOrder = async () => {
    const { data } = await supabase.from("orders").select("*").eq("id", id).single();
    setOrder(data);
  };

  const updateStatus = async (newStatus) => {
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    loadOrder();
  };

  useEffect(() => {
    loadOrder();
  }, []);

  if (!order) return <div>Memuat...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-blue-600">Detail Order</h1>

      <p className="mt-4"><b>ID:</b> {order.id}</p>
      <p><b>Status:</b> {order.status}</p>

      <button onClick={() => updateStatus("dalam_perjalanan")} className="mt-4 p-2 bg-blue-500 text-white rounded">
        Dalam Perjalanan
      </button>

      <button onClick={() => updateStatus("selesai")} className="mt-4 p-2 bg-green-500 text-white rounded">
        Selesai
      </button>
    </div>
  );
}

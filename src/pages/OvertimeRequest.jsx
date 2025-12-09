import { requestOvertime } from "../lib/overtime";
import { useParams } from "react-router-dom";

export default function OvertimeRequest() {
  const { orderId } = useParams();

  async function ajukan() {
    await requestOvertime(orderId, order.customer_id, order.mitra_id, 15);
    alert("Overtime diajukan!");
  }

  return (
    <div>
      <h2>Ajukan Overtime</h2>
      <button onClick={ajukan}>+15 Menit</button>
    </div>
  );
}

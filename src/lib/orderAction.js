// src/lib/orderAction.js
import { supabase } from "./supabase";

// Mitra menerima pesanan
export async function acceptOrder(orderId) {
  return await supabase
    .from("orders")
    .update({ status: "mitra_accepted" })
    .eq("id", orderId);
}

// Mitra menuju lokasi customer
export async function goingToCustomer(orderId) {
  return await supabase
    .from("orders")
    .update({ status: "on_the_way" })
    .eq("id", orderId);
}

// Mitra mulai pekerjaan
export async function startWork(orderId) {
  return await supabase
    .from("orders")
    .update({ status: "working" })
    .eq("id", orderId);
}

// Mitra selesai pekerjaan
export async function finishWork(orderId) {
  return await supabase
    .from("orders")
    .update({ status: "completed" })
    .eq("id", orderId);
}

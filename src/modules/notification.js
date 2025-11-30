import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vptfubypmfafrnmwweyj.supabase.co",
  "YOUR_ANON_KEY"
);

// callback akan dipanggil ketika ada pesan masuk dari customer
export function listenMitraNotification(mitraId, callback) {
  return supabase
    .channel(`notif-mitra-${mitraId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `sender=eq.customer`
      },
      (payload) => {
        callback({
          order_id: payload.new.order_id,
          message: payload.new.message,
          sender: payload.new.sender
        });
      }
    )
    .subscribe();
}

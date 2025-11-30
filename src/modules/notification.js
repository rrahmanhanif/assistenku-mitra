import { createClient } from "@supabase/supabase-js";
import { setBadgeUnread } from "./badge";

const supabase = createClient(
  "https://vptfubypmfafrnmwweyj.supabase.co",
  "YOUR_ANON_KEY"
);

// callback akan dipanggil ketika ada pesan masuk dari customer
callback({
  order_id: payload.new.order_id,
  message: payload.new.message
});

// Tambahkan badge merah
setBadgeUnread(payload.new.order_id);
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

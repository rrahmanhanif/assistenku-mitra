 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/lib/mitraAPI.js b/src/lib/mitraAPI.js
index 9a8a44ecec0dc6fb9fe9cf25cc820e4ecbf7e697..f6a435fd53e2a1e7c39197dc50a180a7e307957b 100644
--- a/src/lib/mitraAPI.js
+++ b/src/lib/mitraAPI.js
@@ -1,22 +1,20 @@
-import { createClient } from "@supabase/supabase-js";
-const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
-const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
-export const supabaseMitra = createClient(supabaseUrl, supabaseKey);
+import { request } from "../shared/httpClient";
 
 export async function updateMitraLocation(mitraId, latitude, longitude) {
-  return supabaseMitra
-    .from("mitra_location")
-    .upsert({
+  return request("/api/mitra/location", {
+    method: "POST",
+    body: {
       mitra_id: mitraId,
       latitude,
       longitude,
-      updated_at: new Date().toISOString()
-    });
+      updated_at: new Date().toISOString(),
+    },
+  });
 }
 
 export async function updateOrderStatus(orderId, status) {
-  return supabaseMitra
-    .from("orders")
-    .update({ status })
-    .eq("id", orderId);
+  return request(`/api/mitra/orders/${orderId}/status`, {
+    method: "POST",
+    body: { status },
+  });
 }
 
EOF
)

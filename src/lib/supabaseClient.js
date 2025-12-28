 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/lib/supabaseClient.js b/src/lib/supabaseClient.js
index 41cd23eea543832e6c7a6d158b2ce7801954def7..c764c5af4e1042b0aeb34cf865952e582c1975fa 100644
--- a/src/lib/supabaseClient.js
+++ b/src/lib/supabaseClient.js
@@ -1,8 +1,9 @@
 import { createClient } from "@supabase/supabase-js";
 
 const supabase = createClient(
   import.meta.env.VITE_SUPABASE_URL,
   import.meta.env.VITE_SUPABASE_ANON_KEY
 );
 
+export { supabase };
 export default supabase;
 
EOF
)

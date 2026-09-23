/* =========================================================
   DÉA CESTAS
   SUPABASE.JS
   Configuração compartilhada do Supabase
========================================================= */

const SUPABASE_URL =
    "https://gelokhnkkhqhlnixarxx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_B6x80W4vx--vzzwNtx6tvQ_oc5Mg9q8";


const DEA_CONFIG = {
    tabelaProdutos: "produtos",
    tabelaAdministradores: "administradores",
    bucketProdutos: "produtos"
};


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

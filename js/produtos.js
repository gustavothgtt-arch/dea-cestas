/* =========================================================
   DÉA CESTAS
   PRODUTOS.JS
   Camada de acesso aos produtos no Supabase
========================================================= */

(function () {

    const NOMES_CATEGORIAS = {
        cestas: "Cestas",
        canecas: "Canecas",
        copos: "Copos",
        lembrancas: "Lembranças"
    };


    /* =====================================================
       NORMALIZAÇÃO
       Mantém os dados do Supabase prontos para uso no site,
       carrinho e registro dos pedidos.
    ===================================================== */

    function normalizarProduto(produto) {

        if (!produto) {
            return null;
        }


        const fotos =
            Array.isArray(produto.fotos)
                ? produto.fotos.filter(Boolean)
                : [];


        const fotoPrincipal =
            fotos.length > 0
                ? fotos[0]
                : "imagens/logo-dea-cestas.png";


        return {

            id: produto.id,

            nome:
                produto.nome || "",

            categoria:
                produto.categoria || "",

            categoriaNome:
                NOMES_CATEGORIAS[produto.categoria] ||
                produto.categoria ||
                "Produto",

            preco:
                Number(produto.preco) || 0,

            descricaoCurta:
                produto.descricao_curta || "",

            descricao:
                produto.descricao || "",


            /* FOTO PRINCIPAL
               Esta propriedade também é usada pelo carrinho
               e pode ser salva como snapshot no pedido.
            */
            foto:
                fotoPrincipal,

            fotoPrincipal:
                fotoPrincipal,

            fotos:
                fotos,


            etiqueta:
                produto.etiqueta || "",

            personalizavel:
                produto.personalizavel === true,

            disponivel:
                produto.disponivel !== false,

            destaque:
                produto.destaque === true

        };

    }


    /* =====================================================
       BUSCAR PRODUTOS DISPONÍVEIS
    ===================================================== */

    async function buscarProdutos() {

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {
            throw new Error(
                "A conexão com o Supabase não foi inicializada."
            );
        }


        const {
            data,
            error
        } = await supabaseClient
            .from(DEA_CONFIG.tabelaProdutos)
            .select("*")
            .eq("disponivel", true)
            .order("destaque", { ascending: false })
            .order("criado_em", { ascending: false });


        if (error) {
            console.error(
                "Erro ao buscar produtos:",
                error
            );

            throw error;
        }


        return Array.isArray(data)
            ? data
                .map(normalizarProduto)
                .filter(Boolean)
            : [];

    }


    /* =====================================================
       BUSCAR PRODUTO PELO ID
    ===================================================== */

    async function buscarProdutoPorId(id) {

        if (!id) {
            return null;
        }


        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {
            throw new Error(
                "A conexão com o Supabase não foi inicializada."
            );
        }


        const {
            data,
            error
        } = await supabaseClient
            .from(DEA_CONFIG.tabelaProdutos)
            .select("*")
            .eq("id", id)
            .eq("disponivel", true)
            .maybeSingle();


        if (error) {
            console.error(
                "Erro ao buscar produto:",
                error
            );

            throw error;
        }


        return data
            ? normalizarProduto(data)
            : null;

    }


    /* =====================================================
       FOTO DO PRODUTO
       Função auxiliar para carrinho/pedidos.
    ===================================================== */

    function obterFotoProduto(produto) {

        if (!produto) {
            return "imagens/logo-dea-cestas.png";
        }


        if (produto.foto) {
            return produto.foto;
        }


        if (produto.fotoPrincipal) {
            return produto.fotoPrincipal;
        }


        if (
            Array.isArray(produto.fotos) &&
            produto.fotos.length > 0
        ) {
            return produto.fotos[0];
        }


        return "imagens/logo-dea-cestas.png";

    }


    /* =====================================================
       EXPORTAÇÕES
    ===================================================== */

    window.buscarProdutos =
        buscarProdutos;

    window.buscarProdutoPorId =
        buscarProdutoPorId;

    window.normalizarProduto =
        normalizarProduto;

    window.obterFotoProduto =
        obterFotoProduto;

})();

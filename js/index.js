/* =========================================================
   DÉA CESTAS
   INDEX.JS
   Funcionalidades da página inicial
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       1. ELEMENTOS DA PÁGINA
    ===================================================== */

    const botaoMenuMobile =
        document.getElementById("botaoMenuMobile");

    const menuPrincipal =
        document.getElementById("menuPrincipal");

    const filtros =
        document.querySelectorAll(".filtro");

    const categorias =
        document.querySelectorAll(".categoria-card");

    const listaProdutos =
        document.getElementById("listaProdutos");

    const produtosVazio =
        document.getElementById("produtosVazio");

    const quantidadeCarrinho =
        document.getElementById("quantidadeCarrinho");


    let produtosCarregados = [];
    let filtroAtual = "todos";


    /* =====================================================
       2. MENU MOBILE
    ===================================================== */

    if (botaoMenuMobile && menuPrincipal) {

        botaoMenuMobile.addEventListener("click", () => {

            const menuAberto =
                menuPrincipal.classList.toggle("ativo");

            botaoMenuMobile.textContent =
                menuAberto ? "✕" : "☰";

            botaoMenuMobile.setAttribute(
                "aria-label",
                menuAberto
                    ? "Fechar menu"
                    : "Abrir menu"
            );

        });


        const linksMenu =
            menuPrincipal.querySelectorAll("a");

        linksMenu.forEach(link => {

            link.addEventListener("click", () => {

                menuPrincipal.classList.remove("ativo");

                botaoMenuMobile.textContent = "☰";

                botaoMenuMobile.setAttribute(
                    "aria-label",
                    "Abrir menu"
                );

            });

        });


        window.addEventListener("resize", () => {

            if (window.innerWidth > 768) {

                menuPrincipal.classList.remove("ativo");

                botaoMenuMobile.textContent = "☰";

                botaoMenuMobile.setAttribute(
                    "aria-label",
                    "Abrir menu"
                );

            }

        });

    }


    /* =====================================================
       3. FORMATAR PREÇO
    ===================================================== */

    function formatarPreco(valor) {

        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    /* =====================================================
       4. CRIAR CARD DE PRODUTO
    ===================================================== */

    function criarCardProduto(produto) {

        const card =
            document.createElement("article");

        card.className = "produto-card";


        const link =
            document.createElement("a");

        link.href =
            `produto.html?id=${encodeURIComponent(produto.id)}`;

        link.className =
            "produto-card-link";

        link.setAttribute(
            "aria-label",
            `Ver ${produto.nome}`
        );


        const areaImagem =
            document.createElement("div");

        areaImagem.className =
            "produto-imagem";


        const imagem =
            document.createElement("img");

        imagem.src =
            produto.foto ||
            "imagens/logo-dea-cestas.png";

        imagem.alt =
            produto.nome || "Produto Déa Cestas";

        imagem.loading = "lazy";


        areaImagem.appendChild(imagem);


        if (produto.etiqueta) {

            const etiqueta =
                document.createElement("span");

            etiqueta.className =
                "produto-etiqueta";

            etiqueta.textContent =
                produto.etiqueta;

            areaImagem.appendChild(etiqueta);

        }


        const info =
            document.createElement("div");

        info.className =
            "produto-info";


        const categoria =
            document.createElement("span");

        categoria.className =
            "produto-categoria";

        categoria.textContent =
            produto.categoriaNome ||
            produto.categoria ||
            "Produto";


        const nome =
            document.createElement("h3");

        nome.textContent =
            produto.nome;


        info.append(
            categoria,
            nome
        );


        if (produto.descricaoCurta) {

            const descricao =
                document.createElement("p");

            descricao.textContent =
                produto.descricaoCurta;

            info.appendChild(descricao);

        }


        const rodape =
            document.createElement("div");

        rodape.className =
            "produto-rodape";


        const preco =
            document.createElement("strong");

        preco.textContent =
            formatarPreco(produto.preco);


        const detalhes =
            document.createElement("span");

        detalhes.textContent =
            "Ver detalhes →";


        rodape.append(
            preco,
            detalhes
        );


        info.appendChild(rodape);


        link.append(
            areaImagem,
            info
        );


        card.appendChild(link);


        return card;

    }


    /* =====================================================
       5. ESTADO VAZIO
    ===================================================== */

    function mostrarEstadoVazio(
        titulo = "Nenhum produto encontrado",
        texto = "Não encontramos produtos nesta categoria no momento."
    ) {

        if (!produtosVazio) {
            return;
        }


        const tituloElemento =
            produtosVazio.querySelector("h3");

        const textoElemento =
            produtosVazio.querySelector("p");


        if (tituloElemento) {
            tituloElemento.textContent = titulo;
        }

        if (textoElemento) {
            textoElemento.textContent = texto;
        }


        produtosVazio.style.display = "flex";

    }


    /* =====================================================
       6. EXIBIR PRODUTOS
    ===================================================== */

    function exibirProdutos(filtro = "todos") {

        if (!listaProdutos) {
            return;
        }


        filtroAtual = filtro;


        const produtosFiltrados =
            filtro === "todos"
                ? produtosCarregados
                : produtosCarregados.filter(
                    produto =>
                        produto.categoria === filtro
                );


        listaProdutos.innerHTML = "";


        if (produtosFiltrados.length === 0) {

            mostrarEstadoVazio();

            return;

        }


        if (produtosVazio) {
            produtosVazio.style.display = "none";
        }


        produtosFiltrados.forEach(produto => {

            listaProdutos.appendChild(
                criarCardProduto(produto)
            );

        });

    }


    /* =====================================================
       7. CARREGAR PRODUTOS DO SUPABASE
    ===================================================== */

    async function carregarProdutosDaLoja() {

        if (!listaProdutos) {
            return;
        }


        listaProdutos.setAttribute(
            "aria-busy",
            "true"
        );


        try {

            produtosCarregados =
                await buscarProdutos();

            exibirProdutos(filtroAtual);

        } catch (erro) {

            console.error(
                "Não foi possível carregar os produtos:",
                erro
            );

            produtosCarregados = [];

            listaProdutos.innerHTML = "";

            mostrarEstadoVazio(
                "Não foi possível carregar os produtos",
                "Atualize a página em alguns instantes."
            );

        } finally {

            listaProdutos.removeAttribute(
                "aria-busy"
            );

        }

    }


    /* =====================================================
       8. FILTROS
    ===================================================== */

    function selecionarFiltro(categoria) {

        filtros.forEach(botao => {

            const ativo =
                botao.dataset.filtro === categoria;

            botao.classList.toggle(
                "ativo",
                ativo
            );

        });


        exibirProdutos(categoria);

    }


    filtros.forEach(botao => {

        botao.addEventListener("click", () => {

            const categoria =
                botao.dataset.filtro || "todos";

            selecionarFiltro(categoria);

        });

    });


    /* =====================================================
       9. CARDS DAS CATEGORIAS
    ===================================================== */

    categorias.forEach(card => {

        card.addEventListener("click", () => {

            const categoria =
                card.dataset.categoria;

            if (!categoria) {
                return;
            }


            selecionarFiltro(categoria);


            const secaoProdutos =
                document.getElementById("produtos");


            if (secaoProdutos) {

                secaoProdutos.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =====================================================
       10. CARRINHO
    ===================================================== */

    function obterCarrinho() {

        try {

            const carrinhoSalvo =
                localStorage.getItem(
                    "deaCestasCarrinho"
                );


            if (!carrinhoSalvo) {
                return [];
            }


            const carrinho =
                JSON.parse(carrinhoSalvo);


            return Array.isArray(carrinho)
                ? carrinho
                : [];

        } catch (erro) {

            console.error(
                "Não foi possível carregar o carrinho:",
                erro
            );

            return [];

        }

    }


    function atualizarQuantidadeCarrinho() {

        if (!quantidadeCarrinho) {
            return;
        }


        const carrinho =
            obterCarrinho();


        const quantidadeTotal =
            carrinho.reduce(
                (total, item) => {

                    const quantidade =
                        Number(item.quantidade) || 1;

                    return total + quantidade;

                },
                0
            );


        quantidadeCarrinho.textContent =
            quantidadeTotal;

    }


    /* =====================================================
       11. INICIALIZAÇÃO
    ===================================================== */

    atualizarQuantidadeCarrinho();

    await carregarProdutosDaLoja();

});

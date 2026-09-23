/* =========================================================
   DÉA CESTAS
   PRODUTO.JS
   Página de detalhes do produto
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       1. CONFIGURAÇÕES
    ===================================================== */

    const WHATSAPP_DEA = "5521991340051";


    /* =====================================================
       2. ELEMENTOS DA PÁGINA
    ===================================================== */

    const botaoMenuMobile =
        document.getElementById("botaoMenuMobile");

    const menuPrincipal =
        document.getElementById("menuPrincipal");


    const produtoDetalhe =
        document.getElementById("produtoDetalhe");

    const produtoNaoEncontrado =
        document.getElementById("produtoNaoEncontrado");


    const produtoImagemPrincipal =
        document.getElementById("produtoImagemPrincipal");

    const produtoMiniaturas =
        document.getElementById("produtoMiniaturas");

    const produtoEtiqueta =
        document.getElementById("produtoEtiqueta");

    const produtoCategoria =
        document.getElementById("produtoCategoria");

    const produtoNome =
        document.getElementById("produtoNome");

    const produtoDescricao =
        document.getElementById("produtoDescricao");

    const produtoPreco =
        document.getElementById("produtoPreco");

    const produtoPersonalizacao =
        document.getElementById("produtoPersonalizacao");


    const diminuirQuantidade =
        document.getElementById("diminuirQuantidade");

    const aumentarQuantidade =
        document.getElementById("aumentarQuantidade");

    const quantidadeProduto =
        document.getElementById("quantidadeProduto");


    const adicionarCarrinho =
        document.getElementById("adicionarCarrinho");

    const comprarWhatsApp =
        document.getElementById("comprarWhatsApp");

    const quantidadeCarrinho =
        document.getElementById("quantidadeCarrinho");


    /* =====================================================
       3. VARIÁVEIS
    ===================================================== */

    let produtoAtual = null;

    let quantidade = 1;


    /* =====================================================
       4. MENU MOBILE
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
       5. FORMATAR PREÇO
    ===================================================== */

    function formatarPreco(valor) {

        return Number(valor).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    /* =====================================================
       6. PEGAR ID DA URL
    ===================================================== */

    function obterIdProduto() {

        const parametros =
            new URLSearchParams(window.location.search);


        return parametros.get("id");

    }


    /* =====================================================
       7. LOCALIZAR PRODUTO
    ===================================================== */

    async function localizarProduto(id) {

        if (
            typeof buscarProdutoPorId !== "function"
        ) {
            throw new Error(
                "A função de consulta ao Supabase não foi carregada."
            );
        }


        return await buscarProdutoPorId(id);

    }


    /* =====================================================
       8. PRODUTO NÃO ENCONTRADO
    ===================================================== */

    function mostrarProdutoNaoEncontrado() {

        if (produtoDetalhe) {
            produtoDetalhe.hidden = true;
        }


        if (produtoNaoEncontrado) {
            produtoNaoEncontrado.hidden = false;
        }


        document.title =
            "Produto não encontrado | Déa Cestas";

    }


    /* =====================================================
       9. GALERIA DE FOTOS
    ===================================================== */

    function obterFotosProduto(produto) {

        const fotos = [];


        if (
            Array.isArray(produto.fotos) &&
            produto.fotos.length > 0
        ) {

            produto.fotos.forEach(foto => {

                if (
                    foto &&
                    !fotos.includes(foto)
                ) {
                    fotos.push(foto);
                }

            });

        }


        if (
            produto.foto &&
            !fotos.includes(produto.foto)
        ) {

            fotos.unshift(produto.foto);

        }


        return fotos;

    }


    function trocarImagemPrincipal(
        foto,
        botaoSelecionado = null
    ) {

        if (!produtoImagemPrincipal) {
            return;
        }


        produtoImagemPrincipal.src = foto;
        produtoImagemPrincipal.hidden = false;
        produtoImagemPrincipal.style.display = "block";


        const miniaturas =
            document.querySelectorAll(".produto-miniatura");


        miniaturas.forEach(botao => {

            botao.classList.remove("ativa");

        });


        if (botaoSelecionado) {

            botaoSelecionado.classList.add("ativa");

        }

    }


    function montarGaleria(produto) {

        const fotos =
            obterFotosProduto(produto);


        if (fotos.length === 0) {

            produtoImagemPrincipal.src =
                "imagens/logo-dea-cestas.png";

            produtoImagemPrincipal.alt =
                produto.nome;

            return;

        }


        produtoImagemPrincipal.src =
            fotos[0];

        produtoImagemPrincipal.alt =
            produto.nome;

        produtoImagemPrincipal.hidden = false;
        produtoImagemPrincipal.style.display = "block";


        produtoMiniaturas.innerHTML = "";


        fotos.forEach((foto, indice) => {

            const botao =
                document.createElement("button");


            botao.type = "button";

            botao.className =
                "produto-miniatura";


            if (indice === 0) {

                botao.classList.add("ativa");

            }


            botao.setAttribute(
                "aria-label",
                `Ver foto ${indice + 1} de ${produto.nome}`
            );


            const imagem =
                document.createElement("img");


            imagem.src = foto;

            imagem.alt =
                `${produto.nome} - foto ${indice + 1}`;


            botao.appendChild(imagem);


            botao.addEventListener("click", () => {

                trocarImagemPrincipal(
                    foto,
                    botao
                );

            });


            produtoMiniaturas.appendChild(botao);

        });


        /*
            Se existir apenas uma foto,
            não precisamos exibir a coluna
            de miniaturas.
        */

        if (fotos.length <= 1) {

            produtoMiniaturas.style.display = "none";

        } else {

            produtoMiniaturas.style.display = "";

        }

    }


    /* =====================================================
       10. WHATSAPP DO PRODUTO
    ===================================================== */

    function atualizarLinkWhatsApp() {

        if (
            !comprarWhatsApp ||
            !produtoAtual
        ) {
            return;
        }


        const mensagem =

`Olá! Vim pelo site da Déa Cestas.

Gostaria de saber mais sobre:

${produtoAtual.nome}

Quantidade: ${quantidade}
Valor unitário: ${formatarPreco(produtoAtual.preco)}
Valor total: ${formatarPreco(produtoAtual.preco * quantidade)}`;


        comprarWhatsApp.href =
            `https://wa.me/${WHATSAPP_DEA}?text=${encodeURIComponent(mensagem)}`;

    }


    /* =====================================================
       11. QUANTIDADE
    ===================================================== */

    function atualizarQuantidade() {

        if (quantidadeProduto) {

            quantidadeProduto.textContent =
                quantidade;

        }


        atualizarLinkWhatsApp();

    }


    if (diminuirQuantidade) {

        diminuirQuantidade.addEventListener(
            "click",
            () => {

                if (quantidade > 1) {

                    quantidade--;

                    atualizarQuantidade();

                }

            }
        );

    }


    if (aumentarQuantidade) {

        aumentarQuantidade.addEventListener(
            "click",
            () => {

                quantidade++;

                atualizarQuantidade();

            }
        );

    }


    /* =====================================================
       12. CARRINHO
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
                "Erro ao carregar carrinho:",
                erro
            );


            return [];

        }

    }


    function salvarCarrinho(carrinho) {

        localStorage.setItem(
            "deaCestasCarrinho",
            JSON.stringify(carrinho)
        );

    }


    function atualizarQuantidadeCarrinho() {

        if (!quantidadeCarrinho) {
            return;
        }


        const carrinho =
            obterCarrinho();


        const totalItens =
            carrinho.reduce(
                (total, item) => {

                    return total +
                        (Number(item.quantidade) || 1);

                },
                0
            );


        quantidadeCarrinho.textContent =
            totalItens;

    }


    function adicionarProdutoAoCarrinho() {

        if (!produtoAtual) {
            return;
        }


        const carrinho =
            obterCarrinho();


        const itemExistente =
            carrinho.find(item =>

                String(item.id) ===
                String(produtoAtual.id)

            );


        if (itemExistente) {

            itemExistente.quantidade =
                (Number(itemExistente.quantidade) || 1)
                + quantidade;

        } else {

            carrinho.push({

                id: produtoAtual.id,

                nome: produtoAtual.nome,

                preco: Number(
                    produtoAtual.preco
                ),

                foto:
                    produtoAtual.foto ||
                    (
                        Array.isArray(produtoAtual.fotos)
                            ? produtoAtual.fotos[0]
                            : ""
                    ),

                categoria:
                    produtoAtual.categoria,

                quantidade:
                    quantidade

            });

        }


        salvarCarrinho(carrinho);

        atualizarQuantidadeCarrinho();

        mostrarConfirmacaoCarrinho();

    }


    /* =====================================================
       13. CONFIRMAÇÃO DO CARRINHO
    ===================================================== */

    function mostrarConfirmacaoCarrinho() {

        if (!adicionarCarrinho) {
            return;
        }


        const textoOriginal =
            adicionarCarrinho.innerHTML;


        adicionarCarrinho.innerHTML =
            "✓ Adicionado ao carrinho";


        adicionarCarrinho.disabled = true;


        setTimeout(() => {

            adicionarCarrinho.innerHTML =
                textoOriginal;

            adicionarCarrinho.disabled =
                false;

        }, 1500);

    }


    if (adicionarCarrinho) {

        adicionarCarrinho.addEventListener(
            "click",
            adicionarProdutoAoCarrinho
        );

    }


    /* =====================================================
       14. EXIBIR PRODUTO
    ===================================================== */

    function exibirProduto(produto) {

        produtoAtual = produto;


        /* TÍTULO DA PÁGINA */

        document.title =
            `${produto.nome} | Déa Cestas`;


        /* CATEGORIA */

        produtoCategoria.textContent =
            produto.categoriaNome ||
            produto.categoria ||
            "Déa Cestas";


        /* NOME */

        produtoNome.textContent =
            produto.nome;


        /* DESCRIÇÃO */

        produtoDescricao.textContent =
            produto.descricao ||
            produto.descricaoCurta ||
            "";


        /* PREÇO */

        produtoPreco.textContent =
            formatarPreco(produto.preco);


        /* ETIQUETA */

        if (
            produto.etiqueta &&
            produto.etiqueta.trim() !== ""
        ) {

            produtoEtiqueta.textContent =
                produto.etiqueta;

            produtoEtiqueta.hidden =
                false;

        } else {

            produtoEtiqueta.hidden =
                true;

        }


        /* PERSONALIZAÇÃO */

        if (produto.personalizavel === true) {

            produtoPersonalizacao.hidden =
                false;

        } else {

            produtoPersonalizacao.hidden =
                true;

        }


        /* GALERIA */

        montarGaleria(produto);


        /* QUANTIDADE */

        quantidade = 1;

        atualizarQuantidade();

    }


    /* =====================================================
       15. INICIALIZAÇÃO
    ===================================================== */

    async function iniciarPagina() {

        atualizarQuantidadeCarrinho();


        const idProduto =
            obterIdProduto();


        if (!idProduto) {

            mostrarProdutoNaoEncontrado();

            return;

        }


        try {

            const produto =
                await localizarProduto(idProduto);


            if (!produto) {

                mostrarProdutoNaoEncontrado();

                return;

            }


            exibirProduto(produto);

        } catch (erro) {

            console.error(
                "Erro ao carregar produto:",
                erro
            );

            mostrarProdutoNaoEncontrado();

        }

    }


    await iniciarPagina();

});
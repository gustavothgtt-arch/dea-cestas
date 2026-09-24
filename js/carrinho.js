/* =========================================================
   DÉA CESTAS
   CARRINHO.JS
   Carrinho + criação de pedido no Supabase + WhatsApp
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const WHATSAPP_DEA = "5521991340051";
    const CHAVE_CARRINHO = "deaCestasCarrinho";


    const botaoMenuMobile =
        document.getElementById("botaoMenuMobile");

    const menuPrincipal =
        document.getElementById("menuPrincipal");

    const quantidadeCarrinho =
        document.getElementById("quantidadeCarrinho");

    const carrinhoConteudo =
        document.getElementById("carrinhoConteudo");

    const carrinhoVazio =
        document.getElementById("carrinhoVazio");

    const listaCarrinho =
        document.getElementById("listaCarrinho");

    const resumoQuantidade =
        document.getElementById("resumoQuantidade");

    const resumoSubtotal =
        document.getElementById("resumoSubtotal");

    const resumoTotal =
        document.getElementById("resumoTotal");

    const finalizarWhatsApp =
        document.getElementById("finalizarWhatsApp");

    const clienteNome =
        document.getElementById("clienteNome");

    const clienteTelefone =
        document.getElementById("clienteTelefone");

    const clienteObservacoes =
        document.getElementById("clienteObservacoes");

    const mensagemFinalizacao =
        document.getElementById("mensagemFinalizacao");


    let finalizandoPedido = false;


    /* =========================================================
       MENU MOBILE
    ========================================================= */

    if (botaoMenuMobile && menuPrincipal) {

        botaoMenuMobile.addEventListener("click", () => {

            const aberto =
                menuPrincipal.classList.toggle("ativo");

            botaoMenuMobile.textContent =
                aberto ? "✕" : "☰";

            botaoMenuMobile.setAttribute(
                "aria-label",
                aberto ? "Fechar menu" : "Abrir menu"
            );

        });


        menuPrincipal
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener("click", () => {

                    menuPrincipal.classList.remove("ativo");

                    botaoMenuMobile.textContent = "☰";

                });

            });


        window.addEventListener("resize", () => {

            if (window.innerWidth > 768) {

                menuPrincipal.classList.remove("ativo");

                botaoMenuMobile.textContent = "☰";

            }

        });

    }


    /* =========================================================
       UTILITÁRIOS
    ========================================================= */

    function formatarPreco(valor) {

        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    function obterCarrinho() {

        try {

            const salvo =
                localStorage.getItem(CHAVE_CARRINHO);

            if (!salvo) {
                return [];
            }

            const carrinho =
                JSON.parse(salvo);

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
            CHAVE_CARRINHO,
            JSON.stringify(carrinho)
        );

    }


    function quantidadeTotal(carrinho) {

        return carrinho.reduce(
            (total, item) =>
                total + (Number(item.quantidade) || 1),
            0
        );

    }


    function valorTotal(carrinho) {

        return carrinho.reduce(
            (total, item) => {

                const preco =
                    Number(item.preco) || 0;

                const quantidade =
                    Number(item.quantidade) || 1;

                return total + (preco * quantidade);

            },
            0
        );

    }


    function somenteNumeros(valor) {

        return String(valor || "")
            .replace(/\D/g, "");

    }


    function telefoneValido(valor) {

        const numeros =
            somenteNumeros(valor);

        return numeros.length >= 10 &&
               numeros.length <= 13;

    }


    function escaparHtml(valor) {

        return String(valor ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    function mostrarMensagem(texto, tipo = "erro") {

        if (!mensagemFinalizacao) {
            return;
        }

        mensagemFinalizacao.hidden = false;
        mensagemFinalizacao.textContent = texto;

        mensagemFinalizacao.classList.remove(
            "erro",
            "sucesso"
        );

        mensagemFinalizacao.classList.add(tipo);

    }


    function limparMensagem() {

        if (!mensagemFinalizacao) {
            return;
        }

        mensagemFinalizacao.hidden = true;
        mensagemFinalizacao.textContent = "";

        mensagemFinalizacao.classList.remove(
            "erro",
            "sucesso"
        );

    }


    function definirEstadoFinalizacao(carregando) {

        if (!finalizarWhatsApp) {
            return;
        }

        finalizarWhatsApp.disabled = carregando;

        finalizarWhatsApp.textContent =
            carregando
                ? "Registrando pedido..."
                : "Finalizar pelo WhatsApp";

    }


    /* =========================================================
       WHATSAPP
    ========================================================= */

    function criarLinkPublicoPedido(pedido) {

        if (
            !pedido ||
            !pedido.numero_pedido ||
            !pedido.token_publico
        ) {
            return "";
        }

        const url = new URL(
            "pedido.html",
            window.location.href
        );

        url.searchParams.set(
            "codigo",
            pedido.numero_pedido
        );

        url.searchParams.set(
            "token",
            pedido.token_publico
        );

        return url.toString();

    }


    function criarMensagemWhatsApp(
        carrinho,
        pedido,
        dadosCliente
    ) {

        const linhas = [
            "Olá! Vim pelo site da Déa Cestas 🌷",
            "",
            `*Pedido ${pedido.numero_pedido}*`,
            `👤 ${dadosCliente.nome}`,
            `📱 ${dadosCliente.telefone}`,
            ""
        ];


        carrinho.forEach((item, indice) => {

            const quantidade =
                Number(item.quantidade) || 1;

            const preco =
                Number(item.preco) || 0;

            const subtotal =
                preco * quantidade;


            if (carrinho.length > 1) {

                linhas.push(
                    `*${indice + 1}. ${item.nome}*`,
                    `${quantidade} un. × ${formatarPreco(preco)}`,
                    `Subtotal: ${formatarPreco(subtotal)}`,
                    ""
                );

            } else {

                linhas.push(
                    `*${item.nome}*`,
                    `${quantidade} un. × ${formatarPreco(preco)}`,
                    ""
                );

            }

        });


        linhas.push(
            `*Total: ${formatarPreco(pedido.total)}*`,
            ""
        );


        if (dadosCliente.observacoes) {

            linhas.push(
                "📝 *Observação:*",
                dadosCliente.observacoes,
                ""
            );

        }


        const linkPedido =
            criarLinkPublicoPedido(pedido);


        if (linkPedido) {

            linhas.push(
                "🔗 *Ver pedido completo:*",
                linkPedido,
                ""
            );

        }


        linhas.push(
            "Gostaria de combinar os detalhes do pedido, personalização e entrega. 😊"
        );


        return linhas.join("\n");

    }


    /* =========================================================
       CARD DO PRODUTO
    ========================================================= */

    function criarItemCarrinho(item) {

        const artigo =
            document.createElement("article");

        artigo.className =
            "carrinho-item";

        artigo.dataset.id =
            String(item.id);


        const imagemArea =
            document.createElement("a");

        imagemArea.className =
            "carrinho-item-imagem";

        imagemArea.href =
            `produto.html?id=${encodeURIComponent(item.id)}`;


        const imagem =
            document.createElement("img");

        imagem.src =
            item.foto || "imagens/logo-dea-cestas.png";

        imagem.alt =
            item.nome || "Produto Déa Cestas";

        imagem.loading = "lazy";


        imagemArea.appendChild(imagem);


        const info =
            document.createElement("div");

        info.className =
            "carrinho-item-info";


        const categoria =
            document.createElement("span");

        categoria.className =
            "carrinho-item-categoria";

        categoria.textContent =
            item.categoria || "Produto";


        const nome =
            document.createElement("a");

        nome.className =
            "carrinho-item-nome";

        nome.href =
            `produto.html?id=${encodeURIComponent(item.id)}`;

        nome.textContent =
            item.nome || "Produto";


        const preco =
            document.createElement("strong");

        preco.className =
            "carrinho-item-preco";

        preco.textContent =
            formatarPreco(item.preco);


        const controles =
            document.createElement("div");

        controles.className =
            "carrinho-item-controles";


        const quantidadeBox =
            document.createElement("div");

        quantidadeBox.className =
            "carrinho-quantidade";


        const diminuir =
            document.createElement("button");

        diminuir.type = "button";
        diminuir.textContent = "−";
        diminuir.dataset.acao = "diminuir";
        diminuir.setAttribute(
            "aria-label",
            `Diminuir quantidade de ${item.nome}`
        );


        const quantidade =
            document.createElement("span");

        quantidade.textContent =
            Number(item.quantidade) || 1;


        const aumentar =
            document.createElement("button");

        aumentar.type = "button";
        aumentar.textContent = "+";
        aumentar.dataset.acao = "aumentar";
        aumentar.setAttribute(
            "aria-label",
            `Aumentar quantidade de ${item.nome}`
        );


        quantidadeBox.append(
            diminuir,
            quantidade,
            aumentar
        );


        const remover =
            document.createElement("button");

        remover.type = "button";
        remover.className =
            "carrinho-remover";

        remover.dataset.acao =
            "remover";

        remover.textContent =
            "Remover";


        controles.append(
            quantidadeBox,
            remover
        );


        info.append(
            categoria,
            nome,
            preco,
            controles
        );


        const subtotal =
            document.createElement("div");

        subtotal.className =
            "carrinho-item-subtotal";


        const subtotalLabel =
            document.createElement("span");

        subtotalLabel.textContent =
            "Subtotal";


        const subtotalValor =
            document.createElement("strong");

        subtotalValor.textContent =
            formatarPreco(
                (Number(item.preco) || 0) *
                (Number(item.quantidade) || 1)
            );


        subtotal.append(
            subtotalLabel,
            subtotalValor
        );


        artigo.append(
            imagemArea,
            info,
            subtotal
        );


        return artigo;

    }


    /* =========================================================
       RENDERIZAÇÃO
    ========================================================= */

    function renderizarCarrinho() {

        const carrinho =
            obterCarrinho();


        const quantidade =
            quantidadeTotal(carrinho);

        const total =
            valorTotal(carrinho);


        if (quantidadeCarrinho) {

            quantidadeCarrinho.textContent =
                quantidade;

        }


        if (resumoQuantidade) {

            resumoQuantidade.textContent =
                quantidade === 1
                    ? "1 item"
                    : `${quantidade} itens`;

        }


        if (resumoSubtotal) {

            resumoSubtotal.textContent =
                formatarPreco(total);

        }


        if (resumoTotal) {

            resumoTotal.textContent =
                formatarPreco(total);

        }


        if (carrinho.length === 0) {

            if (carrinhoConteudo) {
                carrinhoConteudo.hidden = true;
            }

            if (carrinhoVazio) {
                carrinhoVazio.hidden = false;
            }

            return;

        }


        if (carrinhoConteudo) {
            carrinhoConteudo.hidden = false;
        }

        if (carrinhoVazio) {
            carrinhoVazio.hidden = true;
        }


        if (!listaCarrinho) {
            return;
        }


        listaCarrinho.innerHTML = "";


        carrinho.forEach(item => {

            listaCarrinho.appendChild(
                criarItemCarrinho(item)
            );

        });

    }


    /* =========================================================
       ALTERAÇÕES NO CARRINHO
    ========================================================= */

    function alterarQuantidade(id, diferenca) {

        const carrinho =
            obterCarrinho();


        const item =
            carrinho.find(
                produto =>
                    String(produto.id) === String(id)
            );


        if (!item) {
            return;
        }


        const atual =
            Number(item.quantidade) || 1;

        item.quantidade =
            Math.max(1, atual + diferenca);


        salvarCarrinho(carrinho);

        renderizarCarrinho();

    }


    function removerProduto(id) {

        const carrinho =
            obterCarrinho().filter(
                item =>
                    String(item.id) !== String(id)
            );


        salvarCarrinho(carrinho);

        renderizarCarrinho();

    }


    if (listaCarrinho) {

        listaCarrinho.addEventListener(
            "click",
            evento => {

                const botao =
                    evento.target.closest(
                        "button[data-acao]"
                    );


                if (!botao) {
                    return;
                }


                const item =
                    botao.closest(".carrinho-item");


                if (!item) {
                    return;
                }


                const id =
                    item.dataset.id;

                const acao =
                    botao.dataset.acao;


                if (acao === "diminuir") {

                    alterarQuantidade(id, -1);

                } else if (acao === "aumentar") {

                    alterarQuantidade(id, 1);

                } else if (acao === "remover") {

                    removerProduto(id);

                }

            }
        );

    }


    /* =========================================================
       CRIAÇÃO DO PEDIDO NO SUPABASE
    ========================================================= */

    async function criarPedidoNoSupabase(
        carrinho,
        dadosCliente
    ) {

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            throw new Error(
                "Não foi possível conectar ao sistema de pedidos."
            );

        }


        const itens =
            carrinho.map(item => ({
                produto_id: Number(item.id),
                quantidade:
                    Math.max(
                        1,
                        Number(item.quantidade) || 1
                    )
            }));


        const { data, error } =
            await supabaseClient.rpc(
                "criar_pedido",
                {
                    p_cliente_nome:
                        dadosCliente.nome,

                    p_cliente_telefone:
                        dadosCliente.telefone,

                    p_observacoes:
                        dadosCliente.observacoes || null,

                    p_itens:
                        itens
                }
            );


        if (error) {

            console.error(
                "Erro ao criar pedido:",
                error
            );

            throw new Error(
                error.message ||
                "Não foi possível registrar o pedido."
            );

        }


        if (
            !data ||
            !data.numero_pedido ||
            !data.token_publico
        ) {

            throw new Error(
                "O pedido foi processado, mas não retornou os dados necessários para o link de acompanhamento."
            );

        }


        return data;

    }


    /* =========================================================
       FINALIZAÇÃO
    ========================================================= */

    async function finalizarPedido() {

        if (finalizandoPedido) {
            return;
        }


        limparMensagem();


        const carrinho =
            obterCarrinho();


        if (carrinho.length === 0) {

            mostrarMensagem(
                "Seu carrinho está vazio."
            );

            return;

        }


        const nome =
            clienteNome
                ? clienteNome.value.trim()
                : "";

        const telefone =
            clienteTelefone
                ? clienteTelefone.value.trim()
                : "";

        const observacoes =
            clienteObservacoes
                ? clienteObservacoes.value.trim()
                : "";


        if (nome.length < 2) {

            mostrarMensagem(
                "Informe seu nome para continuar."
            );

            clienteNome?.focus();

            return;

        }


        if (!telefoneValido(telefone)) {

            mostrarMensagem(
                "Informe um WhatsApp válido com DDD."
            );

            clienteTelefone?.focus();

            return;

        }


        const dadosCliente = {
            nome,
            telefone,
            observacoes
        };


        finalizandoPedido = true;
        definirEstadoFinalizacao(true);


        try {

            const pedido =
                await criarPedidoNoSupabase(
                    carrinho,
                    dadosCliente
                );


            mostrarMensagem(
                `Pedido ${pedido.numero_pedido} registrado com sucesso. Abrindo o WhatsApp...`,
                "sucesso"
            );


            const mensagem =
                criarMensagemWhatsApp(
                    carrinho,
                    pedido,
                    dadosCliente
                );


            const urlWhatsApp =
                `https://wa.me/${WHATSAPP_DEA}?text=${encodeURIComponent(mensagem)}`;


            /*
             * O pedido já foi salvo com sucesso.
             * Agora limpamos o carrinho para evitar que o mesmo
             * pedido seja enviado novamente ao voltar para o site.
             */
            salvarCarrinho([]);


            /*
             * Pequeno atraso para o cliente visualizar a confirmação.
             * A navegação na mesma aba evita bloqueio de popup
             * depois da chamada assíncrona ao Supabase.
             */
            setTimeout(() => {

                window.location.href =
                    urlWhatsApp;

            }, 450);


        } catch (erro) {

            console.error(
                "Erro ao finalizar pedido:",
                erro
            );


            mostrarMensagem(
                "Não foi possível registrar o pedido. Tente novamente em alguns instantes."
            );


            finalizandoPedido = false;
            definirEstadoFinalizacao(false);

        }

    }


    if (finalizarWhatsApp) {

        finalizarWhatsApp.addEventListener(
            "click",
            finalizarPedido
        );

    }


    /* =========================================================
       FORMATAÇÃO DO TELEFONE
    ========================================================= */

    if (clienteTelefone) {

        clienteTelefone.addEventListener(
            "input",
            evento => {

                let numeros =
                    somenteNumeros(
                        evento.target.value
                    ).slice(0, 11);


                if (numeros.length <= 2) {

                    evento.target.value =
                        numeros;

                    return;

                }


                const ddd =
                    numeros.slice(0, 2);

                const restante =
                    numeros.slice(2);


                if (restante.length <= 4) {

                    evento.target.value =
                        `(${ddd}) ${restante}`;

                    return;

                }


                if (restante.length <= 8) {

                    evento.target.value =
                        `(${ddd}) ${restante.slice(0, 4)}-${restante.slice(4)}`;

                    return;

                }


                evento.target.value =
                    `(${ddd}) ${restante.slice(0, 5)}-${restante.slice(5)}`;

            }
        );

    }


    /* =========================================================
       INICIALIZAÇÃO
    ========================================================= */

    renderizarCarrinho();

});

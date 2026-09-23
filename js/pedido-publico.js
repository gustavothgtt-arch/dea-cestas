/* =========================================================
   DÉA CESTAS
   PEDIDO-PUBLICO.JS
   Consulta segura do pedido por número + token
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const CHAVE_CARRINHO = "deaCestasCarrinho";

    const botaoMenuMobile = document.getElementById("botaoMenuMobile");
    const menuPrincipal = document.getElementById("menuPrincipal");
    const quantidadeCarrinho = document.getElementById("quantidadeCarrinho");

    const pedidoCarregando = document.getElementById("pedidoCarregando");
    const pedidoErro = document.getElementById("pedidoErro");
    const pedidoErroTexto = document.getElementById("pedidoErroTexto");
    const pedidoConteudo = document.getElementById("pedidoConteudo");

    const pedidoNumero = document.getElementById("pedidoNumero");
    const pedidoData = document.getElementById("pedidoData");
    const pedidoStatus = document.getElementById("pedidoStatus");
    const pedidoCliente = document.getElementById("pedidoCliente");
    const pedidoProgresso = document.getElementById("pedidoProgresso");
    const pedidoStatusDescricao = document.getElementById("pedidoStatusDescricao");
    const pedidoQuantidadeItens = document.getElementById("pedidoQuantidadeItens");
    const pedidoItens = document.getElementById("pedidoItens");
    const pedidoObservacoesArea = document.getElementById("pedidoObservacoesArea");
    const pedidoObservacoes = document.getElementById("pedidoObservacoes");
    const pedidoTotal = document.getElementById("pedidoTotal");

    const STATUS = {
        novo: {
            nome: "Novo",
            classe: "novo",
            progresso: 12,
            descricao: "Recebemos seu pedido."
        },
        em_atendimento: {
            nome: "Em atendimento",
            classe: "em-atendimento",
            progresso: 28,
            descricao: "Seu pedido está em atendimento."
        },
        confirmado: {
            nome: "Confirmado",
            classe: "confirmado",
            progresso: 45,
            descricao: "Seu pedido foi confirmado."
        },
        em_producao: {
            nome: "Em produção",
            classe: "em-producao",
            progresso: 65,
            descricao: "Estamos preparando seu pedido."
        },
        pronto: {
            nome: "Pronto",
            classe: "pronto",
            progresso: 85,
            descricao: "Seu pedido está pronto."
        },
        finalizado: {
            nome: "Finalizado",
            classe: "finalizado",
            progresso: 100,
            descricao: "Pedido finalizado."
        },
        cancelado: {
            nome: "Cancelado",
            classe: "cancelado",
            progresso: 100,
            descricao: "Este pedido foi cancelado."
        }
    };

    function configurarMenu() {
        if (!botaoMenuMobile || !menuPrincipal) return;

        botaoMenuMobile.addEventListener("click", () => {
            const aberto = menuPrincipal.classList.toggle("ativo");
            botaoMenuMobile.textContent = aberto ? "✕" : "☰";
            botaoMenuMobile.setAttribute(
                "aria-label",
                aberto ? "Fechar menu" : "Abrir menu"
            );
        });

        menuPrincipal.querySelectorAll("a").forEach(link => {
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

    function atualizarCarrinhoTopo() {
        if (!quantidadeCarrinho) return;

        try {
            const salvo = localStorage.getItem(CHAVE_CARRINHO);
            const carrinho = salvo ? JSON.parse(salvo) : [];

            quantidadeCarrinho.textContent = Array.isArray(carrinho)
                ? carrinho.reduce(
                    (total, item) => total + (Number(item.quantidade) || 1),
                    0
                )
                : 0;
        } catch {
            quantidadeCarrinho.textContent = "0";
        }
    }

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatarData(valor) {
        if (!valor) return "";

        const data = new Date(valor);

        if (Number.isNaN(data.getTime())) return "";

        return data.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function definirEstadoPagina(estado) {
        pedidoCarregando.hidden = estado !== "carregando";
        pedidoErro.hidden = estado !== "erro";
        pedidoConteudo.hidden = estado !== "conteudo";
    }

    function mostrarErro(texto) {
        definirEstadoPagina("erro");

        if (texto) {
            pedidoErroTexto.textContent = texto;
        }
    }

    function criarItem(item) {
        const artigo = document.createElement("article");
        artigo.className = "pedido-item";

        const fotoBox = document.createElement("div");
        fotoBox.className = "pedido-item-foto";

        const foto = document.createElement("img");
        foto.src = item.produto_foto || "imagens/logo-dea-cestas.png";
        foto.alt = item.produto_nome || "Produto Déa Cestas";
        foto.loading = "lazy";

        foto.addEventListener("error", () => {
            foto.src = "imagens/logo-dea-cestas.png";
        });

        fotoBox.appendChild(foto);

        const info = document.createElement("div");
        info.className = "pedido-item-info";

        const nome = document.createElement("strong");
        nome.textContent = item.produto_nome || "Produto";

        const meta = document.createElement("span");
        const quantidade = Math.max(1, Number(item.quantidade) || 1);
        meta.textContent =
            `${quantidade} ${quantidade === 1 ? "unidade" : "unidades"} • ` +
            `${formatarPreco(item.preco_unitario)} cada`;

        info.append(nome, meta);

        if (item.personalizavel) {
            const personalizado = document.createElement("small");
            personalizado.textContent = "Produto personalizável";
            info.appendChild(personalizado);
        }

        const subtotal = document.createElement("strong");
        subtotal.className = "pedido-item-subtotal";
        subtotal.textContent = formatarPreco(item.subtotal);

        artigo.append(fotoBox, info, subtotal);

        return artigo;
    }

    function renderizarPedido(pedido) {
        const status =
            STATUS[pedido.status] || STATUS.novo;

        pedidoNumero.textContent =
            pedido.numero_pedido || "Pedido";

        pedidoData.textContent =
            pedido.created_at
                ? `Realizado em ${formatarData(pedido.created_at)}`
                : "";

        pedidoCliente.textContent =
            pedido.cliente_nome || "Cliente";

        pedidoStatus.textContent = status.nome;
        pedidoStatus.className =
            `pedido-status ${status.classe}`;

        pedidoProgresso.style.width =
            `${status.progresso}%`;

        pedidoStatusDescricao.textContent =
            status.descricao;

        const itens =
            Array.isArray(pedido.itens)
                ? pedido.itens
                : [];

        const quantidadeTotal =
            itens.reduce(
                (total, item) =>
                    total + (Number(item.quantidade) || 1),
                0
            );

        pedidoQuantidadeItens.textContent =
            `${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}`;

        pedidoItens.replaceChildren();

        itens.forEach(item => {
            pedidoItens.appendChild(criarItem(item));
        });

        if (itens.length === 0) {
            const vazio = document.createElement("p");
            vazio.className = "pedido-sem-itens";
            vazio.textContent = "Nenhum item encontrado neste pedido.";
            pedidoItens.appendChild(vazio);
        }

        const observacoes =
            String(pedido.observacoes || "").trim();

        if (observacoes) {
            pedidoObservacoes.textContent = observacoes;
            pedidoObservacoesArea.hidden = false;
        } else {
            pedidoObservacoesArea.hidden = true;
        }

        pedidoTotal.textContent =
            formatarPreco(pedido.total);

        definirEstadoPagina("conteudo");
    }

    async function carregarPedido() {
        const parametros =
            new URLSearchParams(window.location.search);

        const codigo =
            (parametros.get("codigo") || "").trim();

        const token =
            (parametros.get("token") || "").trim();

        if (!codigo || !token) {
            mostrarErro(
                "O link do pedido está incompleto. Abra novamente o link enviado pela Déa Cestas."
            );
            return;
        }

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {
            mostrarErro(
                "Não foi possível conectar ao sistema de pedidos. Tente novamente em alguns instantes."
            );
            return;
        }

        try {
            const { data, error } =
                await supabaseClient.rpc(
                    "buscar_pedido_publico",
                    {
                        p_numero_pedido: codigo,
                        p_token: token
                    }
                );

            if (error) {
                console.error(
                    "Erro ao consultar pedido:",
                    error
                );
                throw error;
            }

            if (!data) {
                mostrarErro(
                    "Pedido não encontrado. Verifique se você abriu o link completo recebido no WhatsApp."
                );
                return;
            }

            renderizarPedido(data);

        } catch (erro) {
            console.error(
                "Erro ao carregar pedido:",
                erro
            );

            mostrarErro(
                "Não foi possível carregar o pedido agora. Tente novamente em alguns instantes."
            );
        }
    }

    configurarMenu();
    atualizarCarrinhoTopo();
    definirEstadoPagina("carregando");
    carregarPedido();
});

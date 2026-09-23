/* =========================================================
   DÉA CESTAS
   ADMIN.JS
   Autenticação e painel administrativo
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       1. ELEMENTOS
    ===================================================== */

    const telaLogin =
        document.getElementById("telaLogin");

    const telaPainel =
        document.getElementById("telaPainel");

    const formLogin =
        document.getElementById("formLogin");

    const loginEmail =
        document.getElementById("loginEmail");

    const loginSenha =
        document.getElementById("loginSenha");

    const mostrarSenha =
        document.getElementById("mostrarSenha");

    const mensagemLogin =
        document.getElementById("mensagemLogin");

    const botaoEntrar =
        document.getElementById("botaoEntrar");

    const botaoSair =
        document.getElementById("botaoSair");

    const adminEmail =
        document.getElementById("adminEmail");

    const adminCarregando =
        document.getElementById("adminCarregando");

    const adminVazio =
        document.getElementById("adminVazio");

    const listaProdutosAdmin =
        document.getElementById("listaProdutosAdmin");

    const totalProdutos =
        document.getElementById("totalProdutos");

    const totalAtivos =
        document.getElementById("totalAtivos");

    const totalInativos =
        document.getElementById("totalInativos");

    const buscaProdutoAdmin =
        document.getElementById("buscaProdutoAdmin");


    /* =====================================================
       2. VARIÁVEIS
    ===================================================== */

    let produtosAdmin = [];
    let fotosSelecionadas = [];
    let fotosExistentes = [];


    /* =====================================================
       ELEMENTOS DO FORMULÁRIO DE PRODUTO
    ===================================================== */

    const modalProduto = document.getElementById("modalProduto");
    const botaoNovoProduto = document.getElementById("botaoNovoProduto");
    const botaoPrimeiroProduto = document.getElementById("botaoPrimeiroProduto");
    const botaoFecharModal = document.getElementById("botaoFecharModal");
    const fecharModalFundo = document.getElementById("fecharModalFundo");
    const botaoCancelarProduto = document.getElementById("botaoCancelarProduto");
    const formProduto = document.getElementById("formProduto");
    const modalTitulo = document.getElementById("modalTitulo");
    const produtoIdAdmin = document.getElementById("produtoIdAdmin");
    const produtoNomeAdmin = document.getElementById("produtoNomeAdmin");
    const produtoCategoriaAdmin = document.getElementById("produtoCategoriaAdmin");
    const produtoPrecoAdmin = document.getElementById("produtoPrecoAdmin");
    const produtoDescricaoCurtaAdmin = document.getElementById("produtoDescricaoCurtaAdmin");
    const produtoDescricaoAdmin = document.getElementById("produtoDescricaoAdmin");
    const produtoEtiquetaAdmin = document.getElementById("produtoEtiquetaAdmin");
    const produtoFotosAdmin = document.getElementById("produtoFotosAdmin");
    const previewFotosAdmin = document.getElementById("previewFotosAdmin");
    const produtoPersonalizavelAdmin = document.getElementById("produtoPersonalizavelAdmin");
    const produtoDestaqueAdmin = document.getElementById("produtoDestaqueAdmin");
    const produtoDisponivelAdmin = document.getElementById("produtoDisponivelAdmin");
    const mensagemProduto = document.getElementById("mensagemProduto");
    const botaoSalvarProduto = document.getElementById("botaoSalvarProduto");


    /* =====================================================
       3. MENSAGENS
    ===================================================== */

    function mostrarMensagem(
        elemento,
        texto,
        tipo = "erro"
    ) {

        if (!elemento) {
            return;
        }

        elemento.textContent = texto;

        elemento.classList.remove(
            "erro",
            "sucesso"
        );

        elemento.classList.add(tipo);

        elemento.hidden = false;

    }


    function esconderMensagem(elemento) {

        if (!elemento) {
            return;
        }

        elemento.hidden = true;

        elemento.textContent = "";

        elemento.classList.remove(
            "erro",
            "sucesso"
        );

    }


    /* =====================================================
       4. MOSTRAR / ESCONDER SENHA
    ===================================================== */

    if (mostrarSenha && loginSenha) {

        mostrarSenha.addEventListener(
            "click",
            () => {

                const senhaVisivel =
                    loginSenha.type === "text";

                loginSenha.type =
                    senhaVisivel
                        ? "password"
                        : "text";

                mostrarSenha.textContent =
                    senhaVisivel
                        ? "Ver"
                        : "Ocultar";

                mostrarSenha.setAttribute(
                    "aria-label",
                    senhaVisivel
                        ? "Mostrar senha"
                        : "Ocultar senha"
                );

            }
        );

    }


    /* =====================================================
       5. TELAS
    ===================================================== */

    function mostrarLogin() {

        if (telaLogin) {
            telaLogin.hidden = false;
        }

        if (telaPainel) {
            telaPainel.hidden = true;
        }

    }


    function mostrarPainel(usuario) {

        if (telaLogin) {
            telaLogin.hidden = true;
        }

        if (telaPainel) {
            telaPainel.hidden = false;
        }

        if (adminEmail) {

            adminEmail.textContent =
                usuario?.email || "";

        }

    }


    /* =====================================================
       6. VERIFICAR SE É ADMINISTRADOR
    ===================================================== */

    async function verificarAdministrador(usuario) {

        if (!usuario) {
            return false;
        }

        const {
            data,
            error
        } = await supabaseClient
            .from(DEA_CONFIG.tabelaAdministradores)
            .select("user_id")
            .eq("user_id", usuario.id)
            .maybeSingle();


        if (error) {

            console.error(
                "Erro ao verificar administrador:",
                error
            );

            return false;

        }


        return Boolean(data);

    }


    /* =====================================================
       7. FORMATAR PREÇO
    ===================================================== */

    function formatarPreco(valor) {

        return Number(valor || 0)
            .toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

    }


    /* =====================================================
       8. NOME DA CATEGORIA
    ===================================================== */

    function nomeCategoria(categoria) {

        const categorias = {

            cestas: "Cestas",

            canecas: "Canecas",

            copos: "Copos",

            lembrancas: "Lembranças"

        };


        return categorias[categoria] ||
            categoria ||
            "Produto";

    }


    /* =====================================================
       9. FOTO PRINCIPAL
    ===================================================== */

    function obterFotoPrincipal(produto) {

        if (
            Array.isArray(produto.fotos) &&
            produto.fotos.length > 0
        ) {

            return produto.fotos[0];

        }


        return "imagens/logo-dea-cestas.png";

    }


    /* =====================================================
       10. RESUMO
    ===================================================== */

    function atualizarResumo() {

        const total =
            produtosAdmin.length;

        const ativos =
            produtosAdmin.filter(
                produto =>
                    produto.disponivel === true
            ).length;

        const inativos =
            total - ativos;


        if (totalProdutos) {
            totalProdutos.textContent = total;
        }

        if (totalAtivos) {
            totalAtivos.textContent = ativos;
        }

        if (totalInativos) {
            totalInativos.textContent = inativos;
        }

    }


    /* =====================================================
       11. CRIAR CARD DO PRODUTO
    ===================================================== */

    function criarCardProduto(produto) {

        const card =
            document.createElement("article");

        card.className =
            "admin-produto";


        /* FOTO */

        const areaImagem =
            document.createElement("div");

        areaImagem.className =
            "admin-produto-imagem";


        const imagem =
            document.createElement("img");

        imagem.src =
            obterFotoPrincipal(produto);

        imagem.alt =
            produto.nome || "Produto";


        areaImagem.appendChild(imagem);


        /* INFORMAÇÕES */

        const info =
            document.createElement("div");

        info.className =
            "admin-produto-info";


        const categoria =
            document.createElement("span");

        categoria.textContent =
            nomeCategoria(produto.categoria);


        const nome =
            document.createElement("h3");

        nome.textContent =
            produto.nome;


        const preco =
            document.createElement("strong");

        preco.textContent =
            formatarPreco(produto.preco);


        const meta =
            document.createElement("div");

        meta.className =
            "admin-produto-meta";


        const status =
            document.createElement("span");

        status.className =
            produto.disponivel
                ? "admin-status ativo"
                : "admin-status inativo";

        status.textContent =
            produto.disponivel
                ? "Ativo"
                : "Inativo";


        meta.appendChild(status);


        if (produto.destaque) {

            const destaque =
                document.createElement("span");

            destaque.className =
                "admin-status destaque";

            destaque.textContent =
                "Destaque";

            meta.appendChild(destaque);

        }


        info.append(
            categoria,
            nome,
            preco,
            meta
        );


        /* AÇÕES */

        const acoes =
            document.createElement("div");

        acoes.className =
            "admin-produto-acoes";


        const botaoEditar =
            document.createElement("button");

        botaoEditar.type = "button";

        botaoEditar.textContent =
            "Editar";

        botaoEditar.dataset.id =
            produto.id;

        botaoEditar.className =
            "acao-editar";


        const botaoStatus =
            document.createElement("button");

        botaoStatus.type = "button";

        botaoStatus.textContent =
            produto.disponivel
                ? "Desativar"
                : "Ativar";

        botaoStatus.dataset.id =
            produto.id;

        botaoStatus.className =
            "acao-status";


        acoes.append(
            botaoEditar,
            botaoStatus
        );


        card.append(
            areaImagem,
            info,
            acoes
        );


        return card;

    }


    /* =====================================================
       12. RENDERIZAR PRODUTOS
    ===================================================== */

    function renderizarProdutos(lista) {

        if (!listaProdutosAdmin) {
            return;
        }


        listaProdutosAdmin.innerHTML = "";


        if (lista.length === 0) {

            if (adminVazio) {
                adminVazio.hidden = false;
            }

            return;

        }


        if (adminVazio) {
            adminVazio.hidden = true;
        }


        lista.forEach(produto => {

            listaProdutosAdmin.appendChild(
                criarCardProduto(produto)
            );

        });

    }


    /* =====================================================
       13. CARREGAR PRODUTOS
    ===================================================== */

    async function carregarProdutos() {

        if (adminCarregando) {
            adminCarregando.hidden = false;
        }

        if (adminVazio) {
            adminVazio.hidden = true;
        }

        if (listaProdutosAdmin) {
            listaProdutosAdmin.innerHTML = "";
        }


        const {
            data,
            error
        } = await supabaseClient
            .from(DEA_CONFIG.tabelaProdutos)
            .select("*")
            .order(
                "criado_em",
                {
                    ascending: false
                }
            );


        if (adminCarregando) {
            adminCarregando.hidden = true;
        }


        if (error) {

            console.error(
                "Erro ao carregar produtos:",
                error
            );

            if (adminVazio) {

                adminVazio.hidden = false;

                const titulo =
                    adminVazio.querySelector("h3");

                const texto =
                    adminVazio.querySelector("p");


                if (titulo) {
                    titulo.textContent =
                        "Não foi possível carregar";
                }

                if (texto) {
                    texto.textContent =
                        "Verifique a conexão e tente novamente.";
                }

            }

            return;

        }


        produtosAdmin =
            Array.isArray(data)
                ? data
                : [];


        atualizarResumo();

        renderizarProdutos(
            produtosAdmin
        );

    }


    /* =====================================================
       14. BUSCA
    ===================================================== */

    if (buscaProdutoAdmin) {

        buscaProdutoAdmin.addEventListener(
            "input",
            () => {

                const termo =
                    buscaProdutoAdmin.value
                        .trim()
                        .toLowerCase();


                if (!termo) {

                    renderizarProdutos(
                        produtosAdmin
                    );

                    return;

                }


                const filtrados =
                    produtosAdmin.filter(
                        produto => {

                            const nome =
                                String(
                                    produto.nome || ""
                                ).toLowerCase();

                            const categoria =
                                nomeCategoria(
                                    produto.categoria
                                ).toLowerCase();


                            return (
                                nome.includes(termo) ||
                                categoria.includes(termo)
                            );

                        }
                    );


                renderizarProdutos(
                    filtrados
                );

            }
        );

    }


    /* =====================================================
       15. LOGIN
    ===================================================== */

    if (formLogin) {

        formLogin.addEventListener(
            "submit",
            async evento => {

                evento.preventDefault();

                esconderMensagem(
                    mensagemLogin
                );


                const email =
                    loginEmail.value
                        .trim();

                const senha =
                    loginSenha.value;


                if (!email || !senha) {

                    mostrarMensagem(
                        mensagemLogin,
                        "Preencha o e-mail e a senha."
                    );

                    return;

                }


                botaoEntrar.disabled = true;

                botaoEntrar.textContent =
                    "Entrando...";


                try {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .auth
                            .signInWithPassword({
                                email: email,
                                password: senha
                            });


                    if (error) {

                        mostrarMensagem(
                            mensagemLogin,
                            "E-mail ou senha incorretos."
                        );

                        return;

                    }


                    const usuario =
                        data.user;


                    const ehAdministrador =
                        await verificarAdministrador(
                            usuario
                        );


                    if (!ehAdministrador) {

                        await supabaseClient
                            .auth
                            .signOut();


                        mostrarMensagem(
                            mensagemLogin,
                            "Este usuário não possui acesso ao painel."
                        );

                        return;

                    }


                    mostrarPainel(usuario);

                    await carregarProdutos();


                } catch (erro) {

                    console.error(
                        "Erro no login:",
                        erro
                    );


                    mostrarMensagem(
                        mensagemLogin,
                        "Não foi possível entrar. Tente novamente."
                    );

                } finally {

                    botaoEntrar.disabled = false;

                    botaoEntrar.textContent =
                        "Entrar";

                }

            }
        );

    }


    /* =====================================================
       16. LOGOUT
    ===================================================== */

    if (botaoSair) {

        botaoSair.addEventListener(
            "click",
            async () => {

                await supabaseClient
                    .auth
                    .signOut();


                produtosAdmin = [];

                mostrarLogin();

                if (formLogin) {
                    formLogin.reset();
                }

                esconderMensagem(
                    mensagemLogin
                );

            }
        );

    }


    /* =====================================================
       17. VERIFICAR SESSÃO EXISTENTE
    ===================================================== */

    async function verificarSessao() {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .getSession();


            if (error) {

                console.error(
                    "Erro ao verificar sessão:",
                    error
                );

                mostrarLogin();

                return;

            }


            const sessao =
                data.session;


            if (!sessao?.user) {

                mostrarLogin();

                return;

            }


            const ehAdministrador =
                await verificarAdministrador(
                    sessao.user
                );


            if (!ehAdministrador) {

                await supabaseClient
                    .auth
                    .signOut();

                mostrarLogin();

                return;

            }


            mostrarPainel(
                sessao.user
            );


            await carregarProdutos();


        } catch (erro) {

            console.error(
                "Erro ao iniciar painel:",
                erro
            );

            mostrarLogin();

        }

    }


    /* =====================================================
       ABRIR FORMULÁRIO DE NOVO PRODUTO
    ===================================================== */

    function abrirNovoProduto() {
        formProduto.reset();
        produtoIdAdmin.value = "";
        produtoDisponivelAdmin.checked = true;
        fotosSelecionadas = [];
        fotosExistentes = [];
        produtoFotosAdmin.value = "";
        previewFotosAdmin.innerHTML = "";
        esconderMensagem(mensagemProduto);
        modalTitulo.textContent = "Novo produto";
        modalProduto.hidden = false;
        document.body.style.overflow = "hidden";
    }


    /* =====================================================
       FECHAR FORMULÁRIO
    ===================================================== */

    function fecharModalProduto() {
        modalProduto.hidden = true;
        document.body.style.overflow = "";
        formProduto.reset();
        produtoIdAdmin.value = "";
        fotosSelecionadas = [];
        fotosExistentes = [];
        produtoFotosAdmin.value = "";
        previewFotosAdmin.innerHTML = "";
        esconderMensagem(mensagemProduto);
    }


    /* =====================================================
       EVENTOS DO MODAL
    ===================================================== */

    if (botaoNovoProduto) {
        botaoNovoProduto.addEventListener("click", abrirNovoProduto);
    }

    if (botaoPrimeiroProduto) {
        botaoPrimeiroProduto.addEventListener("click", abrirNovoProduto);
    }

    if (botaoFecharModal) {
        botaoFecharModal.addEventListener("click", fecharModalProduto);
    }

    if (botaoCancelarProduto) {
        botaoCancelarProduto.addEventListener("click", fecharModalProduto);
    }

    if (fecharModalFundo) {
        fecharModalFundo.addEventListener("click", fecharModalProduto);
    }

    document.addEventListener("keydown", evento => {
        if (
            evento.key === "Escape" &&
            modalProduto &&
            !modalProduto.hidden
        ) {
            fecharModalProduto();
        }
    });


    /* =====================================================
       PRÉVIA DAS FOTOS
    ===================================================== */

    function renderizarPreviewFotos() {

        previewFotosAdmin.innerHTML = "";

        fotosExistentes.forEach((url, indice) => {

            const item = document.createElement("div");
            item.className = "admin-preview-foto";

            const imagem = document.createElement("img");
            imagem.src = url;
            imagem.alt = `Foto atual ${indice + 1}`;

            const remover = document.createElement("button");
            remover.type = "button";
            remover.textContent = "×";
            remover.setAttribute("aria-label", `Remover foto atual ${indice + 1}`);

            remover.addEventListener("click", () => {
                fotosExistentes.splice(indice, 1);
                renderizarPreviewFotos();
            });

            item.append(imagem, remover);
            previewFotosAdmin.appendChild(item);

        });


        fotosSelecionadas.forEach((arquivo, indice) => {

            const item = document.createElement("div");
            item.className = "admin-preview-foto";

            const imagem = document.createElement("img");
            imagem.alt = `Nova foto ${indice + 1}`;

            const urlTemporaria = URL.createObjectURL(arquivo);
            imagem.src = urlTemporaria;

            imagem.addEventListener("load", () => {
                URL.revokeObjectURL(urlTemporaria);
            }, { once: true });

            const remover = document.createElement("button");
            remover.type = "button";
            remover.textContent = "×";
            remover.setAttribute("aria-label", `Remover nova foto ${indice + 1}`);

            remover.addEventListener("click", () => {
                fotosSelecionadas.splice(indice, 1);
                renderizarPreviewFotos();
            });

            item.append(imagem, remover);
            previewFotosAdmin.appendChild(item);

        });

    }


    if (produtoFotosAdmin) {

        produtoFotosAdmin.addEventListener("change", () => {

            const novosArquivos = Array.from(produtoFotosAdmin.files || []);

            const imagensValidas = novosArquivos.filter(arquivo =>
                ["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)
            );

            if (imagensValidas.length !== novosArquivos.length) {
                mostrarMensagem(
                    mensagemProduto,
                    "Use somente imagens JPG, PNG ou WEBP."
                );
            } else {
                esconderMensagem(mensagemProduto);
            }

            fotosSelecionadas = [
                ...fotosSelecionadas,
                ...imagensValidas
            ];

            produtoFotosAdmin.value = "";
            renderizarPreviewFotos();

        });

    }


    /* =====================================================
       UPLOAD DAS FOTOS
    ===================================================== */

    function extensaoArquivo(arquivo) {

        const extensaoNome = arquivo.name
            .split(".")
            .pop()
            ?.toLowerCase();

        if (extensaoNome && ["jpg", "jpeg", "png", "webp"].includes(extensaoNome)) {
            return extensaoNome === "jpeg" ? "jpg" : extensaoNome;
        }

        const mapa = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        };

        return mapa[arquivo.type] || "jpg";

    }


    async function enviarFotosProduto(arquivos) {

        if (!arquivos.length) {
            return {
                urls: [],
                caminhos: []
            };
        }

        const pasta = crypto.randomUUID();
        const urls = [];
        const caminhos = [];

        for (const arquivo of arquivos) {

            const extensao = extensaoArquivo(arquivo);

            const caminho =
                `${pasta}/${crypto.randomUUID()}.${extensao}`;

            const {
                error: erroUpload
            } = await supabaseClient
                .storage
                .from(DEA_CONFIG.bucketProdutos)
                .upload(
                    caminho,
                    arquivo,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: arquivo.type
                    }
                );

            if (erroUpload) {

                if (caminhos.length) {
                    await supabaseClient
                        .storage
                        .from(DEA_CONFIG.bucketProdutos)
                        .remove(caminhos);
                }

                throw erroUpload;
            }

            caminhos.push(caminho);

            const {
                data: dadosUrl
            } = supabaseClient
                .storage
                .from(DEA_CONFIG.bucketProdutos)
                .getPublicUrl(caminho);

            urls.push(dadosUrl.publicUrl);

        }

        return {
            urls,
            caminhos
        };

    }


    /* =====================================================
       CADASTRAR PRODUTO
    ===================================================== */

    if (formProduto) {

        formProduto.addEventListener("submit", async evento => {

            evento.preventDefault();
            esconderMensagem(mensagemProduto);

            const idProduto = produtoIdAdmin.value.trim();
            const nome = produtoNomeAdmin.value.trim();
            const categoria = produtoCategoriaAdmin.value;
            const preco = Number(produtoPrecoAdmin.value);

            if (!nome || !categoria || produtoPrecoAdmin.value === "") {
                mostrarMensagem(
                    mensagemProduto,
                    "Preencha o nome, a categoria e o preço."
                );
                return;
            }

            if (!Number.isFinite(preco) || preco < 0) {
                mostrarMensagem(
                    mensagemProduto,
                    "Informe um preço válido."
                );
                return;
            }

            botaoSalvarProduto.disabled = true;
            botaoSalvarProduto.textContent =
                idProduto ? "Atualizando..." : "Salvando...";

            let caminhosEnviados = [];

            try {

                const upload = await enviarFotosProduto(fotosSelecionadas);
                caminhosEnviados = upload.caminhos;

                const todasAsFotos = [
                    ...fotosExistentes,
                    ...upload.urls
                ];

                const produto = {
                    nome,
                    categoria,
                    preco,
                    descricao_curta:
                        produtoDescricaoCurtaAdmin.value.trim() || null,
                    descricao:
                        produtoDescricaoAdmin.value.trim() || null,
                    fotos: todasAsFotos,
                    etiqueta:
                        produtoEtiquetaAdmin.value.trim() || null,
                    personalizavel:
                        produtoPersonalizavelAdmin.checked,
                    disponivel:
                        produtoDisponivelAdmin.checked,
                    destaque:
                        produtoDestaqueAdmin.checked,
                    atualizado_em:
                        new Date().toISOString()
                };

                let erroSalvar = null;

                if (idProduto) {

                    const {
                        error
                    } = await supabaseClient
                        .from(DEA_CONFIG.tabelaProdutos)
                        .update(produto)
                        .eq("id", idProduto);

                    erroSalvar = error;

                } else {

                    const {
                        error
                    } = await supabaseClient
                        .from(DEA_CONFIG.tabelaProdutos)
                        .insert(produto);

                    erroSalvar = error;

                }

                if (erroSalvar) {
                    throw erroSalvar;
                }

                mostrarMensagem(
                    mensagemProduto,
                    idProduto
                        ? "Produto atualizado com sucesso!"
                        : "Produto cadastrado com sucesso!",
                    "sucesso"
                );

                await carregarProdutos();

                setTimeout(() => {
                    fecharModalProduto();
                }, 450);

            } catch (erro) {

                console.error(
                    "Erro ao salvar produto:",
                    erro
                );

                if (caminhosEnviados.length) {
                    await supabaseClient
                        .storage
                        .from(DEA_CONFIG.bucketProdutos)
                        .remove(caminhosEnviados);
                }

                mostrarMensagem(
                    mensagemProduto,
                    "Não foi possível salvar o produto. Tente novamente."
                );

            } finally {

                botaoSalvarProduto.disabled = false;
                botaoSalvarProduto.textContent = "Salvar produto";

            }

        });

    }


    /* =====================================================
       EDITAR PRODUTO
    ===================================================== */

    function abrirEdicaoProduto(produto) {

        formProduto.reset();

        produtoIdAdmin.value = produto.id;
        produtoNomeAdmin.value = produto.nome || "";
        produtoCategoriaAdmin.value = produto.categoria || "";
        produtoPrecoAdmin.value = produto.preco ?? "";
        produtoDescricaoCurtaAdmin.value = produto.descricao_curta || "";
        produtoDescricaoAdmin.value = produto.descricao || "";
        produtoEtiquetaAdmin.value = produto.etiqueta || "";
        produtoPersonalizavelAdmin.checked = produto.personalizavel === true;
        produtoDestaqueAdmin.checked = produto.destaque === true;
        produtoDisponivelAdmin.checked = produto.disponivel === true;

        fotosSelecionadas = [];
        fotosExistentes = Array.isArray(produto.fotos)
            ? [...produto.fotos]
            : [];

        produtoFotosAdmin.value = "";

        esconderMensagem(mensagemProduto);

        modalTitulo.textContent = "Editar produto";

        renderizarPreviewFotos();

        modalProduto.hidden = false;
        document.body.style.overflow = "hidden";

    }


    /* =====================================================
       ATIVAR / DESATIVAR PRODUTO
    ===================================================== */

    async function alterarStatusProduto(produto) {

        const novoStatus = !produto.disponivel;

        try {

            const {
                error
            } = await supabaseClient
                .from(DEA_CONFIG.tabelaProdutos)
                .update({
                    disponivel: novoStatus,
                    atualizado_em: new Date().toISOString()
                })
                .eq("id", produto.id);

            if (error) {
                throw error;
            }

            await carregarProdutos();

        } catch (erro) {

            console.error(
                "Erro ao alterar status do produto:",
                erro
            );

            alert(
                "Não foi possível alterar o status do produto."
            );

        }

    }


    /* =====================================================
       CLIQUES NOS BOTÕES DOS CARDS
    ===================================================== */

    if (listaProdutosAdmin) {

        listaProdutosAdmin.addEventListener(
            "click",
            async evento => {

                const botaoEditar =
                    evento.target.closest(".acao-editar");

                const botaoStatus =
                    evento.target.closest(".acao-status");


                if (botaoEditar) {

                    const id =
                        String(botaoEditar.dataset.id);

                    const produto =
                        produtosAdmin.find(
                            item => String(item.id) === id
                        );

                    if (produto) {
                        abrirEdicaoProduto(produto);
                    }

                    return;

                }


                if (botaoStatus) {

                    const id =
                        String(botaoStatus.dataset.id);

                    const produto =
                        produtosAdmin.find(
                            item => String(item.id) === id
                        );

                    if (!produto) {
                        return;
                    }

                    botaoStatus.disabled = true;

                    await alterarStatusProduto(produto);

                }

            }
        );

    }



    /* =====================================================
       18. PEDIDOS
    ===================================================== */

    const abaProdutos =
        document.getElementById("abaProdutos");

    const abaPedidos =
        document.getElementById("abaPedidos");

    const areaProdutos =
        document.getElementById("areaProdutos");

    const areaPedidos =
        document.getElementById("areaPedidos");

    const contadorPedidosNovos =
        document.getElementById("contadorPedidosNovos");

    const botaoAtualizarPedidos =
        document.getElementById("botaoAtualizarPedidos");

    const totalPedidosNovos =
        document.getElementById("totalPedidosNovos");

    const totalPedidosAndamento =
        document.getElementById("totalPedidosAndamento");

    const totalPedidosFinalizados =
        document.getElementById("totalPedidosFinalizados");

    const totalPedidosCancelados =
        document.getElementById("totalPedidosCancelados");

    const buscaPedidoAdmin =
        document.getElementById("buscaPedidoAdmin");

    const filtroStatusPedido =
        document.getElementById("filtroStatusPedido");

    const pedidosCarregando =
        document.getElementById("pedidosCarregando");

    const pedidosVazio =
        document.getElementById("pedidosVazio");

    const listaPedidosAdmin =
        document.getElementById("listaPedidosAdmin");

    const modalPedido =
        document.getElementById("modalPedido");

    const fecharModalPedidoFundo =
        document.getElementById("fecharModalPedidoFundo");

    const botaoFecharPedido =
        document.getElementById("botaoFecharPedido");

    const pedidoModalNumero =
        document.getElementById("pedidoModalNumero");

    const pedidoModalCliente =
        document.getElementById("pedidoModalCliente");

    const pedidoModalTelefone =
        document.getElementById("pedidoModalTelefone");

    const pedidoModalData =
        document.getElementById("pedidoModalData");

    const pedidoModalTotal =
        document.getElementById("pedidoModalTotal");

    const pedidoModalStatus =
        document.getElementById("pedidoModalStatus");

    const pedidoModalObservacoes =
        document.getElementById("pedidoModalObservacoes");

    const pedidoModalItens =
        document.getElementById("pedidoModalItens");

    const mensagemPedido =
        document.getElementById("mensagemPedido");

    const botaoExcluirPedido =
        document.getElementById("botaoExcluirPedido");

    const botaoSalvarStatusPedido =
        document.getElementById("botaoSalvarStatusPedido");


    let pedidosAdmin = [];
    let pedidoSelecionado = null;


    const STATUS_PEDIDOS = {
        novo: "Novo",
        em_atendimento: "Em atendimento",
        confirmado: "Confirmado",
        em_producao: "Em produção",
        pronto: "Pronto",
        finalizado: "Finalizado",
        cancelado: "Cancelado"
    };


    function formatarDataPedido(data) {

        if (!data) {
            return "—";
        }

        const valor = new Date(data);

        if (Number.isNaN(valor.getTime())) {
            return "—";
        }

        return valor.toLocaleString(
            "pt-BR",
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        );

    }


    function nomeStatusPedido(status) {

        return STATUS_PEDIDOS[status] ||
            status ||
            "Novo";

    }


    function classeStatusPedido(status) {

        return String(status || "novo")
            .replaceAll("_", "-");

    }


    function atualizarResumoPedidos() {

        const novos =
            pedidosAdmin.filter(
                pedido => pedido.status === "novo"
            ).length;

        const andamento =
            pedidosAdmin.filter(
                pedido =>
                    [
                        "em_atendimento",
                        "confirmado",
                        "em_producao",
                        "pronto"
                    ].includes(pedido.status)
            ).length;

        const finalizados =
            pedidosAdmin.filter(
                pedido => pedido.status === "finalizado"
            ).length;

        const cancelados =
            pedidosAdmin.filter(
                pedido => pedido.status === "cancelado"
            ).length;


        if (totalPedidosNovos) {
            totalPedidosNovos.textContent = novos;
        }

        if (totalPedidosAndamento) {
            totalPedidosAndamento.textContent = andamento;
        }

        if (totalPedidosFinalizados) {
            totalPedidosFinalizados.textContent = finalizados;
        }

        if (totalPedidosCancelados) {
            totalPedidosCancelados.textContent = cancelados;
        }


        if (contadorPedidosNovos) {

            contadorPedidosNovos.textContent =
                novos;

            contadorPedidosNovos.hidden =
                novos === 0;

        }

    }


    function criarCardPedido(pedido) {

        const card =
            document.createElement("article");

        card.className =
            "admin-pedido-card";


        const topo =
            document.createElement("div");

        topo.className =
            "admin-pedido-card-topo";


        const identificacao =
            document.createElement("div");

        identificacao.className =
            "admin-pedido-identificacao";


        const numero =
            document.createElement("strong");

        numero.textContent =
            pedido.numero_pedido ||
            `Pedido #${pedido.id}`;


        const data =
            document.createElement("span");

        data.textContent =
            formatarDataPedido(
                pedido.created_at
            );


        identificacao.append(
            numero,
            data
        );


        const status =
            document.createElement("span");

        status.className =
            `admin-pedido-status ${classeStatusPedido(pedido.status)}`;

        status.textContent =
            nomeStatusPedido(
                pedido.status
            );


        topo.append(
            identificacao,
            status
        );


        const corpo =
            document.createElement("div");

        corpo.className =
            "admin-pedido-card-corpo";


        const cliente =
            document.createElement("div");

        cliente.className =
            "admin-pedido-cliente";


        const clienteLabel =
            document.createElement("span");

        clienteLabel.textContent =
            "Cliente";


        const clienteNome =
            document.createElement("strong");

        clienteNome.textContent =
            pedido.cliente_nome ||
            "Cliente";


        const clienteTelefone =
            document.createElement("small");

        clienteTelefone.textContent =
            pedido.cliente_telefone ||
            "";


        cliente.append(
            clienteLabel,
            clienteNome,
            clienteTelefone
        );


        const resumo =
            document.createElement("div");

        resumo.className =
            "admin-pedido-resumo";


        const quantidadeItens =
            Array.isArray(pedido.pedido_itens)
                ? pedido.pedido_itens.reduce(
                    (total, item) =>
                        total + (Number(item.quantidade) || 0),
                    0
                )
                : 0;


        const itensTexto =
            document.createElement("span");

        itensTexto.textContent =
            quantidadeItens === 1
                ? "1 item"
                : `${quantidadeItens} itens`;


        const total =
            document.createElement("strong");

        total.textContent =
            formatarPreco(
                pedido.total
            );


        resumo.append(
            itensTexto,
            total
        );


        corpo.append(
            cliente,
            resumo
        );


        const acoes =
            document.createElement("div");

        acoes.className =
            "admin-pedido-card-acoes";


        const visualizar =
            document.createElement("button");

        visualizar.type = "button";

        visualizar.className =
            "admin-botao admin-botao-secundario admin-pedido-ver";

        visualizar.dataset.id =
            pedido.id;

        visualizar.textContent =
            "Ver pedido";


        acoes.appendChild(
            visualizar
        );


        card.append(
            topo,
            corpo,
            acoes
        );


        return card;

    }


    function aplicarFiltrosPedidos() {

        const termo =
            String(
                buscaPedidoAdmin?.value || ""
            )
                .trim()
                .toLowerCase();

        const status =
            filtroStatusPedido?.value || "";


        const filtrados =
            pedidosAdmin.filter(pedido => {

                const correspondeStatus =
                    !status ||
                    pedido.status === status;

                if (!correspondeStatus) {
                    return false;
                }


                if (!termo) {
                    return true;
                }


                const texto = [
                    pedido.numero_pedido,
                    pedido.cliente_nome,
                    pedido.cliente_telefone
                ]
                    .join(" ")
                    .toLowerCase();


                return texto.includes(termo);

            });


        renderizarPedidos(
            filtrados
        );

    }


    function renderizarPedidos(lista) {

        if (!listaPedidosAdmin) {
            return;
        }


        listaPedidosAdmin.innerHTML = "";


        if (!lista.length) {

            if (pedidosVazio) {
                pedidosVazio.hidden = false;
            }

            return;

        }


        if (pedidosVazio) {
            pedidosVazio.hidden = true;
        }


        lista.forEach(pedido => {

            listaPedidosAdmin.appendChild(
                criarCardPedido(pedido)
            );

        });

    }


    async function carregarPedidos() {

        if (pedidosCarregando) {
            pedidosCarregando.hidden = false;
        }

        if (pedidosVazio) {
            pedidosVazio.hidden = true;
        }

        if (listaPedidosAdmin) {
            listaPedidosAdmin.innerHTML = "";
        }


        const {
            data,
            error
        } = await supabaseClient
            .from("pedidos")
            .select(`
                *,
                pedido_itens (
                    id,
                    pedido_id,
                    produto_id,
                    produto_nome,
                    produto_foto,
                    preco_unitario,
                    quantidade,
                    subtotal,
                    personalizavel
                )
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (pedidosCarregando) {
            pedidosCarregando.hidden = true;
        }


        if (error) {

            console.error(
                "Erro ao carregar pedidos:",
                error
            );

            if (pedidosVazio) {

                pedidosVazio.hidden = false;

                const titulo =
                    pedidosVazio.querySelector("h3");

                const texto =
                    pedidosVazio.querySelector("p");

                if (titulo) {
                    titulo.textContent =
                        "Não foi possível carregar os pedidos";
                }

                if (texto) {
                    texto.textContent =
                        "Verifique a conexão e tente novamente.";
                }

            }

            return;

        }


        pedidosAdmin =
            Array.isArray(data)
                ? data
                : [];


        atualizarResumoPedidos();
        aplicarFiltrosPedidos();

    }


    function mostrarAreaAdmin(area) {

        const mostrarProdutos =
            area === "produtos";


        if (areaProdutos) {
            areaProdutos.hidden =
                !mostrarProdutos;
        }

        if (areaPedidos) {
            areaPedidos.hidden =
                mostrarProdutos;
        }


        abaProdutos?.classList.toggle(
            "ativo",
            mostrarProdutos
        );

        abaPedidos?.classList.toggle(
            "ativo",
            !mostrarProdutos
        );


        if (!mostrarProdutos) {
            carregarPedidos();
        }

    }


    abaProdutos?.addEventListener(
        "click",
        () => mostrarAreaAdmin("produtos")
    );


    abaPedidos?.addEventListener(
        "click",
        () => mostrarAreaAdmin("pedidos")
    );


    botaoAtualizarPedidos?.addEventListener(
        "click",
        carregarPedidos
    );


    buscaPedidoAdmin?.addEventListener(
        "input",
        aplicarFiltrosPedidos
    );


    filtroStatusPedido?.addEventListener(
        "change",
        aplicarFiltrosPedidos
    );


    function renderizarItensPedido(pedido) {

        if (!pedidoModalItens) {
            return;
        }


        pedidoModalItens.innerHTML = "";


        const itens =
            Array.isArray(pedido.pedido_itens)
                ? pedido.pedido_itens
                : [];


        if (!itens.length) {

            const vazio =
                document.createElement("p");

            vazio.className =
                "admin-pedido-sem-itens";

            vazio.textContent =
                "Nenhum item encontrado.";

            pedidoModalItens.appendChild(
                vazio
            );

            return;

        }


        itens.forEach(item => {

            const linha =
                document.createElement("div");

            linha.className =
                "admin-pedido-item";


            /* FOTO DO PRODUTO */

            const fotoBox =
                document.createElement("div");

            fotoBox.className =
                "admin-pedido-item-foto";


            const imagem =
                document.createElement("img");

            imagem.src =
                item.produto_foto ||
                "imagens/logo-dea-cestas.png";

            imagem.alt =
                item.produto_nome ||
                "Produto";

            imagem.loading =
                "lazy";

            imagem.addEventListener(
                "error",
                () => {

                    if (
                        !imagem.src.endsWith(
                            "/imagens/logo-dea-cestas.png"
                        )
                    ) {

                        imagem.src =
                            "imagens/logo-dea-cestas.png";

                    }

                }
            );


            fotoBox.appendChild(
                imagem
            );


            /* INFORMAÇÕES */

            const info =
                document.createElement("div");

            info.className =
                "admin-pedido-item-info";


            const nome =
                document.createElement("strong");

            nome.textContent =
                item.produto_nome ||
                "Produto";


            const detalhes =
                document.createElement("span");

            detalhes.textContent =
                `${Number(item.quantidade) || 1} × ${formatarPreco(item.preco_unitario)}`;


            info.append(
                nome,
                detalhes
            );


            if (item.personalizavel) {

                const personalizado =
                    document.createElement("small");

                personalizado.className =
                    "admin-pedido-item-personalizavel";

                personalizado.textContent =
                    "Personalizável";

                info.appendChild(
                    personalizado
                );

            }


            /* SUBTOTAL */

            const subtotal =
                document.createElement("strong");

            subtotal.className =
                "admin-pedido-item-subtotal";

            subtotal.textContent =
                formatarPreco(
                    item.subtotal
                );


            linha.append(
                fotoBox,
                info,
                subtotal
            );


            pedidoModalItens.appendChild(
                linha
            );

        });

    }

    function abrirPedido(pedido) {

        pedidoSelecionado =
            pedido;


        esconderMensagem(
            mensagemPedido
        );


        if (pedidoModalNumero) {
            pedidoModalNumero.textContent =
                pedido.numero_pedido ||
                `Pedido #${pedido.id}`;
        }

        if (pedidoModalCliente) {
            pedidoModalCliente.textContent =
                pedido.cliente_nome || "—";
        }

        if (pedidoModalTelefone) {
            pedidoModalTelefone.textContent =
                pedido.cliente_telefone || "—";
        }

        if (pedidoModalData) {
            pedidoModalData.textContent =
                formatarDataPedido(
                    pedido.created_at
                );
        }

        if (pedidoModalTotal) {
            pedidoModalTotal.textContent =
                formatarPreco(
                    pedido.total
                );
        }

        if (pedidoModalStatus) {
            pedidoModalStatus.value =
                pedido.status || "novo";
        }

        if (pedidoModalObservacoes) {
            pedidoModalObservacoes.textContent =
                pedido.observacoes ||
                "Nenhuma observação.";
        }


        renderizarItensPedido(
            pedido
        );


        if (modalPedido) {
            modalPedido.hidden = false;
        }

        document.body.style.overflow =
            "hidden";

    }


    function fecharPedido() {

        if (modalPedido) {
            modalPedido.hidden = true;
        }

        pedidoSelecionado = null;

        esconderMensagem(
            mensagemPedido
        );

        document.body.style.overflow =
            "";

    }


    botaoFecharPedido?.addEventListener(
        "click",
        fecharPedido
    );


    fecharModalPedidoFundo?.addEventListener(
        "click",
        fecharPedido
    );


    listaPedidosAdmin?.addEventListener(
        "click",
        evento => {

            const botao =
                evento.target.closest(
                    ".admin-pedido-ver"
                );


            if (!botao) {
                return;
            }


            const pedido =
                pedidosAdmin.find(
                    item =>
                        String(item.id) ===
                        String(botao.dataset.id)
                );


            if (pedido) {
                abrirPedido(pedido);
            }

        }
    );


    botaoSalvarStatusPedido?.addEventListener(
        "click",
        async () => {

            if (
                !pedidoSelecionado ||
                !pedidoModalStatus
            ) {
                return;
            }


            const novoStatus =
                pedidoModalStatus.value;


            botaoSalvarStatusPedido.disabled =
                true;

            botaoSalvarStatusPedido.textContent =
                "Salvando...";


            esconderMensagem(
                mensagemPedido
            );


            try {

                const {
                    error
                } = await supabaseClient
                    .from("pedidos")
                    .update({
                        status: novoStatus,
                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        pedidoSelecionado.id
                    );


                if (error) {
                    throw error;
                }


                mostrarMensagem(
                    mensagemPedido,
                    "Status atualizado com sucesso!",
                    "sucesso"
                );


                await carregarPedidos();


                pedidoSelecionado =
                    pedidosAdmin.find(
                        pedido =>
                            String(pedido.id) ===
                            String(pedidoSelecionado.id)
                    ) || pedidoSelecionado;


                setTimeout(() => {
                    fecharPedido();
                }, 500);


            } catch (erro) {

                console.error(
                    "Erro ao atualizar pedido:",
                    erro
                );


                mostrarMensagem(
                    mensagemPedido,
                    "Não foi possível atualizar o status do pedido."
                );


            } finally {

                botaoSalvarStatusPedido.disabled =
                    false;

                botaoSalvarStatusPedido.textContent =
                    "Salvar status";

            }

        }
    );


    botaoExcluirPedido?.addEventListener(
        "click",
        async () => {

            if (!pedidoSelecionado) {
                return;
            }


            const confirmar =
                window.confirm(
                    `Excluir o pedido ${pedidoSelecionado.numero_pedido}? Esta ação não poderá ser desfeita.`
                );


            if (!confirmar) {
                return;
            }


            botaoExcluirPedido.disabled =
                true;

            botaoExcluirPedido.textContent =
                "Excluindo...";


            esconderMensagem(
                mensagemPedido
            );


            try {

                const {
                    error
                } = await supabaseClient
                    .from("pedidos")
                    .delete()
                    .eq(
                        "id",
                        pedidoSelecionado.id
                    );


                if (error) {
                    throw error;
                }


                fecharPedido();

                await carregarPedidos();


            } catch (erro) {

                console.error(
                    "Erro ao excluir pedido:",
                    erro
                );


                mostrarMensagem(
                    mensagemPedido,
                    "Não foi possível excluir o pedido."
                );


            } finally {

                botaoExcluirPedido.disabled =
                    false;

                botaoExcluirPedido.textContent =
                    "Excluir pedido";

            }

        }
    );


    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key === "Escape" &&
                modalPedido &&
                !modalPedido.hidden
            ) {
                fecharPedido();
            }

        }
    );


    /* =====================================================
       19. INICIALIZAÇÃO
    ===================================================== */

    await verificarSessao();

    /*
     * Carrega os pedidos em segundo plano para que o contador
     * de novos pedidos apareça mesmo antes de abrir a aba.
     */
    const {
        data: sessaoPedidos
    } = await supabaseClient.auth.getSession();

    if (sessaoPedidos?.session?.user) {
        await carregarPedidos();
    }

});
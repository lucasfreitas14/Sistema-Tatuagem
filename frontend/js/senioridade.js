const API = "http://127.0.0.1:8000";
protegerPagina()
const formulario = document.getElementById("form-senioridade");
const campoId = document.getElementById("idsenioridade");
const campoNome = document.getElementById("nome");
const botaoSubmit = document.getElementById("btn-submit-senioridade");
const corpoTabela = document.getElementById("corpo-tabela");

async function listarSenioridades() {
    try {
        const resposta = await fetchAutenticado(`${API}/senioridade`);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar senioridades");
        }

        const senioridades = await resposta.json();
        corpoTabela.innerHTML = "";

        senioridades.forEach((senioridade) => {
            corpoTabela.innerHTML += `
                <tr>
                    <td>${senioridade.idsenioridade}</td>
                    <td>${senioridade.nome}</td>
                    <td>
                        <button class="btn btn-warning btn-sm"
                            onclick="editarSenioridade(${senioridade.idsenioridade})">
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm"
                            onclick="excluirSenioridade(${senioridade.idsenioridade})">
                            Excluir
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível carregar as senioridades. Verifique se a API está funcionando.");
    }
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const id = campoId.value;
    const dados = {
        nome: campoNome.value.trim()
    };

    if (!dados.nome) {
        alert("Digite o nome da senioridade.");
        return;
    }

    const url = id ? `${API}/senioridade/${id}` : `${API}/senioridade`;
    const metodo = id ? "PUT" : "POST";

    try {
        const resposta = await fetchAutenticado(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.detail || "Erro ao salvar senioridade");
        }

        alert(resultado.mensagem || "Senioridade salva com sucesso!");
        limparFormulario();
        listarSenioridades();
    } catch (erro) {
        console.error(erro);
        alert(erro.message || "Erro ao salvar senioridade.");
    }
});

async function editarSenioridade(id) {
    try {
        const resposta = await fetchAutenticado(`${API}/senioridade/${id}`);

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar a senioridade.");
        }

        const senioridade = await resposta.json();

        campoId.value = senioridade.idsenioridade;
        campoNome.value = senioridade.nome;
        botaoSubmit.textContent = "Salvar alterações";

        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (erro) {
        console.error(erro);
        alert(erro.message);
    }
}

async function excluirSenioridade(id) {
    if (!confirm("Tem certeza que deseja excluir esta senioridade?")) {
        return;
    }

    try {
        const resposta = await fetchAutenticado(`${API}/senioridade/${id}`, {
            method: "DELETE"
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.detail || "Erro ao excluir senioridade.");
        }

        alert(resultado.mensagem || "Senioridade excluída com sucesso!");
        listarSenioridades();
    } catch (erro) {
        console.error(erro);
        alert(erro.message || "Erro ao excluir senioridade.");
    }
}

function limparFormulario() {
    formulario.reset();
    campoId.value = "";
    botaoSubmit.textContent = "Cadastrar";
}

listarSenioridades();
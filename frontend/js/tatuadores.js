
const API = "http://127.0.0.1:8000";

const formulario = document.getElementById("form-tatuador");
const campoId = document.getElementById("idtatuador");
const campoNome = document.getElementById("nometatuador");
const campoCpf = document.getElementById("cpf");
const campoEmail = document.getElementById("email");
const campoTelefone = document.getElementById("telefone");
const campoSenioridade = document.getElementById("idsenioridade");
const botaoSubmit = document.getElementById("btn-submit-tatuador");
const corpoTabela = document.getElementById("corpo-tabela");

async function carregarSenioridades() {
    try {
        const resposta = await fetch(`${API}/senioridade`);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar senioridades.");
        }

        const senioridades = await resposta.json();

        campoSenioridade.innerHTML =
            '<option value="">Selecione a senioridade</option>';

        senioridades.forEach((senioridade) => {
            campoSenioridade.innerHTML += `
                <option value="${senioridade.idsenioridade}">
                    ${senioridade.nome}
                </option>
            `;
        });
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível carregar as senioridades.");
    }
}

async function listarTatuadores() {
    try {
        const resposta = await fetch(`${API}/tatuadores`);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar tatuadores.");
        }

        const tatuadores = await resposta.json();
        corpoTabela.innerHTML = "";

        tatuadores.forEach((tatuador) => {
            corpoTabela.innerHTML += `
                <tr>
                    <td>${tatuador.idtatuador}</td>
                    <td>${tatuador.nometatuador}</td>
                    <td>${tatuador.cpf}</td>
                    <td>${tatuador.email ?? ""}</td>
                    <td>${tatuador.telefone ?? ""}</td>
                    <td>${tatuador.senioridade}</td>
                    <td>${tatuador.estilos ?? '-'}</td>
                <td>
        <button class="btn btn-warning btn-sm"
                            onclick="editarTatuador(${tatuador.idtatuador})">
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm"
                            onclick="excluirTatuador(${tatuador.idtatuador})">
                            Excluir
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível carregar os tatuadores.");
    }
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const id = campoId.value;

    const dados = {
        nometatuador: campoNome.value.trim(),
        cpf: campoCpf.value.trim(),
        email: campoEmail.value.trim() || null,
        telefone: campoTelefone.value.trim() || null,
        datacontratacao: new Date().toISOString().split("T")[0],
        idsenioridade: Number(campoSenioridade.value)
    };

    if (!dados.nometatuador || !dados.cpf || !dados.idsenioridade) {
        alert("Preencha o nome, CPF e senioridade.");
        return;
    }

    const url = id ? `${API}/tatuadores/${id}` : `${API}/tatuadores`;
    const metodo = id ? "PUT" : "POST";

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.detail || "Erro ao salvar tatuador.");
        }

        const idTatuadorSalvo = id || resultado.idtatuador;

const estilosSelecionados = Array.from(
    document.querySelectorAll(".checkbox-estilo:checked")
).map(checkbox => Number(checkbox.value));

const respostaEstilos = await fetch(
    `${API}/tatuadores/${idTatuadorSalvo}/estilos`,
    {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            idestilos: estilosSelecionados
        })
    }
);

if (!respostaEstilos.ok) {
    throw new Error("Tatuador salvo, mas não foi possível vincular os estilos.");
}

alert(resultado.mensagem || "Tatuador salvo com sucesso!");

limparFormulario();
await listarTatuadores();
    } catch (erro) {
        console.error(erro);
        alert(erro.message || "Erro ao salvar tatuador.");
    }
});

async function editarTatuador(id) {
    try {
        const resposta = await fetch(`${API}/tatuadores/${id}`);

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar o tatuador.");
        }

        const tatuador = await resposta.json();

        campoId.value = tatuador.idtatuador;
        campoNome.value = tatuador.nometatuador;
        campoCpf.value = tatuador.cpf;
        campoEmail.value = tatuador.email ?? "";
        campoTelefone.value = tatuador.telefone ?? "";
        campoSenioridade.value = tatuador.idsenioridade;

const respostaEstilos = await fetch(`${API}/tatuadores/${id}/estilos`);
const estilosVinculados = await respostaEstilos.json();

document.querySelectorAll(".checkbox-estilo").forEach(checkbox => {
    checkbox.checked = estilosVinculados.some(
        estilo => Number(estilo.idestilo) === Number(checkbox.value)
    );
});

botaoSubmit.textContent = "Salvar alterações";
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (erro) {
        console.error(erro);
        alert(erro.message);
    }
}

async function excluirTatuador(id) {
    if (!confirm("Tem certeza que deseja excluir este tatuador?")) {
        return;
    }

    try {
        const resposta = await fetch(`${API}/tatuadores/${id}`, {
            method: "DELETE"
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.detail || "Erro ao excluir tatuador.");
        }

        alert(resultado.mensagem || "Tatuador excluído com sucesso!");
        await listarTatuadores();
    } catch (erro) {
        console.error(erro);
        alert(erro.message || "Erro ao excluir tatuador.");
    }
}

function limparFormulario() {
    formulario.reset();
    campoId.value = "";

    document.querySelectorAll(".checkbox-estilo").forEach(checkbox => {
        checkbox.checked = false;
    });

    botaoSubmit.textContent = "Cadastrar";
}

async function iniciarPagina() {
    await carregarSenioridades();
    await carregarEstilos();
    await listarTatuadores();
}

iniciarPagina();

async function carregarEstilos() {
    const resposta = await fetch(`${API}/estilos`);
    const estilos = await resposta.json();

    const lista = document.getElementById("lista-estilos");
    lista.innerHTML = "";

    estilos.forEach(estilo => {
        lista.innerHTML += `
            <div class="form-check">
                <input
                    class="form-check-input checkbox-estilo"
                    type="checkbox"
                    value="${estilo.idestilo}"
                    id="estilo-${estilo.idestilo}"
                >
                <label class="form-check-label" for="estilo-${estilo.idestilo}">
                    ${estilo.descricao}
                </label>
            </div>
        `;
    });
}

carregarEstilos();
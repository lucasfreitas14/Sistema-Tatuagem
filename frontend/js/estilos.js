const API = "http://127.0.0.1:8000";

async function listarEstilos() {
    const resposta = await fetch(`${API}/estilos`);
    const estilos = await resposta.json();

    const corpo = document.getElementById("corpo-tabela");
    corpo.innerHTML = "";

    estilos.forEach(estilo => {
        corpo.innerHTML += `
            <tr>
                <td>${estilo.idestilo}</td>
                <td>${estilo.descricao}</td>
                <td>
                    <button class="btn btn-warning btn-sm"
                        onclick="editarEstilo(${estilo.idestilo}, '${estilo.descricao.replace(/'/g, "\\'")}')">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="excluirEstilo(${estilo.idestilo})">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });
}

document.getElementById("form-estilo").addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("idestilo").value;
    const descricao = document.getElementById("descricao").value;

    const metodo = id ? "PUT" : "POST";
    const url = id ? `${API}/estilos/${id}` : `${API}/estilos`;

    const resposta = await fetch(url, {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ descricao })
    });

    const resultado = await resposta.json();

    if (!resposta.ok || resultado.erro) {
        alert(resultado.erro || "Erro ao salvar estilo.");
        return;
    }

    alert(resultado.mensagem);
    limparFormulario();
    listarEstilos();
});

function editarEstilo(id, descricao) {
    document.getElementById("idestilo").value = id;
    document.getElementById("descricao").value = descricao;
    document.getElementById("btn-submit-estilo").textContent = "Atualizar";
}

async function excluirEstilo(id) {
    if (!confirm("Tem certeza que deseja excluir este estilo?")) {
        return;
    }

    const resposta = await fetch(`${API}/estilos/${id}`, {
        method: "DELETE"
    });

    const resultado = await resposta.json();

    if (!resposta.ok || resultado.erro) {
        alert(resultado.erro || "Erro ao excluir estilo.");
        return;
    }

    alert(resultado.mensagem);
    listarEstilos();
}

function limparFormulario() {
    document.getElementById("form-estilo").reset();
    document.getElementById("idestilo").value = "";
    document.getElementById("btn-submit-estilo").textContent = "Cadastrar";
}

listarEstilos();
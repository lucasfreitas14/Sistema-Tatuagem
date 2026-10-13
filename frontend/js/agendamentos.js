
// Endereço da API
const API = 'http://127.0.0.1:8000'

// Elementos do formulário
const formAgendamento = document.getElementById('form-agendamento')
const botaoSubmit = document.getElementById('btn-submit-agendamento')
const blocoStatus = document.getElementById('bloco-status')

// Limpa o formulário e volta ao modo de cadastro
function limparFormulario() {
  formAgendamento.reset()
  delete formAgendamento.dataset.idAgendamento

  botaoSubmit.textContent = 'Cadastrar'
  botaoSubmit.classList.remove('btn-success')
  botaoSubmit.classList.add('btn-primary')
  blocoStatus.style.display = 'none'
}

// Carrega os clientes no select
async function carregarClientes() {
  const resposta = await fetch(`${API}/clientes`)
  const clientes = await resposta.json()

  const select = document.getElementById('idcliente')
  select.innerHTML = '<option value="">Cliente...</option>'

  clientes.forEach(c => {
    select.innerHTML += `<option value="${c.idcliente}">${c.nome}</option>`
  })
}

// Carrega os tatuadores no select
async function carregarTatuadores() {
  const resposta = await fetch(`${API}/tatuadores`)
  const tatuadores = await resposta.json()

  const select = document.getElementById('idtatuador')
  select.innerHTML = '<option value="">Tatuador...</option>'

  tatuadores.forEach(t => {
    select.innerHTML += `<option value="${t.idtatuador}">${t.nometatuador}</option>`
  })
}

carregarClientes()
carregarTatuadores()

// Lista os agendamentos na tabela
async function listarAgendamentos() {
  const resposta = await fetch(`${API}/agendamentos`)
  const agendamentos = await resposta.json()

  const corpo = document.getElementById('corpo-tabela')
  corpo.innerHTML = ''

  agendamentos.forEach(a => {
    const imagemHtml = a.desenhoaprovado
      ? `<img src="${API}/uploads/${a.desenhoaprovado}" style="max-width: 60px; max-height: 60px;">`
      : '-'

    corpo.innerHTML += `
      <tr>
        <td>${a.idagendamento}</td>
        <td>${a.cliente}</td>
        <td>${a.tatuador}</td>
        <td>${a.dataagendamento}</td>
        <td>${a.horaagendamento}</td>
        <td>${a.valortatuagem ?? '-'}</td>
        <td>${a.status}</td>
        <td>${imagemHtml}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick='preencherFormularioEdicao(${JSON.stringify(a)})'>Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deletarAgendamento(${a.idagendamento})">Excluir</button>
        </td>
      </tr>`
  })
}

listarAgendamentos()

// Cadastra ou atualiza um agendamento

formAgendamento.addEventListener('submit', async (e) => {
  e.preventDefault()

  const agendamento = {
    idcliente: Number(document.getElementById('idcliente').value),
    idtatuador: Number(document.getElementById('idtatuador').value),
    dataagendamento: document.getElementById('dataagendamento').value,
    horaagendamento: document.getElementById('horaagendamento').value,
    descricaotatuagem:
      document.getElementById('descricaotatuagem').value || null,
    valortatuagem: document.getElementById('valortatuagem').value
      ? Number(document.getElementById('valortatuagem').value)
      : null,
    status: document.getElementById('status').value
  }

  const idAgendamento = formAgendamento.dataset.idAgendamento
  let idParaUpload = idAgendamento

  if (idAgendamento) {
    await fetch(`${API}/agendamentos/${idAgendamento}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agendamento)
    })
  } else {
    const resposta = await fetch(`${API}/agendamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agendamento)
    })

    const dados = await resposta.json()
    idParaUpload = dados.idagendamento
  }

  const arquivo = document.getElementById('desenho').files[0]

  if (arquivo) {
    const formData = new FormData()
    formData.append('arquivo', arquivo)

    await fetch(`${API}/agendamentos/${idParaUpload}/desenho`, {
      method: 'POST',
      body: formData
    })
  }

  limparFormulario()
  listarAgendamentos()
})


// Preenche o formulário para editar um agendamento
function preencherFormularioEdicao(agendamento) {
  document.getElementById('idcliente').value = agendamento.idcliente
  document.getElementById('idtatuador').value = agendamento.idtatuador
  document.getElementById('dataagendamento').value =
    String(agendamento.dataagendamento).slice(0, 10)
  document.getElementById('horaagendamento').value =
    agendamento.horaagendamento.slice(0, 5)
  document.getElementById('descricaotatuagem').value =
    agendamento.descricaotatuagem || ''
  document.getElementById('valortatuagem').value =
    agendamento.valortatuagem ?? ''

  document.getElementById('status').value = agendamento.status
  blocoStatus.style.display = 'block'

  formAgendamento.dataset.idAgendamento = agendamento.idagendamento

  botaoSubmit.textContent = 'Salvar alteração'
  botaoSubmit.classList.remove('btn-primary')
  botaoSubmit.classList.add('btn-success')
}

// Exclui um agendamento
async function deletarAgendamento(id) {
  if (!confirm('Tem certeza que deseja excluir este agendamento?')) return

  await fetch(`${API}/agendamentos/${id}`, { method: 'DELETE' })
  listarAgendamentos()
}
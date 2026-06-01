const corpoTabela = document.getElementById("agendamentos");
const urlBase = "https://api.franciscosensaulas.com/api/v1/mecanica/agendamentos";

const botaoAgendar = document.getElementById("botao-agendar");
botaoAgendar.addEventListener("click", validarEAgendar);

const campoCliente = document.getElementById("cliente");
const campoDescricao = document.getElementById("descricao");
const campoData = document.getElementById("data");

campoCliente.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        validarEAgendar(evento);
    }
});

campoDescricao.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        validarEAgendar(evento);
    }
});

campoData.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        validarEAgendar(evento);
    }
});

let idParaEditar = -1;
let idSelecionadoParaApagar = null;

function validarEAgendar(evento) {
    evento.preventDefault();

    const cliente = campoCliente.value.trim();
    const descricao = campoDescricao.value.trim();
    const data = campoData.value.trim();

    if (cliente.length < 4) {
        alert("Nome do cliente deve conter no mínimo 4 caracteres");
        return;
    }
    if (descricao.length < 1) {
        alert("Descrição não pode estar vazia");
        return;
    }
    if (data.length < 1) {
        alert("Data não pode estar vazia");
        return;
    }

    if (idParaEditar === -1) {
        cadastrarAgendamento();
    } else {
        editarAgendamento(cliente, descricao, data);
    }
}

function limparCampos() {
    campoCliente.value = "";
    campoDescricao.value = "";
    campoData.value = "";

    idParaEditar = -1;
}

function listarAgendamentos() {
    corpoTabela.innerHTML = "";

    fetch(urlBase)
        .then(response => response.json())
        .then(agendamentos => {
            for (let i = 0; i < agendamentos.length; i++) {
                const agendamento = agendamentos[i];
                criarLinha(agendamento);
            }
            adicionarCliqueBotoesLinhas();
        })
        .catch(error => {
            console.error("Erro ao listar agendamentos: " + error);
            alert("Ocorreu um erro ao tentar listar os agendamentos");
        });
}

function criarLinha(agendamento) {
    var nomeCliente = "";
    if (agendamento.cliente != null) {
        nomeCliente = agendamento.cliente.nome;
    }

    const linha = `<tr>
    <td>${agendamento.id}</td>
    <td>${nomeCliente}</td>
    <td>${agendamento.descricao}</td>
    <td>${agendamento.dataAgendamento}</td>
    <td>
        <button class="botao-editar" agendamento-id="${agendamento.id}">Editar</button>
        <button class="botao-apagar" agendamento-id="${agendamento.id}">Apagar</button>
    </td>
</tr>`;

    const botaoConfirmar = `
    <h2>⚠️</h2>
    <p>DESEJA APAGAR O AGENDAMENTO?</p>
    <button id="fechar-modal">Cancelar</button>
    <button id="confirmar-modal" agendamento-id="${agendamento.id}">Confirmar</button>`;

    const modalConfirmar = document.getElementsByClassName("modal-conteudo")[0];

    corpoTabela.innerHTML = corpoTabela.innerHTML + linha;

    if (modalConfirmar) {
        modalConfirmar.innerHTML = botaoConfirmar;
    }
}

function cadastrarAgendamento() {
    const urlClientes = "https://api.franciscosensaulas.com/api/v1/mecanica/clientes";

    fetch(urlClientes)
        .then( response => response.json()) 
        .then(clientes => {
            let idDoCliente = 0;

            for (let i = 0; i < clientes.length; i++) {
                const cliente = clientes[i];
                if (cliente.nome === campoCliente.value.trim()) {
                    idDoCliente = cliente.id;
                }
            }

            const cliente = campoCliente.value.trim();
            const descricao = campoDescricao.value.trim();
            const data = campoData.value.trim();
            const dataISO = new Date(Date.UTC(+data.substring(0,4), +data.substring(5,7) - 1, +data.substring(8,10), 0, 0, 0));
            const dataFormatada = dataISO.toISOString();

            const dados = {
                dataAgendamento: dataFormatada,
                descricao: descricao,
                clienteId: idDoCliente
            };

            fetch(urlBase, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        console.error("Response status: " + response.status);
                        throw new Error("Response not ok");
                    }
                })
                .then(dados => {
                    listarAgendamentos();
                    alert("Agendamento cadastrado com sucesso");
                    limparCampos();
                })
                .catch(error => {
                    console.error("Erro ao cadastrar agendamento: " + error);
                    alert("Algo deu errado");
                });
        });
}

function adicionarCliqueBotoesLinhas() {
    const botoesApagar = document.getElementsByClassName("botao-apagar");

    for (let i = 0; i < botoesApagar.length; i++) {
        const botaoApagar = botoesApagar[i];

        botaoApagar.addEventListener("click", () => {
            idSelecionadoParaApagar = botaoApagar.getAttribute("agendamento-id");
            modal.showModal();
        });
    }

    const botoesEditar = document.getElementsByClassName("botao-editar");

    for (let i = 0; i < botoesEditar.length; i++) {
        const botaoEditar = botoesEditar[i];

        botaoEditar.addEventListener("click", preencherCamposParaEditar);
    }

    const fecharModal = document.getElementById("fechar-modal");
    if (fecharModal) {
        fecharModal.addEventListener("click", () => {
            modal.close();
            idSelecionadoParaApagar = null;
        });
    }

    const botaoConfirmar = document.getElementById("confirmar-modal");
    if (botaoConfirmar) {
        botaoConfirmar.addEventListener("click", () => {
            apagarAgendamento(idSelecionadoParaApagar);
            modal.close();
        });
    }
}

function apagarAgendamento(id) {
    const url = `${urlBase}/${id}`;

    fetch(url, {
        method: "DELETE"
    })
        .then(response => {
            if (response.status === 204 || response.status === 200) {
                alert("Agendamento apagado com sucesso");
                listarAgendamentos();
            } else {
                alert("Não foi possível apagar o agendamento");
            }
        })
        .catch(error => {
            console.error("Erro ao apagar agendamento: " + error);
            alert("Ocorreu um erro ao tentar apagar o agendamento");
        });
}

function editarAgendamento(cliente, descricao, data) {
    const urlClientes = "https://api.franciscosensaulas.com/api/v1/mecanica/clientes";

    fetch(urlClientes)
        .then(response => response.json())
        .then(clientes => {
            let idDoCliente = 0;

            for (let i = 0; i < clientes.length; i++) {
                const c = clientes[i];
                if (c.nome === cliente) {
                    idDoCliente = c.id;
                }
            }

            const url = `${urlBase}/${idParaEditar}`;

            const dados = {
                clienteId: idDoCliente,
                descricao: descricao,
                dataAgendamento: new Date(Date.UTC(+data.substring(0,4), +data.substring(5,7) - 1, +data.substring(8,10), 0, 0, 0)).toISOString()
            };

            fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        console.error("Response status: " + response.status);
                        throw new Error("Response not ok");
                    }
                })
                .then(() => {
                    alert("Agendamento atualizado com sucesso");
                    limparCampos();
                    listarAgendamentos();
                })
                .catch(error => {
                    console.error("Erro ao editar agendamento: " + error);
                    alert("Ocorreu um erro ao tentar alterar o agendamento");
                });
        });
}

function preencherCamposParaEditar(evento) {
    const botaoEditar = evento.target;

    idParaEditar = botaoEditar.getAttribute("agendamento-id");

    const url = `${urlBase}/${idParaEditar}`;

    fetch(url)
        .then(response => response.json())
        .then(agendamento => {
            if (agendamento.cliente != null) {
                campoCliente.value = agendamento.cliente.nome;
            } else {
                campoCliente.value = "";
            }
            campoDescricao.value = agendamento.descricao;
            var dataISO = agendamento.dataAgendamento;
            var dataFormatada = dataISO.substring(0, 10);
            campoData.value = dataFormatada;
        })
        .catch(error => {
            console.error("Erro ao buscar agendamento para edição: " + error);
            alert("Ocorreu um erro ao tentar buscar o agendamento");
        });
}

listarAgendamentos();
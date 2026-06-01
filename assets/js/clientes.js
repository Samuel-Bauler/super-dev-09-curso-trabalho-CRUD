const corpoTabela = document.getElementById("clientes");
const urlBase = "https://api.franciscosensaulas.com/api/v1/mecanica/clientes";

const botaoCadastrar = document.getElementById("botao-cadastrar");
botaoCadastrar.addEventListener("click", validarECadastro);

const campoNome = document.getElementById("nome");
const campoTelefone = document.getElementById("telefone");

campoNome.addEventListener("keydown", function(evento) {
    if (evento.key === "Enter") {
        validarECadastro(evento);
    }
});

campoTelefone.addEventListener("keydown", function(evento) {
    if (evento.key === "Enter") {
        validarECadastro(evento);
    }
});

let idParaEditar = -1;
let idSelecionadoParaApagar = null;

function validarECadastro(evento){
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const telefone = campoTelefone.value.trim();

    if(nome.length < 4){
        alert("Cliente deve conter no minimo 4 caracteres");
        return;
    }
    if(telefone.length < 1){
        alert("Telefone nao pode estar vazio");
        return;
    }

    if (idParaEditar === -1) {
        cadastrarCliente();
    } else {
        editarCliente(nome, telefone);
    }
}

function limparCampos() {
    campoNome.value = "";
    campoTelefone.value = "";

    idParaEditar = -1;
}

function listarClientes() {
    corpoTabela.innerHTML = "";

    fetch(urlBase)
        .then(response => response.json())
        .then(clientes => {
            for (let i = 0; i < clientes.length; i++) {
                const cliente = clientes[i];
                criarLinha(cliente);
            }
            adicionarCliqueBotoesLinhas();
        })
        .catch(error => {
            console.error("Erro ao listar clientes: " + error);
            alert("Ocorreu um erro ao tentar listar os clientes");
        });
}

function criarLinha(cliente) {
    const linha = `<tr>
    <td>${cliente.id}</td>
    <td>${cliente.nome}</td>
    <td>${cliente.telefone}</td>
    <td>
        <button class="botao-editar" cliente-id="${cliente.id}">Editar</button>
        <button class="botao-apagar" cliente-id="${cliente.id}">Apagar</button>
    </td>
</tr>`;

    const botaoConfirmar = `
    <h2>⚠️</h2>
    <p>DESEJA APAGAR O CLIENTE?</p>
    <button id="fechar-modal">Cancelar</button>
    <button id="confirmar-modal" cliente-id="${cliente.id}">Confirmar</button>`;

    const modalConfirmar = document.getElementsByClassName("modal-conteudo")[0];

    corpoTabela.innerHTML = corpoTabela.innerHTML + linha;

    if (modalConfirmar) {
        modalConfirmar.innerHTML = botaoConfirmar;
    }
}

function cadastrarCliente(){
    const url = "https://api.franciscosensaulas.com/api/v1/mecanica/clientes";

    const nome = campoNome.value.trim();
    const telefone = campoTelefone.value.trim();

    const dados = {
        nome: nome,
        telefone: telefone
    };

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    })
        .then(response => {
            if (response.status === 201) {
                return response.json();
            }
        })
        .then(dados => {
            listarClientes();
            alert("Cliente cadastrado com sucesso");
            limparCampos();
        })
        .catch(error => {
            console.error("Erro ao cadastrar cliente: " + error);
            alert("Algo deu errado");
        });
}

function adicionarCliqueBotoesLinhas() {
    const botoesApagar = document.getElementsByClassName("botao-apagar");

    for (let i = 0; i < botoesApagar.length; i++) {
        const botaoApagar = botoesApagar[i];

        botaoApagar.addEventListener("click", () => {
            idSelecionadoParaApagar = botaoApagar.getAttribute("cliente-id");
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
            apagarCliente(idSelecionadoParaApagar);
            modal.close();
        });
    }
}

function apagarCliente(id) {
    const url = `${urlBase}/${id}`;

    fetch(url, {
        method: "DELETE"
    })
        .then(response => {
            if (response.status === 204 || response.status === 200) {
                alert("Cliente apagado com sucesso");
                listarClientes();
            } else {
                alert("Nao foi possivel apagar o cliente");
            }
        })
        .catch(error => {
            console.error("Erro ao apagar cliente: " + error);
            alert("Ocorreu um erro ao tentar apagar o cliente");
        });
}

function editarCliente(nome, telefone) {
    const url = `${urlBase}/${idParaEditar}`;

    const dados = {
        nome: nome,
        telefone: telefone
    };

    fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    })
        .then(response => {
            if (response.status === 204 || response.status === 200) {
                alert("Cliente atualizado com sucesso");
                limparCampos();
                listarClientes();
            } else if (response.status === 404) {
                alert("Nao foi possivel encontrar o cliente");
            } else {
                alert("Nao foi possivel atualizar o cliente");
            }
        })
        .catch(error => {
            console.error("Erro ao editar cliente: " + error);
            alert("Ocorreu um erro ao tentar alterar o cliente");
        });
}

function preencherCamposParaEditar(evento) {
    const botaoEditar = evento.target;

    idParaEditar = botaoEditar.getAttribute("cliente-id");

    const url = `${urlBase}/${idParaEditar}`;

    fetch(url)
        .then(response => response.json())
        .then(cliente => {
            campoNome.value = cliente.nome;
            campoTelefone.value = cliente.telefone;
        })
        .catch(error => {
            console.error("Erro ao buscar cliente para edicao: " + error);
            alert("Ocorreu um erro ao tentar buscar o cliente");
        });
}

listarClientes();
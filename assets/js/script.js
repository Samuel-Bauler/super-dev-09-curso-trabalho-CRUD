const divClientes = document.getElementById("clientes-card");
divClientes.addEventListener("click", abrirTelaClientes);

const divAgendamentos = document.getElementById("agendamentos-card");
divAgendamentos.addEventListener("click", abrirTelaAgendamentos);

function abrirTelaClientes() {
    window.location.href = "clientes.html"
}

function abrirTelaAgendamentos() {
    window.location.href = "agendamentos.html"
}

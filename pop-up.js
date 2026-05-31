const abrirBtn = document.getElementById('abrirModal');
const fecharBtn = document.getElementById('fecharModal');
const modal = document.getElementById('meuModal');

// Abrir o modal
abrirBtn.addEventListener('click', () => {
  modal.showModal(); // Método nativo para abrir modais
});

// Fechar o modal
fecharBtn.addEventListener('click', () => {
  modal.close(); // Método nativo para fechar modais
});

// Fecha ao clicar fora da caixa do modal (no fundo escuro)
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.close();
  }
});

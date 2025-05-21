let userData = {name: ''}

// Verifica se existe um token válido na sessão
const verificarLogin = async () => {
  const token = sessionStorage.getItem("token");
  // Se não houver token, redireciona para login
  if (!token) window.location.href = "index.html";

  try {
    // Chama a API para validar o token
    const response = await fetch("http://localhost:3000/api/user/verificar-token", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    userData = data.user;

    // Se a API indicar falha, remove token e redireciona
    if (!data.success) {
      sessionStorage.removeItem("token");
      window.location.href = "index.html";
    }
  } catch {
    // Em caso de erro na requisição, limpa sessão e redireciona
    sessionStorage.removeItem("token");
    window.location.href = "index.html";
  }
};


// Dados de exemplo para as listas (simulando resposta da API)
const listas = [
  { id: 1, titulo: "Compras do mês", dataCriacao: "2025-04-20", qtdItens: 12 },
  { id: 2, titulo: "Tarefas da semana", dataCriacao: "2025-04-22", qtdItens: 5 },
  { id: 3, titulo: "Livros para ler", dataCriacao: "2025-04-25", qtdItens: 8 }
];

// Função para inicializar a página
async function inicializarPagina() {

  await verificarLogin()
  // Atualiza dados do usuário na interface
  document.getElementById('userName').textContent = userData.name;

  // Define as iniciais do usuário para o ícone
  document.getElementById('userInitials').textContent = userData.name.split(' ').map(n => n[0]).join('');

  // Carrega as listas
  carregarListas();

  // Configura eventos de botões
  document.getElementById('btnNovaLista').addEventListener('click', criarNovaLista);
  document.getElementById('btnConvites').addEventListener('click', verConvites);
  document.getElementById('btnConfig').addEventListener('click', abrirConfiguracoes);
}

// Função para carregar as listas
function carregarListas() {
  const container = document.getElementById('listsContainer');
  const emptyMessage = document.getElementById('emptyMessage');

  // Verifica se existem listas
  if (listas.length > 0) {
    // Oculta a mensagem de vazio
    emptyMessage.style.display = 'none';

    // Limpa o container
    container.innerHTML = '';

    // Adiciona cada lista ao container
    listas.forEach(lista => {
      const listItem = document.createElement('div');
      listItem.className = 'list-item';
      listItem.innerHTML = `
                        <div>
                            <strong>${lista.titulo}</strong>
                            <div style="color: #888; font-size: 0.8em;">
                                Criada em: ${formatarData(lista.dataCriacao)} • ${lista.qtdItens} itens
                            </div>
                        </div>
                        <button class="btn" onclick="abrirLista(${lista.id})">Abrir</button>
                    `;
      container.appendChild(listItem);
    });
  } else {
    // Mostra a mensagem de vazio
    emptyMessage.style.display = 'block';
    container.innerHTML = '';
  }
}

// Função para formatar a data
function formatarData(dataString) {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
}

// Funções de interação (seriam implementadas completamente em um sistema real)
function criarNovaLista() {
  alert("Funcionalidade de criar nova lista será implementada em breve!");
  // Aqui você redirecionaria para uma página de criação de lista
  // window.location.href = '/nova-lista.html';
}

function verConvites() {
  alert("Funcionalidade de convites será implementada em breve!");
  // window.location.href = '/convites.html';
}

function abrirConfiguracoes() {
  alert("Funcionalidade de configurações será implementada em breve!");
  // window.location.href = '/configuracoes.html';
}

function abrirLista(id) {
  alert(`Abrindo lista ${id}...`);
  // window.location.href = `/lista.html?id=${id}`;
}



// Inicializa a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarPagina);
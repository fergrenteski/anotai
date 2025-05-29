import {authFetch} from "./utils/authFetch.js";
import {notificar} from "./utils/notification.js";
import {confirmModal} from "./utils/confirmModal.js";

// Variáveis
let appState = null;
let imagemFoiRemovida = false;

// Elemento raiz da aplicação
const appElement = document.getElementById('app');

async function initializeAppState(currentView, activeTab) {
    imagemFoiRemovida = false;
    appState = {
        currentView: currentView,
        activeTab: activeTab,
    };
}



// Função principal para renderizar a interface
function renderApp() {
    // Limpa o conteúdo atual
    appElement.innerHTML = '';

    renderTabs();

    // Renderiza a view atual
    switch (appState.currentView) {
        case "geral":
            if (appState.activeTab === "profile") {
                renderProfile();
            } else {
                renderAlterarsenha();
            }
            break;
        default:
            renderProfile();
    }
}

// Renderizar as abas
function renderTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs';

    const meuPerfilTab = document.createElement('div');
    meuPerfilTab.className = `tab ${appState.activeTab === 'profile' ? 'active' : ''}`;
    meuPerfilTab.textContent = 'Meus Perfil';
    meuPerfilTab.addEventListener('click', () => {
        startApp("geral", 'profile');
    });
    tabsContainer.appendChild(meuPerfilTab);

    const convitesTab = document.createElement('div');
    convitesTab.className = `tab ${appState.activeTab === 'senha' ? 'active' : ''}`;
    convitesTab.textContent = `Alterar Senha`;
    convitesTab.addEventListener('click', () => {
        startApp("geral", 'senha');
    });
    tabsContainer.appendChild(convitesTab);

    appElement.appendChild(tabsContainer);
}


/**
 * Função para Inicializar o Estado da Aplicação
 * @param currentView
 * @param activeTab
 * @returns {Promise<void>}
 */
async function startApp(currentView = "geral", activeTab = "profile") {
    await initializeAppState(currentView, activeTab);
    renderApp();
}

function previewImage(event) {
    const input = event.target;
    const image = document.getElementById('profileImage');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        imagemFoiRemovida = false;
        reader.onload = function(e) {
            image.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function renderProfile() {

    const resposta = await authFetch("http://localhost:3000/api/user/profile");
    const user = resposta.data;

    // Título
    const h1 = document.createElement('h2');
    h1.textContent = 'Perfil';
    h1.style.textAlign = 'center';
    h1.style.marginBottom = '20px';
    appElement.appendChild(h1);

    // Formulário principal
    const formDiv = document.createElement('div');
    formDiv.className = 'profile-form';

    // Foto de perfil
    const pictureDiv = document.createElement('div');
    pictureDiv.className = 'profile-picture';

    const img = document.createElement("img");
    img.id = 'profileImage';
    img.src = user.image || 'https://www.svgrepo.com/show/452030/avatar-default.svg';

    const labelUpload = document.createElement('label');
    labelUpload.className = 'upload-btn';
    labelUpload.textContent = 'Alterar Foto';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.id = 'file-input';

    fileInput.addEventListener('change',  (e) => {
        previewImage(e);
    })

    const buttonDiv = document.createElement('div');
    buttonDiv.style.display = 'flex';
    buttonDiv.style.gap = '10px';


    const faIcon = document.createElement('i');
    faIcon.classList.add('fa-solid');
    faIcon.classList.add('fa-trash');
    faIcon.classList.add('fa-xl');
    faIcon.style.color = '#e12424';
    // Adiciona o shake
    faIcon.addEventListener('mouseover', () => {
        faIcon.classList.add('fa-bounce');
    });

    // Remove o Shake
    faIcon.addEventListener('mouseleave', () => {
        faIcon.classList.remove('fa-bounce');
    });

    // Cria botão de delete
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.id = 'delete-button';
    deleteButton.appendChild(faIcon);
    deleteButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await deleteProfileImage();
    })

    labelUpload.appendChild(fileInput);
    pictureDiv.appendChild(img);
    buttonDiv.appendChild(labelUpload);
    buttonDiv.appendChild(deleteButton);
    pictureDiv.appendChild(buttonDiv);

    // Campos de texto
    const fieldsDiv = document.createElement('form');
    fieldsDiv.className = 'profile-fields';
    fieldsDiv.method = 'POST';

    const labelNome = document.createElement('label');
    labelNome.htmlFor = 'bio-nome';
    labelNome.textContent = ' Alterar Nome';

    const inputNome = document.createElement('input');
    inputNome.type = 'text';
    inputNome.placeholder = 'Digite seu nome';
    inputNome.id = 'bio-nome';
    inputNome.value = user.name;
    inputNome.required = true;

    const labelBio = document.createElement('label');
    labelBio.htmlFor = 'bio-texto';
    labelBio.textContent = 'Bio';

    const inputBio = document.createElement('input');
    inputBio.placeholder = 'Digite uma descrição sobre você';
    inputBio.id = 'bio-texto';
    inputBio.value = user.bio;

    const buttonSalvar = document.createElement('button');
    buttonSalvar.className = 'save-btn';
    buttonSalvar.style.width = '100%';
    buttonSalvar.id = 'salvarPerfil';
    buttonSalvar.textContent = 'Salvar';
    fieldsDiv.addEventListener('submit', async (e) => {
        e.preventDefault()
        e.stopPropagation();
        await PersistProfile(img);
    })

    fieldsDiv.appendChild(labelNome);
    fieldsDiv.appendChild(inputNome);
    fieldsDiv.appendChild(labelBio);
    fieldsDiv.appendChild(inputBio);
    fieldsDiv.appendChild(buttonSalvar);

    // Montar tudo
    formDiv.appendChild(pictureDiv);
    formDiv.appendChild(fieldsDiv);

    appElement.appendChild(formDiv);
}

async function renderAlterarsenha() {
    appElement.innerHTML = '';       // Limpa a tela
renderTabs();                    // Adiciona as abas (Meus Perfil / Alterar Senha)

const formContainer = document.createElement('div'); 

    formContainer.className = 'profile-form';

    // Título centralizado (mesmo padrão de "Perfil")
const h1 = document.createElement('h2');
h1.textContent = 'Alteração de Senha';
h1.style.textAlign = 'center';
h1.style.marginBottom = '20px';
appElement.appendChild(h1);


    const form = document.createElement('form');
    form.className = 'profile-fields';

    // Campos
    const currentLabel = document.createElement('label');
    currentLabel.textContent = 'Senha Atual';
    const currentInput = document.createElement('input');
    currentInput.type = 'password';
    currentInput.required = true;

    const newLabel = document.createElement('label');
    newLabel.textContent = 'Nova Senha';
    const newInput = document.createElement('input');
    newInput.type = 'password';
    newInput.required = true;

    const confirmLabel = document.createElement('label');
    confirmLabel.textContent = 'Confirmar Nova Senha';
    const confirmInput = document.createElement('input');
    confirmInput.type = 'password';
    confirmInput.required = true;

    // Requisitos visuais
    const requisitos = document.createElement('div');
    requisitos.style.fontSize = '14px';
    requisitos.innerHTML = `
        <p id="length" style="color:red">❌ Pelo menos 8 caracteres</p>
        <p id="uppercase" style="color:red">❌ Pelo menos 1 letra maiúscula</p>
        <p id="number" style="color:red">❌ Pelo menos 1 número</p>
        <p id="special" style="color:red">❌ Pelo menos 1 caractere especial</p>
    `;

    newInput.addEventListener('input', () => {
        const senha = newInput.value;
        document.getElementById('length').style.color = senha.length >= 8 ? 'green' : 'red';
        document.getElementById('length').textContent = senha.length >= 8 ? '✔ Pelo menos 8 caracteres' : '❌ Pelo menos 8 caracteres';
        document.getElementById('uppercase').style.color = /[A-Z]/.test(senha) ? 'green' : 'red';
        document.getElementById('uppercase').textContent = /[A-Z]/.test(senha) ? '✔ Pelo menos 1 letra maiúscula' : '❌ Pelo menos 1 letra maiúscula';
        document.getElementById('number').style.color = /[0-9]/.test(senha) ? 'green' : 'red';
        document.getElementById('number').textContent = /[0-9]/.test(senha) ? '✔ Pelo menos 1 número' : '❌ Pelo menos 1 número';
        document.getElementById('special').style.color = /[!@#$%^&*(),.?":{}|<>]/.test(senha) ? 'green' : 'red';
        document.getElementById('special').textContent = /[!@#$%^&*(),.?":{}|<>]/.test(senha) ? '✔ Pelo menos 1 caractere especial' : '❌ Pelo menos 1 caractere especial';
    });

    // Botão
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Salvar Nova Senha';
    submitBtn.className = 'save-btn';
    submitBtn.style.width = '100%';

    form.onsubmit = async (e) => {
        e.preventDefault();

        if (newInput.value !== confirmInput.value) {
            notificar('As senhas não coincidem');
            return;
        }

        const senha = newInput.value;
        if (
            senha.length < 8 ||
            !/[A-Z]/.test(senha) ||
            !/[0-9]/.test(senha) ||
            !/[!@#$%^&*(),.?":{}|<>]/.test(senha)
        ) {
            notificar('A nova senha não atende aos requisitos!');
            return;
        }

        const body = {
            senhaAtual: currentInput.value,
            novaSenha: newInput.value,
        };

        await authFetch('http://localhost:3000/api/user/alterar-senha', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        }).then(data => {
            notificar(data.message || 'Senha alterada com sucesso!');
            startApp('geral', 'profile');
        });
    };

    form.append(currentLabel, currentInput, newLabel, newInput, confirmLabel, confirmInput, requisitos, submitBtn);

    formContainer.appendChild(form);
    appElement.appendChild(formContainer);
}

async function deleteProfileImage() {
    const img = document.getElementById('profileImage');
    await confirmModal("Tem certeza que deseja remover a imagem de perfil?")
        .then(resposta => {
            if(resposta) {
                img.src = "https://www.svgrepo.com/show/452030/avatar-default.svg";
                imagemFoiRemovida = true; // indica que foi removida
            }
        });
}

async function PersistProfile() {

    const img = document.getElementById('profileImage').src;
    const name = document.getElementById('bio-nome').value;
    const bio = document.getElementById('bio-texto').value;
    const dataUrl =  imagemFoiRemovida ? null : img;

    // Se for imagem válida, converte
    let file = null;
    // Verifica se possui imagem
    if (dataUrl && dataUrl.startsWith('data:image')) {
        const blob = await fetch(dataUrl).then(async res => await res.blob());
        file = await new File([blob], "profile.png", { type: blob.type });
    }
    // Cria o FormData
    const formData = await new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    if (file) {
        formData.append("image", file);
    }

    await confirmModal(`Tem certeza que deseja salvar o Perfil?`)
        .then(async resposta => {
            if(resposta) {
                await authFetch('http://localhost:3000/api/user/profile', {
                    method: "PUT",
                    body: formData
                }).then(data => {
                    localStorage.removeItem('user');
                    notificar(data.message);
                });
                await startApp( "geral", "profile")
            }
        });
}


document.addEventListener('DOMContentLoaded', async () => {
    await startApp(); // Chama o start
});
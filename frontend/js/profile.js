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
    renderLogoutButon();

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

function renderLogoutButon() {
    const div = document.getElementById('userArea');
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-right-from-bracket';
    div.appendChild(icon);

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

    const labelGenero = document.createElement('label');
    labelGenero.htmlFor = 'bio-genero';
    labelGenero.textContent = ' Alterar Gênero';

    const inputGenero = document.createElement('input');
    inputGenero.type = 'text';
    inputGenero.placeholder = 'Digite seu gênero';
    inputGenero.id = 'bio-genero';
    inputGenero.value = user.genero || '';

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
    fieldsDiv.appendChild(labelGenero);
    fieldsDiv.appendChild(inputGenero);
    fieldsDiv.appendChild(buttonSalvar);

    // Montar tudo
    formDiv.appendChild(pictureDiv);
    formDiv.appendChild(fieldsDiv);

    appElement.appendChild(formDiv);
}

async function renderAlterarsenha() {
    notificar('Alterar senha ainda não implementado');
    startApp('geral', 'profile');
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
    const genero = document.getElementById('bio-genero').value;
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
    formData.append("genero", genero);
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
                    sessionStorage.removeItem('user');
                    notificar(data.message);
                });
                await startApp( "geral", "profile")
            }
        });
}


document.addEventListener('DOMContentLoaded', async () => {
    await startApp(); // Chama o start
});
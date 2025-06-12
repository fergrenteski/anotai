import {authFetch} from "./authFetch.js";

export async function loadUserProfile() {
    let localUser = sessionStorage.getItem("user");

    // Verifica se possui localUser
    if (!localUser) {
        try {
            // Busca e popula informações no Local Storage
            const resposta = await authFetch("http://localhost:3000/api/user/profile");
            resposta.data.image = resposta.data.image || 'https://www.svgrepo.com/show/452030/avatar-default.svg';
            sessionStorage.setItem('user', JSON.stringify(resposta.data));
            localUser = resposta.data;
        } catch {
            sessionStorage.removeItem('user');
            return;
        }
    } else {
        localUser = JSON.parse(localUser); // <-- aqui!
    }

    // Cria a imagem de perfil
    const image = document.createElement("img");
    image.alt = 'Foto de perfil';
    image.src = localUser.image

    // Adiciona no HTML
    document.getElementById('userName').textContent = localUser.name;
    document.getElementById('userInitials').appendChild(image);

    return localUser;
}
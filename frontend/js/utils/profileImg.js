import {authFetch} from "./authFetch.js";

export async function getProfileImgElement() {
    const localImg = localStorage.getItem("profileImg");

    const image = document.createElement("img");
    image.alt = 'Foto de perfil';
    image.src = localImg ? localImg : 'https://www.svgrepo.com/show/452030/avatar-default.svg';

    if(!localImg) {
        await authFetch("http://localhost:3000/api/user/profile")
            .then(resposta => {
                if(resposta.data.image) {
                    image.src = resposta.data.image;
                    localStorage.setItem('profileImg', image.src);
                }
            }).catch(() => {
                localStorage.removeItem('profileImg');
            });
    }
    return image;
}
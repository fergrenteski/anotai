import {modal} from "./modal.js";

/**
 * Faz uma requisição fetch com token de autenticação e tratamento de erros padrão.
 * @param {string} url - URL da API.
 * @param {object} options - Configurações da requisição (headers, method, body, etc).
 * @returns {Promise<any>} - Retorna a resposta em JSON ou undefined em caso de erro.
 */
export function authFetch(url, options = {}) {
    const token = sessionStorage.getItem('token') || '';

    const isFormData = options.body instanceof FormData;

    const defaultHeaders = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(!isFormData && { 'Content-Type': 'application/json' })
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {})
        }
    };

    let response;

    return fetch(url, config)
        .then(res => {
            response = res;
            return res.json().catch(err => {
                modal('Resposta inválida do servidor.');
                throw err;
            });
        })
        .then(data => {
            if (!data.success) {
                const err = new Error(data.message);
                err.status = response.status;
                throw err;
            }
            return data;
        })
        .catch(err => {
            modal(err.message).then(() => {
                if(err.status === 401 || err.status === 403) {
                    window.location.href = 'index.html';
                }
            });
            throw err;
        });
}

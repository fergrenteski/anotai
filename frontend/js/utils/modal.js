/**
 * Exibe uma modal com texto e um botão "Fechar".
 * Retorna uma Promise que resolve quando o botão é clicado.
 * @param {string} mensagem - Texto a ser exibido na modal.
 * @returns {Promise<void>}
 */
export function modal(mensagem) {
    return new Promise((resolve) => {
        // Cria o overlay (fundo escuro)
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0'
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '10000';

        // Cria a caixa da modal
        const modal = document.createElement('div');
        modal.style.backgroundColor = '#fff';
        modal.style.padding = '20px';
        modal.style.borderRadius = '8px';
        modal.style.width = '320px';
        modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        modal.style.textAlign = 'center';
        modal.style.fontFamily = 'Arial, sans-serif';

        // Texto da mensagem
        const texto = document.createElement('p');
        texto.textContent = mensagem;
        texto.style.marginBottom = '20px';

        // Botão Fechar
        const btnFechar = document.createElement('button');
        btnFechar.textContent = 'Fechar';
        btnFechar.style.padding = '8px 16px';
        btnFechar.style.border = 'none';
        btnFechar.style.borderRadius = '4px';
        btnFechar.style.backgroundColor = '#2196F3';
        btnFechar.style.color = '#fff';
        btnFechar.style.cursor = 'pointer';
        btnFechar.style.fontSize = '16px';

        // Evento do botão Fechar
        btnFechar.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve();
        });

        // Monta a modal
        modal.appendChild(texto);
        modal.appendChild(btnFechar);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    });
}

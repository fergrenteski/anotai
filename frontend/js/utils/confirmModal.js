/**
 * Exibe uma modal com texto e botões "Sim" e "Não".
 * Retorna uma Promise que resolve para true (Sim) ou false (Não).
 * @param {string} mensagem - Texto a ser exibido na modal.
 * @returns {Promise<boolean>}
 */
export function confirmModal(mensagem) {
    return new Promise((resolve) => {
        // Cria o overlay (fundo escuro)
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
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

        // Botão Sim
        const btnSim = document.createElement('button');
        btnSim.textContent = 'Sim';
        btnSim.style.marginRight = '10px';
        btnSim.style.padding = '8px 16px';
        btnSim.style.border = 'none';
        btnSim.style.borderRadius = '4px';
        btnSim.style.backgroundColor = '#4CAF50';
        btnSim.style.color = '#fff';
        btnSim.style.cursor = 'pointer';
        btnSim.style.fontSize = '16px';

        // Botão Não
        const btnNao = document.createElement('button');
        btnNao.textContent = 'Não';
        btnNao.style.padding = '8px 16px';
        btnNao.style.border = 'none';
        btnNao.style.borderRadius = '4px';
        btnNao.style.backgroundColor = '#f44336';
        btnNao.style.color = '#fff';
        btnNao.style.cursor = 'pointer';
        btnNao.style.fontSize = '16px';

        // Eventos dos botões
        btnSim.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });

        btnNao.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });

        // Monta a modal
        modal.appendChild(texto);
        modal.appendChild(btnSim);
        modal.appendChild(btnNao);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    });
}

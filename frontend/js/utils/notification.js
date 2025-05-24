/**
 * Exibe uma notificação no canto superior direito com texto, botão "Fechar"
 * e uma barra de progresso que desaparece após um timeout.
 * @param {string} mensagem - Texto a ser exibido na notificação.
 * @returns {Promise<void>}
 */
export function notificar(mensagem) {
    const duracao = 5000; // 5 segundos

    return new Promise((resolve) => {
        // Container da notificação
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.backgroundColor = '#fff';
        container.style.padding = '16px';
        container.style.borderRadius = '8px';
        container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        container.style.width = '300px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.zIndex = '10000';

        // Texto da notificação
        const texto = document.createElement('p');
        texto.textContent = mensagem;
        texto.style.margin = '0 0 12px 0';

        // Barra de progresso
        const progresso = document.createElement('div');
        progresso.style.height = '4px';
        progresso.style.backgroundColor = '#2196F3';
        progresso.style.transition = `width ${duracao}ms linear`;
        progresso.style.width = '100%';
        progresso.style.borderRadius = '2px';
        progresso.style.marginTop = '8px';

        // Botão Fechar
        const btnFechar = document.createElement('button');
        btnFechar.textContent = '×';
        btnFechar.style.padding = '6px';
        btnFechar.style.border = 'none';
        btnFechar.style.borderRadius = '4px';
        btnFechar.style.color = '#3f3f3f';
        btnFechar.style.cursor = 'pointer';
        btnFechar.style.fontSize = '14px';
        btnFechar.style.position = 'absolute';
        btnFechar.style.top = '2px';
        btnFechar.style.right = '6px';

        // Evento do botão Fechar
        btnFechar.addEventListener('click', () => {
            document.body.removeChild(container);
            clearTimeout(timeout);
            resolve();
        });

        // Inicia animação da barra de progresso
        setTimeout(() => {
            progresso.style.width = '0%';
        }, 10); // pequeno atraso para permitir transição

        // Timeout automático
        const timeout = setTimeout(() => {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
                resolve();
            }
        }, duracao);

        // Monta a notificação
        container.appendChild(texto);
        container.appendChild(btnFechar);
        container.appendChild(progresso);
        document.body.appendChild(container);
    });
}

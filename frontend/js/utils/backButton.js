/**
 * Cria Botão de Voltar.
 * @returns {HTMLButtonElement}
 */
export function getBackButton() {
    // Botão voltar
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Voltar';
    backBtn.classList.add('return-btn');

    return backBtn;
}
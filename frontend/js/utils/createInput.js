/**
 * Função para criar o Input
 * @param type Tipo do Input
 * @param id Identificador do Input
 * @param placeholder Placeholder do Input
 * @param value Valor do Input
 * @param required Obrigatório
 * @param disabled Desabilitado
 * @returns {HTMLInputElement} Elemento Input
 */
export function createInput(type = 'text', id, placeholder = '', value = '', required = false, disabled = false) {
    const input = document.createElement('input');
    if(id) input.id = id;
    input.type = type;
    input.placeholder = placeholder;
    input.value = value;
    input.required = required;
    input.disabled = disabled;

    return input;
}
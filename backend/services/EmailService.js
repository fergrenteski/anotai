// Importa bibliotecas e funçöes:
const sgMail = require('@sendgrid/mail');
const { gerarLink } = require("../utils/validators");
require('dotenv').config();

class EmailService {

      // Construtor da classe, configura a API key e define o e-mail remetente
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.senderEmail = process.env.SENDER_EMAIL;
    }

    /**
     * Envia um e-mail de redefinição de senha.
     * @param {string} email - E-mail do usuário.
     * @param {string} token - Token de redefinição de senha.
     * @returns {Promise<Object>} Retorna um objeto indicando o sucesso ou falha do envio.
     */
    async enviarRedefinicaoEmail(email, token) {

        // Gera link de redefinição usando token e e-mail
        const link = gerarLink("confirmPass", email, token);

        // Monta objeto de mensagem para SendGrid
        const msg = {
            to: email, // Destinatário
            from: this.senderEmail, // Remetente configurado
            templateId: process.env.TEMPLATE_ID_RESET_EMAIL, // Modelo de e-mail pré-definido
            dynamicTemplateData: { resetPassUrl: link } // Dados dinâmicos para o template
        };

        try {

            // Envia o e-mail através da API SendGrid
            await sgMail.send(msg);
            console.log("E-mail de redefinição enviado!");
            return { success: true, message: "E-mail de redefinição enviado com sucesso!" };
        } catch (error) {
            // Caso aconteça um erro na aplicação
            // console.error: registra no console detalhes do erro ocorrido, auxiliando no diagnóstico e correção
            console.error("Erro ao enviar e-mail de redefinição:", error);
            return { success: false, message: "Erro ao enviar e-mail de redefinição." };
        }
    }

    /**
     * Envia um e-mail de confirmação de conta.
     * @param {string} email - E-mail do usuário.
     * @param {string} token - Token de confirmação de e-mail.
     * @returns {Promise<Object>} Retorna um objeto indicando o sucesso ou falha do envio.
     */
    async enviarConfirmacaoEmail(email, token) {

        // Gera link de confirmação usando token e e-mail
        const link = gerarLink("confirmEmail", email, token);

        // Monta objeto de mensagem para SendGrid
        const msg = {
            to: email,  // Destinatário
            from: this.senderEmail, // Remetente configurado
            templateId: process.env.TEMPLATE_ID_CONFIRM_EMAIL, // Modelo de e-mail pré-definido
            dynamicTemplateData: { confirmUrl: link } // Dados dinâmicos para o template
        };

        try {

            // Envia o e-mail através da API SendGrid
            await sgMail.send(msg);
            console.log("E-mail de confirmação enviado!");
            return { success: true, message: "E-mail de confirmação enviado com sucesso!" };
        } catch (error) {

            // Caso aconteça um erro na aplicação
            // console.error: registra no console detalhes do erro ocorrido, auxiliando no diagnóstico e correção
            console.error("Erro ao enviar e-mail de confirmação:", error);
            return { success: false, message: "Erro ao enviar e-mail de confirmação." };
        }
    }
}
// Exporta a classe EmailService
module.exports = EmailService;

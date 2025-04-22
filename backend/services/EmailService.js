const sgMail = require('@sendgrid/mail');
const { gerarLink } = require("../utils/validators");
require('dotenv').config();

class EmailService {
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
        const link = gerarLink("confirmPass", email, token);

        const msg = {
            to: email,
            from: this.senderEmail,
            templateId: process.env.TEMPLATE_ID_RESET_EMAIL,
            dynamicTemplateData: { resetPassUrl: link }
        };

        try {
            await sgMail.send(msg);
            console.log("E-mail de redefinição enviado!");
            return { success: true, message: "E-mail de redefinição enviado com sucesso!" };
        } catch (error) {
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
        const link = gerarLink("confirmEmail", email, token);

        const msg = {
            to: email,
            from: this.senderEmail,
            templateId: process.env.TEMPLATE_ID_CONFIRM_EMAIL,
            dynamicTemplateData: { confirmUrl: link }
        };

        try {
            await sgMail.send(msg);
            console.log("E-mail de confirmação enviado!");
            return { success: true, message: "E-mail de confirmação enviado com sucesso!" };
        } catch (error) {
            console.error("Erro ao enviar e-mail de confirmação:", error);
            return { success: false, message: "Erro ao enviar e-mail de confirmação." };
        }
    }
}

module.exports = EmailService;

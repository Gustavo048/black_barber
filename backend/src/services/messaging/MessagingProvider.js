/**
 * Contrato que qualquer provider de mensageria precisa cumprir.
 *
 * Isolar esta interface permite trocar "whatsapp-web.js" por uma API oficial
 * (Meta Cloud API, Twilio, etc.) no futuro alterando apenas a implementacao,
 * sem tocar em controllers/services que dependem do contrato.
 */
class MessagingProvider {
  /** @param {string} phone numero em E.164 sem "+" @param {string} message */
  // eslint-disable-next-line no-unused-vars
  async sendMessage(phone, message) {
    throw new Error('sendMessage() precisa ser implementado pelo provider concreto');
  }

  async isReady() {
    throw new Error('isReady() precisa ser implementado pelo provider concreto');
  }
}

module.exports = MessagingProvider;

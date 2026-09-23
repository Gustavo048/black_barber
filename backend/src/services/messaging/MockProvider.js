const MessagingProvider = require('./MessagingProvider');
const logger = require('../../utils/logger');

/**
 * Provider usado em desenvolvimento/testes: nao envia nada de fato, apenas
 * registra a mensagem no log. Evita depender de uma sessao real do WhatsApp
 * (QR Code) para rodar a aplicacao localmente ou em CI.
 */
class MockProvider extends MessagingProvider {
  async sendMessage(phone, message) {
    logger.info(`[MockProvider] Mensagem simulada para ${phone}:\n${message}`);
    return { success: true, provider: 'mock' };
  }

  async isReady() {
    return true;
  }
}

module.exports = MockProvider;

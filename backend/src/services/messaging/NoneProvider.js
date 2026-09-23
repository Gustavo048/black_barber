const MessagingProvider = require('./MessagingProvider');

/**
 * Provider "sem automacao": usado quando a barbearia ainda nao configurou o
 * whatsapp-web.js (ou nao quer usa-lo). Diferente do MockProvider (que existe
 * so para dev/testes e finge sucesso), este reporta failure de forma
 * consistente para que o controller sempre mostre o link manual de wa.me ao
 * cliente — nunca dizemos "confirmamos pelo WhatsApp" sem ter enviado nada.
 */
class NoneProvider extends MessagingProvider {
  async sendMessage() {
    return { success: false, provider: 'none' };
  }

  async isReady() {
    return false;
  }
}

module.exports = NoneProvider;

const MockProvider = require('./MockProvider');
const NoneProvider = require('./NoneProvider');
const WhatsAppWebProvider = require('./WhatsAppWebProvider');

/**
 * Factory: decide qual provider de mensageria instanciar a partir da env var
 * MESSAGING_PROVIDER. Mantem o resto da aplicacao agnostico a essa escolha.
 *
 * - "whatsapp-web": automacao real via sessao do WhatsApp (producao completa)
 * - "none": sem automacao; sempre mostra o link manual wa.me (producao simples)
 * - "mock": finge sucesso e so loga no console (uso local/dev/testes)
 */
function createMessagingProvider() {
  const providerName = process.env.MESSAGING_PROVIDER || 'none';

  switch (providerName) {
    case 'whatsapp-web':
      return new WhatsAppWebProvider();
    case 'mock':
      return new MockProvider();
    case 'none':
    default:
      return new NoneProvider();
  }
}

module.exports = { createMessagingProvider };

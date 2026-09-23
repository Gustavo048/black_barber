const MessagingProvider = require('./MessagingProvider');
const logger = require('../../utils/logger');

/**
 * Provider real, baseado em whatsapp-web.js. Abre (ou reaproveita) uma sessao
 * do WhatsApp Web autenticada via QR Code e usa essa sessao para enviar
 * confirmacoes e lembretes automaticos.
 *
 * Observacao de arquitetura: a inicializacao do client e feita de forma
 * preguicosa (lazy) e o client fica "engatilhado" em memoria; se a sessao
 * cair, isReady() volta a reportar falso e o chamador pode decidir o que
 * fazer (ex.: cair para o link wa.me de fallback no controller).
 */
class WhatsAppWebProvider extends MessagingProvider {
  constructor() {
    super();
    this._client = null;
    this._ready = false;
    this._initPromise = null;
  }

  _ensureInitialized() {
    if (this._initPromise) return this._initPromise;

    this._initPromise = new Promise((resolve) => {
      // Import tardio: em ambientes onde MESSAGING_PROVIDER=mock, o pacote
      // whatsapp-web.js (que depende de um Chromium headless) nem precisa
      // ser carregado.
      const { Client, LocalAuth } = require('whatsapp-web.js');
      const qrcode = require('qrcode-terminal');

      this._client = new Client({
        authStrategy: new LocalAuth({ clientId: 'barbershop-bot' }),
        puppeteer: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          // Em producao (ver backend/Dockerfile) usamos o Chromium do sistema
          // em vez do binario baixado pelo puppeteer, que e pesado e nem
          // sempre roda em imagens minimas. Em dev local, sem essa env var,
          // cai no Chromium que o puppeteer baixa por padrao.
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        },
      });

      this._client.on('qr', (qr) => {
        logger.info('Escaneie o QR Code abaixo com o WhatsApp da barbearia:');
        qrcode.generate(qr, { small: true });
      });

      this._client.on('ready', () => {
        this._ready = true;
        logger.info('[WhatsAppWebProvider] Sessao do WhatsApp autenticada e pronta.');
        resolve();
      });

      this._client.on('disconnected', (reason) => {
        this._ready = false;
        logger.warn(`[WhatsAppWebProvider] Sessao desconectada: ${reason}`);
      });

      this._client.initialize();
    });

    return this._initPromise;
  }

  async isReady() {
    await this._ensureInitialized();
    return this._ready;
  }

  async sendMessage(phone, message) {
    await this._ensureInitialized();
    if (!this._ready) {
      throw new Error('Sessao do WhatsApp ainda nao esta pronta (QR Code pendente ou desconectado).');
    }
    const chatId = `${phone}@c.us`;
    await this._client.sendMessage(chatId, message);
    return { success: true, provider: 'whatsapp-web' };
  }
}

module.exports = WhatsAppWebProvider;

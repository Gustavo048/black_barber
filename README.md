# Blackline Barbershop — Landing Page + Agendamento + Painel Administrativo

```
barbershop/
├── frontend/   # Next.js 14 (App Router) + Tailwind CSS + Framer Motion
└── backend/    # Node.js + Express, arquitetura em camadas
```

## Arquitetura

**Frontend** (`frontend/`)
- Duas areas separadas via route groups do Next.js (nao mudam a URL, so a organizacao de arquivos):
  - `app/(site)/` — o site publico, com `Navbar` e `Footer` no seu proprio `layout.jsx`:
    - `/` — Hero + cartoes de navegacao rapida (`SectionsNav`)
    - `/servicos` — Servicos e precos
    - `/agendar` — Fluxo de agendamento (calendario → horarios → dados do cliente)
    - `/galeria` — Portfolio de cortes
    - `/equipe` — Barbeiros
    - Contato (endereco, mapa, horario, redes) fica no rodape, presente em todas as paginas do site
  - `app/admin/` — o painel administrativo (`/admin/login`, `/admin`), sem o chrome do site publico
- `components/` — um componente por secao do site (Hero, Services, BookingForm, Calendar, Gallery, Barbers, Footer) e uma pasta separada `components/admin/` para o painel.
- `lib/api.js` — cliente publico (catalogo, disponibilidade, criar agendamento). `lib/adminApi.js` — cliente autenticado do painel (token JWT, trata sessao expirada).
- `data/` — copias locais do catalogo (fallback caso a API esteja fora do ar, e dado inicial para SSR).

**Backend** (`backend/`)
- `routes/` → `controllers/` → `services/` → `repositories/`: cada camada so conhece a camada imediatamente abaixo.
- `services/messaging/` — a automacao de WhatsApp e isolada atras de uma interface (`MessagingProvider`). Providers disponiveis: `WhatsAppWebProvider` (sessao real via `whatsapp-web.js` + QR Code), `NoneProvider` (sem automacao, sempre mostra o link manual wa.me — bom para producao simples) e `MockProvider` (loga no console, uso local/dev). Trocar e so mudar `MESSAGING_PROVIDER` no `.env`.
- `services/schedulerService.js` — job com `node-cron` que varre agendamentos e dispara lembretes automaticos antes do horario marcado.
- `services/availabilityService.js` — fonte unica de verdade sobre o que esta livre (ver secao abaixo).
- `services/reportService.js` — agrega os agendamentos em faturamento/contagens para o painel administrativo.
- `middleware/requireAuth.js` — protege as rotas administrativas com JWT.
- `repositories/bookingRepository.js` — armazenamento em memoria hoje; a interface (`create`, `findById`, `findAll`, `findByDate`, `updateStatus`, ...) foi pensada para ser substituida por um banco real (Postgres/Mongo) sem alterar controllers.
- `tests/` — testes de integracao das rotas com Jest + Supertest.

## Fluxo de agendamento (cliente) e notificação da equipe

- `components/Calendar.jsx` + `components/BookingForm.jsx` implementam um fluxo em 3 passos: **(1)** escolher serviço/profissional e um dia no calendário, **(2)** escolher um horário livre naquele dia (a lista vem de `GET /api/availability`), **(3)** preencher nome/WhatsApp/observações e confirmar. O cliente nunca digita um horário "no escuro".
- Ao confirmar, o backend dispara **duas mensagens**: a confirmação para o cliente (`sendBookingConfirmation`) e um aviso de novo agendamento para a equipe (`sendAdminNotification`, em `services/messagingService.js`). O aviso vai para o telefone do próprio barbeiro (`config/barbers.js`, campo `phone`) se ele tiver um cadastrado, senão cai para `ADMIN_WHATSAPP_NUMBER` (ver `.env.example`).
- Se nenhum dos dois números estiver configurado, a criação do agendamento **não falha** — só fica registrado um aviso no log do servidor.

## Controle de horários

- `config/businessHours.js` define o expediente por dia da semana (seg-sex 09:00-20:00, sábado 09:00-18:00, domingo fechado) — mantenha esse arquivo e o texto do `Footer.jsx` do frontend sincronizados manualmente, já que são dois apps sem módulo compartilhado.
- `services/availabilityService.js` é a fonte única de verdade sobre o que está livre: calcula os horários do dia (respeitando expediente + duração do serviço) e, para cada um, quais barbeiros estão sem conflito. Essa mesma lógica é usada tanto pelo endpoint `GET /api/availability` quanto pela criação do agendamento — não existem duas regras que possam divergir.
- **Conflito** é detectado por sobreposição de intervalos (`início < fim_existente && início_existente < fim`), usando a duração de cada serviço — dois cortes de 40min às 10:00 e 10:20 colidem mesmo sem ter o mesmo horário exato.
- Se o cliente **não escolhe um profissional**, o backend atribui automaticamente o primeiro barbeiro livre no horário pedido (`findAvailableBarber`). Se escolhe um específico e ele estiver ocupado, a API responde `409 Conflict` com uma mensagem clara.
- Isso resolve sobrescrita de agendamento **enquanto houver um único processo Node rodando** (o `InMemoryBookingRepository` é compartilhado em memória). Em produção com mais de uma instância do backend, a checagem de conflito + criação precisaria ser atômica no nível do banco (ex.: transação com `SELECT ... FOR UPDATE` ou uma constraint única em `(barberId, date, time)`), para evitar uma corrida entre dois requests simultâneos.

## Painel administrativo

Área interna da barbearia, separada do site público via route group do Next.js (`app/admin/` não carrega o `Navbar`/`Footer` do site).

- **Login** (`/admin/login`): usuário único (não é uma tabela de usuários), credenciais em `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` no `.env` do backend. Gere o hash com `npm run hash-password -- "sua-senha"` dentro de `backend/`. O login devolve um JWT (`JWT_SECRET`, expira em `JWT_EXPIRES_IN`, padrão 12h) guardado no `localStorage` do navegador.
- **Dashboard** (`/admin`, protegido por `AdminGuard`): filtros por período/profissional/serviço/status, cartões de resumo (faturamento, total de agendamentos, contagem por status), tabelas de faturamento por serviço e por profissional, e a lista de agendamentos com botões para marcar **atendido / cancelado / não compareceu**.
- **Faturamento só conta o que foi marcado como "atendido"** — um agendamento "pendente" ainda pode não acontecer; "cancelado"/"no-show" não geraram receita. É o dono/equipe que marca isso pelo painel depois do atendimento.
- **Snapshot de preço**: o preço e o nome do serviço/profissional são gravados no próprio agendamento no momento da criação (`serviceName`, `servicePrice`, `barberName`) — assim, se você reajustar um preço no catálogo mais tarde, os relatórios de agendamentos passados não mudam retroativamente.
- **Segurança**: todas as rotas administrativas (`GET /api/bookings`, `PATCH /api/bookings/:id/status`, `GET /api/reports/summary`) exigem o header `Authorization: Bearer <token>` via o middleware `requireAuth`. A rota pública `POST /api/bookings` (o cliente criando o agendamento) continua sem autenticação, como deve ser.

## Banco de dados (Neon / Postgres)

- **Sem configurar nada**, o backend continua funcionando com o repositório em memória (`InMemoryBookingRepository`) — bom para dev local e para os testes automatizados, mas os agendamentos somem a cada reinício do servidor.
- **Para persistir de verdade com o Neon**:
  1. Crie um projeto em [neon.com](https://neon.com) e copie a connection string (painel do projeto → *Connection Details*).
  2. Cole em `DATABASE_URL` no `.env` do backend.
  3. Rode `npm run migrate` (dentro de `backend/`) — aplica `sql/schema.sql`, que cria a tabela `bookings`.
  4. Reinicie o backend. Ele detecta `DATABASE_URL` sozinho e passa a usar `PostgresBookingRepository` (log de confirmação aparece no console ao subir).
- **A troca é transparente para o resto do código**: `InMemoryBookingRepository` e `PostgresBookingRepository` implementam exatamente a mesma interface assíncrona (`create`, `findById`, `findAll`, `findByDate`, `findPendingReminders`, `markReminderSent`, `updateStatus`); controllers e services chamam sempre `bookingRepository`, sem saber qual dos dois está ativo.
- **A sobreposição de horário agora é garantida pelo próprio banco**, não só pela aplicação: `sql/schema.sql` cria uma coluna gerada (`time_range`, a janela de tempo do agendamento) e uma **constraint `EXCLUDE USING gist`** que impede, no nível do Postgres, que o mesmo barbeiro tenha dois agendamentos com horário sobreposto — inclusive sob duas requisições simultâneas, que a checagem em memória sozinha não conseguia garantir (essa era a ressalva documentada nas versões anteriores deste projeto). Isso exige a extensão `btree_gist` (`CREATE EXTENSION IF NOT EXISTS btree_gist`, já incluída no schema, e suportada pelo Neon). Se essa constraint recusar um `INSERT` por causa de uma corrida entre requisições, o `PostgresBookingRepository` traduz isso para um `409` amigável — o cliente simplesmente vê "esse horário acabou de ser ocupado", em vez de um erro genérico.
- **Nota sobre fuso horário**: a constraint anti-sobreposição compara agendamentos entre si (sem depender de fuso horário, então essa parte é sempre segura). Já a consulta de lembretes automáticos (`findPendingReminders`) compara contra `now()` do Postgres — se a sessão do banco estiver num fuso diferente do fuso local da barbearia, os lembretes podem disparar na hora errada. Vale conferir isso antes de confiar no lembrete automático em produção.
- **O que eu não consegui testar aqui**: não há acesso à internet neste ambiente para instalar o pacote `pg` nem para conectar a um Postgres real, então validei a lógica assíncrona inteira (disponibilidade, conflito, relatórios) contra o repositório em memória — o comportamento é idêntico, já que os dois implementam a mesma interface — e revisei o SQL manualmente, mas **não rodei `sql/schema.sql` contra um Postgres de verdade**. Rode `npm run migrate` e faça um teste real de dois agendamentos concorrentes antes de confiar 100% nisso em produção.

## Como rodar

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run hash-password -- "sua-senha-de-admin"   # copie a saida para ADMIN_PASSWORD_HASH no .env
npm run dev        # http://localhost:5000
```

Por padrao `MESSAGING_PROVIDER=mock`, entao nenhuma mensagem real e enviada —
o console apenas loga o conteudo. Para ativar o envio real pelo WhatsApp:

1. Instale o Google Chrome/Chromium no ambiente onde o backend vai rodar (dependencia do `whatsapp-web.js`, que controla um navegador headless).
2. Defina `MESSAGING_PROVIDER=whatsapp-web` no `.env`.
3. Rode `npm run dev` e escaneie o QR Code exibido no terminal com o WhatsApp da barbearia.
4. A sessao fica salva localmente (`.wwebjs_auth/`); nas proximas vezes o QR Code nao sera necessario.

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev         # http://localhost:3000
```

Acesse o painel administrativo em `http://localhost:3000/admin/login` com o usuario/senha configurados no `.env` do backend.

## Imagens

O layout referencia imagens em `frontend/public/images/` que precisam ser
substituidas pelas fotos reais da barbearia antes do deploy:

- `hero.jpg` — imagem de fundo da secao inicial
- `gallery/1.jpg` ... `gallery/6.jpg` — portfolio de cortes
- `barbers/rafael.jpg`, `barbers/lucas.jpg`, `barbers/diego.jpg` — fotos da equipe

Prompt sugerido para geracao das imagens (Midjourney, DALL-E, Firefly, etc.):

> Hyper-realistic photography of a modern barbershop interior, dark theme,
> cyberpunk aesthetic, subtle neon lighting in cyan and gold, sleek metallic
> barber chairs with futuristic design, high quality, 8k resolution,
> cinematic lighting.

## Deploy

- **Frontend**: Vercel. Root directory `frontend/`, variavel `NEXT_PUBLIC_API_URL` apontando para a URL publica do backend.
- **Backend**: precisa de um host com processo persistente (nao serverless), porque o `node-cron` do lembrete e a sessao do WhatsApp dependem de um processo sempre rodando. Railway ou Render funcionam bem. Root directory `backend/`.
  - Modo simples (`MESSAGING_PROVIDER=none`): nao precisa de Chromium, sobe como um app Node comum.
  - Modo com automacao real (`MESSAGING_PROVIDER=whatsapp-web`): use o `backend/Dockerfile` incluido (instala o Chromium do sistema) e configure um volume persistente para a pasta `.wwebjs_auth/`, senao a sessao do WhatsApp se perde a cada deploy/reinicio.
- Depois do primeiro deploy do backend, atualize `FRONTEND_URL` (CORS) com a URL da Vercel, e o `NEXT_PUBLIC_API_URL` do frontend com a URL do backend.
- Nao esqueca de definir `DATABASE_URL` (Neon), `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` e `JWT_SECRET` (uma string aleatoria longa, diferente do exemplo) nas variaveis de ambiente de producao, e rode `npm run migrate` uma vez contra o banco de producao antes de expor o painel.
- **Atencao ao Termo de Uso**: o plano gratuito ("Hobby") da Vercel e destinado a projetos pessoais/nao comerciais; para um site de negocio real, o proprio termo da Vercel pede o plano Pro.

## Proximos passos sugeridos

- Trocar o Neon "gratuito" por um plano pago se o volume de agendamentos crescer, e configurar backups automaticos (o Neon oferece point-in-time recovery, vale revisar a retencao do seu plano).
- Se escalar para multiplas instancias do backend, tornar a checagem de conflito + criacao do agendamento atomica no banco (ver nota em "Controle de horarios" acima).
- Se mais de uma pessoa for usar o painel (ex.: cada barbeiro ve so a propria agenda), evoluir de "usuario unico" para uma tabela de usuarios com papeis (admin/barbeiro).

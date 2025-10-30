const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Airtable = require('airtable');

// --- Configuração do Airtable ---
// !! COLE SEU BASE ID AQUI !! (O código que começa com 'app...')
const AIRTABLE_BASE_ID = 'appQpKChWoOGcsHE0'; 
// Seu Token de Acesso Pessoal (você já me deu)
const AIRTABLE_TOKEN = 'pathYHzTgSzO9jWlj.e25f6fb209fb44a7d5d556f7f539b0aa7369a66432e519290eda84821c400a71';
// O nome da sua tabela (como no screenshot)
const AIRTABLE_TABLE_NAME = 'Bot'; 
// Os nomes das suas colunas (como no screenshot)
const COLUNA_RECEBIDO = 'Recebido';
const COLUNA_RESPOSTA = 'Resposta';

// Inicializa o Airtable
const base = new Airtable({ apiKey: AIRTABLE_TOKEN }).base(AIRTABLE_BASE_ID);

// Nosso mapa de respostas agora é dinâmico
let mapaDeRespostas = {};

// --- Funções do Airtable ---

/**
 * Busca todas as regras no Airtable e atualiza o mapa local.
 */
async function carregarRegrasDoAirtable() {
  console.log('Buscando regras no Airtable...');
  const novoMapa = {};

  try {
    const records = await base(AIRTABLE_TABLE_NAME)
      .select({
        // Apenas pega as colunas que precisamos
        fields: [COLUNA_RECEBIDO, COLUNA_RESPOSTA],
      })
      .all();

    records.forEach((record) => {
      const recebido = record.get(COLUNA_RECEBIDO);
      const resposta = record.get(COLUNA_RESPOSTA);

      if (recebido && resposta) {
        // Converte para minúsculas para garantir a correspondência
        novoMapa[recebido.toLowerCase().trim()] = resposta.trim();
      }
    });

    mapaDeRespostas = novoMapa;
    console.log(`✅ ${Object.keys(mapaDeRespostas).length} regras carregadas.`);

  } catch (err) {
    console.error('Erro ao buscar regras no Airtable:', err);
  }
}

// --- Inicialização do Bot (WhatsApp) ---

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
  console.log('QR Code recebido, escaneie com seu celular:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('==================================================');
  console.log('✅ Cliente conectado e pronto para uso!');
  
  // 1. Carrega as regras IMEDIATAMENTE ao ligar
  await carregarRegrasDoAirtable();

  // 2. Define um "timer" para checar por novas regras a cada 60 segundos
  setInterval(carregarRegrasDoAirtable, 60000); // 60 segundos
  
  console.log('O bot está ouvindo por novas mensagens...');
  console.log('==================================================');
});

// --- Lógica de Resposta ---

client.on('message', (msg) => {
  const mensagemRecebida = msg.body.toLowerCase().trim();

  // A mágica acontece aqui: o mapaDeRespostas está sempre atualizado!
  if (mapaDeRespostas[mensagemRecebida]) {
    const resposta = mapaDeRespostas[mensagemRecebida];

    console.log(`------------------------------`);
    console.log(`Mensagem de: ${msg.from}`);
    console.log(`Recebido: ${msg.body} (Regra encontrada!)`);
    console.log(`Enviando: ${resposta}`);

    msg.reply(resposta);
  } else {
    // Nenhuma regra encontrada
    console.log(`Mensagem de ${msg.from} ("${msg.body}") não está no mapa.`);
  }
});

// Inicia o cliente
client.initialize().catch((err) => {
  console.error('Erro ao inicializar o cliente:', err);
});


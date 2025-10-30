/*
  ---------------------------------------------------------------------
   *** EXEMPLO DE BOT PARA WHATSAPP (FINS EDUCACIONAIS) ***

   Este código usa a biblioteca 'whatsapp-web.js'.
   Como discutido, seu uso para este projeto educacional e não lucrativo
   foi autorizado pelo suporte do WhatsApp.

   Para outros casos, especialmente comerciais, o WhatsApp
   recomenda o uso da API Oficial (WhatsApp Business Platform).
  ---------------------------------------------------------------------

  Para executar este código, você precisa ter o Node.js instalado.
  Depois, instale as bibliotecas necessárias no seu terminal:
  npm install whatsapp-web.js qrcode-terminal
*/

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Usamos LocalAuth para salvar a sessão e não precisar ler o QR Code toda vez
const client = new Client({
  authStrategy: new LocalAuth(),
});

console.log('Iniciando o cliente do WhatsApp...');

// Evento disparado quando o QR Code é gerado
client.on('qr', (qr) => {
  console.log('QR Code recebido, escaneie com seu celular:');
  // Exibe o QR code no terminal para você escanear
  qrcode.generate(qr, { small: true });
});

// Evento disparado quando o cliente está pronto
client.on('ready', () => {
  console.log('==================================================');
  console.log('✅ Cliente conectado e pronto para uso!');
  console.log('O bot está ouvindo por novas mensagens...');
  console.log('==================================================');
});

// -----------------------------------------------------------------
// AQUI COMEÇA A LÓGICA QUE VOCÊ PEDIU
// -----------------------------------------------------------------

/*
  Este objeto (dicionário) define as respostas automáticas.
  - A "chave" (texto da esquerda) é a mensagem que o bot vai receber.
  - O "valor" (texto da direita) é a mensagem que o bot vai enviar de volta.
*/
const mapaDeRespostas = {
  // Colocamos tudo em minúsculo para facilitar a comparação
  'bom dia': 'Bom dia! 👋 Este é um bot de resposta automática.',
  'boa tarde': 'Boa tarde! 👋 Este é um bot de resposta automática.',
  'boa noite': 'Boa noite! 👋 Este é um bot de resposta automática.',
  'olá': 'Olá! No momento não posso responder.',
  'oi': 'Oie! Resposta automática.',
  'tudo bem?': 'Tudo ótimo, mas sou um robô! 🤖',
  'ajuda': 'Este bot responde mensagens pré-definidas. Deixe seu recado que um humano responderá em breve.',
  'preço': 'Informações sobre preço serão enviadas por um atendente humano.',
};

// Evento disparado toda vez que uma nova mensagem é recebida
client.on('message', (msg) => {
  // Pega o texto da mensagem e converte para minúsculas
  const mensagemRecebida = msg.body.toLowerCase().trim();

  // Verifica se a mensagem recebida existe no nosso 'mapaDeRespostas'
  if (mapaDeRespostas[mensagemRecebida]) {
    // Se existir, encontramos uma resposta!
    const resposta = mapaDeRespostas[mensagemRecebida];

    console.log(`------------------------------`);
    console.log(`Mensagem de: ${msg.from}`);
    console.log(`Recebido: ${msg.body}`);
    console.log(`Enviando: ${resposta}`);

    // Envia a resposta para o usuário
    msg.reply(resposta);
  } else {
    // Opcional: Logar mensagens que não têm resposta definida
    console.log(`Mensagem de ${msg.from} ("${msg.body}") não está no mapa.`);
  }
});

// Inicia o cliente
client.initialize().catch((err) => {
  console.error('Erro ao inicializar o cliente:', err);
});


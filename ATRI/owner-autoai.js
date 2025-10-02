import axios from 'axios';
import path from 'path';
import { getCharacter, getAllCharacters, characterExists } from '../lib/characterconfig.js';

const defaultCharacter = 'atri';
const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

// Tambahkan daftar model AI
const aiModels = [
  "gpt-4.1-nano",
  "gpt-4.1-mini",
  "gpt-4.1",
  "o4-mini",
  "deepseek-r1",
  "deepseek-v3",
  "claude-3.7",
  "gemini-2.0",
  "grok-3-mini",
  "qwen-qwq-32b",
  "gpt-4o",
  "o3",
  "gpt-4o-mini",
  "llama-3.3",
];

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (m.isGroup) return m.reply('Fitur ini hanya untuk Qila di chat pribadi 💖');
  
  // Fix owner validation
  const isOwner = Array.isArray(global.owner) 
    ? global.owner
        .map(([number]) => number?.toString())
        .filter(Boolean)
        .map(v => v + '@s.whatsapp.net')
        .includes(m.sender)
    : false;
    
  if (!isOwner) return m.reply('Fitur ini hanya untuk Qila 😚');

  conn.sessionAI = conn.sessionAI || {};

  if (!text) {
    const characterList = getAllCharacters().map(char => `• ${char.key} - ${char.displayName} (${char.anime})`).join('\n');
    return m.reply(`Ketik:\n${usedPrefix + command} enable [character]\n${usedPrefix + command} disable\n${usedPrefix + command} character [name]\n${usedPrefix + command} list\n\nKarakter tersedia:\n${characterList}`);
  }

  const args = text.toLowerCase().split(' ');
  const action = args[0];

  if (action === 'enable') {
    const characterName = args[1] || defaultCharacter;

    if (!characterExists(characterName)) {
      const characterList = getAllCharacters().map(char => `• ${char.key}`).join('\n');
      return m.reply(`Karakter "${characterName}" tidak ditemukan!\n\nKarakter tersedia:\n${characterList}`);
    }

    const character = getCharacter(characterName);
    conn.sessionAI[m.sender] = {
      sessionChat: [],
      character: characterName,
      context: {}
    };
    return m.reply(`Yayy! ${character.displayName} siap nemenin Qila 💖`);
  }

  if (action === 'disable') {
    delete conn.sessionAI[m.sender];
    return m.reply('AI dinonaktifkan. Sampai jumpa! 👋');
  }

  if (action === 'character') {
    const characterName = args[1];
    if (!characterName) {
      const characterList = getAllCharacters().map(char => `• ${char.key} - ${char.displayName} (${char.anime})`).join('\n');
      return m.reply(`Pilih karakter:\n${characterList}\n\nContoh: ${usedPrefix + command} character atri`);
    }

    if (!characterExists(characterName)) {
      const characterList = getAllCharacters().map(char => `• ${char.key}`).join('\n');
      return m.reply(`Karakter "${characterName}" tidak ditemukan!\n\nKarakter tersedia:\n${characterList}`);
    }

    if (!conn.sessionAI[m.sender]) {
      return m.reply('Aktifkan AI dulu dengan enable!');
    }

    const character = getCharacter(characterName);
    conn.sessionAI[m.sender].character = characterName;
    conn.sessionAI[m.sender].sessionChat = []; // Reset chat history
    return m.reply(`Karakter berubah menjadi ${character.displayName}! 💖`);
  }

  if (action === 'list') {
    const characterList = getAllCharacters().map(char =>
      `• *${char.displayName}* (${char.key})\n  Anime: ${char.anime}`
    ).join('\n\n');
    return m.reply(`📝 *Daftar Karakter AI:*\n\n${characterList}`);
  }

  if (action === 'model') {
    if (!args[1]) {
      const modelList = aiModels.map((model, i) => `${i + 1}. ${model}`).join('\n');
      return m.reply(`*📝 Daftar Model AI:*\n\n${modelList}\n\nCara pakai: ${usedPrefix + command} model <number/name>`);
    }

    const modelInput = args[1];
    const modelIndex = parseInt(modelInput) - 1;
    const selectedModel = aiModels[modelIndex] || modelInput;

    if (!aiModels.includes(selectedModel)) {
      return m.reply(`❌ Model tidak ditemukan!\n\nGunakan:\n${usedPrefix + command} model\nuntuk melihat daftar model.`);
    }

    conn.sessionAI[m.sender] = conn.sessionAI[m.sender] || {};
    conn.sessionAI[m.sender].aiModel = selectedModel;
    return m.reply(`✅ Model AI diubah ke: ${selectedModel}`);
  }

  return m.reply(`Perintah tidak dikenali.\nCoba: enable, disable, character, model, atau list`);
};

handler.before = async (m, { conn }) => {
  conn.sessionAI = conn.sessionAI || {};
  if (!m.text || m._processedByCharacterAI || m._processedByAutoDownload) return;
  if (!conn.sessionAI[m.sender] || m.isGroup) return;

  const session = conn.sessionAI[m.sender] = conn.sessionAI[m.sender] || {};
  session.sessionChat = session.sessionChat || [];
  session.character = session.character || defaultCharacter;

  const currentCharacter = getCharacter(session.character);
  const prev = session.sessionChat;

  const messages = [
    { role: 'system', content: currentCharacter.prompt },
    ...prev.map((text, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: text })),
    { role: 'user', content: m.text }
  ];

  try {
    const res = await axios.post('https://api.botcahx.eu.org/api/search/openai-custom', {
      message: messages,
      model: conn.sessionAI[m.sender]?.aiModel || 'gpt-4.1-nano', // Default model
      apikey: global.btc
    });

    const reply = res.data?.result;
    if (!reply || typeof reply !== 'string') return m.reply(`${currentCharacter.displayName} bingung nih Qilaa 😣`);

    const teks = reply.includes('[Teks]') ? reply.split('[Teks]')[1].split('[TTS]')[0].trim() : reply;
    
    // Random antara reply atau kirim pesan biasa (50-50)
    if (Math.random() < 0.5) {
      await m.reply(teks || `🥺 ${currentCharacter.displayName} gak tau mau jawab apa, tapi ${currentCharacter.displayName} selalu di sini buat Qila~`);
    } else {
      await conn.sendMessage(m.chat, { text: teks || `🥺 ${currentCharacter.displayName} gak tau mau jawab apa, tapi ${currentCharacter.displayName} selalu di sini buat Qila~` });
    }

    const papMatch = m.text.toLowerCase().match(/pap(?:\s*(\d+))?/);
    const requestCount = papMatch ? parseInt(papMatch[1] || '1') : null;
    let mediaToSend = [];

    if (requestCount) mediaToSend = Array.from({ length: Math.min(requestCount, 5) }, () => pickRandom(currentCharacter.mediaUrls));
    else if (/\bpap\b\s*/i.test(m.text)) mediaToSend = [pickRandom(currentCharacter.mediaUrls)];
    else if (Math.random() < 0.05) mediaToSend = [pickRandom(currentCharacter.mediaUrls)];

    for (const url of mediaToSend) {
      await conn.sendFile(m.chat, url, 'pap.jpg', pickRandom(currentCharacter.papCaptions), m);
    }

    if (mediaToSend.length > 0) {
      await m.reply(pickRandom(currentCharacter.papEndingCaptions));
    }

    if (reply && typeof reply === 'string' && m.text && typeof m.text === 'string') {
      session.sessionChat = [...prev, m.text, reply].slice(-10);
    }

  } catch (err) {
    console.error('AutoAI Error:', err);
    m.reply(`${currentCharacter.displayName} capek Qilaa 😢`);
  }
};

handler.command = ['atri'];
handler.help = ['atri enable/disable/character/model/list'];
handler.tags = ['owner'];
handler.limit = false;

export default handler;
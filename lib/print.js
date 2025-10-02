import { WAMessageStubType } from '@whiskeysockets/baileys';
import PhoneNumber from 'awesome-phonenumber';
import chalk from 'chalk';
import { watchFile, readFile, writeFile } from 'fs';
import terminalImage from 'terminal-image';
import urlRegex from 'url-regex-safe';

let logCount = 0;
let codeUpdated = false;

export default async function (m, conn = { user: {} }) {
  const formatType = (type) =>
    type
      ? type
          .replace(/message$/i, '')
          .replace('audio', m.msg.ptt ? 'PTT' : 'audio')
          .replace(/^./, (v) => v.toUpperCase())
      : 'Unknown';

  const formatTime = (timestamp) =>
    timestamp
      ? new Date(1000 * (timestamp.low || timestamp)).toLocaleString()
      : new Date().toLocaleString();

  const _name = await conn.getName(m.sender);
  const sender =
    PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber(
      'international'
    ) + (_name ? ' ~ ' + _name : '');

  const chat = await conn.getName(m.chat);
  const filesize =
    m.msg && m.msg.vcard
      ? m.msg.vcard.length
      : m.msg && m.msg.fileLength
      ? m.msg.fileLength.low || m.msg.fileLength
      : m.text
      ? m.text.length
      : 0;

  if (m.sender) {
    console.log(chalk.blue('══════════════════════════════════════════════════'));
    console.log(chalk.redBright('  📩 MESSAGE INFO  '));
    console.log(chalk.blue('══════════════════════════════════════════════════'));
    console.log(`  📌 ${chalk.cyan('Message Type')}: ${formatType(m.mtype)}`);
    console.log(`  🆔 ${chalk.cyan('Message ID')}: ${m.msg?.id || m.key.id || 'N/A'}`);
    console.log(`  ⏰ ${chalk.cyan('Sent Time')}: ${formatTime(m.messageTimestamp)}`);
    console.log(`  📂 ${chalk.cyan('Message Size')}: ${filesize || 0} bytes`);
    console.log(`  👤 ${chalk.cyan('Sender ID')}: ${m.sender.split('@')[0]}`);
    console.log(`  🎭 ${chalk.cyan('Sender Name')}: ${m.name ? conn.user.name : 'N/A'}`);
    console.log(`  💬 ${chalk.cyan('Chat ID')}: ${m.chat.split('@')[0]}`);
    console.log(`  🏷️ ${chalk.cyan('Chat Name')}: ${chat || 'N/A'}`);
    console.log(`  📊 ${chalk.cyan('Total Log Messages')}: ${logCount}`);
    console.log(chalk.blue('══════════════════════════════════════════════════\n'));
  }

  if (typeof m?.text === 'string' && m.text) {
    console.log(chalk.blue('══════════════════════════════════════════════════'));
    let logMessage = m.text.replace(/\u200e+/g, '');

    const mdRegex =
      /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g;

    const mdFormat = (depth = 4) => (_, type, text, monospace) => {
      const types = { _: 'italic', '*': 'bold', '~': 'strikethrough' };
      text = text || monospace;
      const formatted =
        !types[type] || depth < 1
          ? text
          : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)));
      return formatted;
    };

    if (logMessage.length < 4096) {
      logMessage = logMessage.replace(urlRegex, (url, i, text) => {
        const end = url.length + i;
        return i === 0 ||
          end === text.length ||
          (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1]))
          ? chalk.blueBright(url)
          : url;
      });
    }

    logMessage = logMessage.replace(mdRegex, mdFormat(4));

    if (m.mentionedJid) {
      for (const user of m.mentionedJid) {
        logMessage = logMessage.replace(
          '@' + user.split`@`[0],
          chalk.blueBright('@' + (await conn.getName(user)))
        );
      }
    }

    console.log(
      m.error != null
        ? `${chalk.red(logMessage)}`
        : m.isCommand
        ? `${chalk.yellow(logMessage)}`
        : logMessage
    );
    console.log(chalk.blue('══════════════════════════════════════════════════\n'));
  }

  if (m.msg) {
    const attachmentType = m.mtype.replace(/message$/i, '');

    const printAttachment = (title, extra = '') => {
      console.log(chalk.blue('══════════════════════════════════════════════════'));
      console.log(chalk.redBright(`  📎 ${title} ${extra}`));
      console.log(chalk.blue('══════════════════════════════════════════════════\n'));
    };

    if (/document/i.test(attachmentType)) {
      printAttachment('Document', m.msg.fileName || 'Unnamed');
    } else if (/contact/i.test(attachmentType)) {
      printAttachment('Contact', m.msg.displayName || 'N/A');
    } else if (/audio/i.test(attachmentType)) {
      const duration = m.msg.seconds;
      printAttachment(
        m.msg.ptt ? 'Voice Note' : 'Audio',
        `Duration: ${Math.floor(duration / 60)
          .toString()
          .padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`
      );
    } else if (/image/i.test(attachmentType)) {
      printAttachment('Image', m.msg.caption || 'No Caption');

      if (m.msg.url && global.opts['img']) {
        try {
          const imageBuffer = await m.download();
          const terminalImg = await terminalImage.buffer(imageBuffer);
          console.log(terminalImg);
        } catch (error) {
          console.error(chalk.red('Error displaying image:'), error);
        }
      }
    } else if (/video/i.test(attachmentType)) {
      printAttachment('Video', m.msg.caption || 'No Caption');
    } else if (/sticker/i.test(attachmentType)) {
      printAttachment('Sticker');
    }
  }

  if (m.sender) {
    console.log(chalk.greenBright(`  📲 ${chalk.red('From')}: ${getPhoneNumber(m.sender)}`));
    console.log(chalk.blueBright(`  📤 ${chalk.red('To')}: ${getPhoneNumber(conn.user?.jid)}`));
    console.log(chalk.magentaBright('\n'));
  }

  logCount++;
}

const getPhoneNumber = (jid) =>
  PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');

const file = global.__filename(import.meta.url);
watchFile(file, async () => {
  console.log(chalk.redBright("Update 'lib/print.js'"));

  if (!codeUpdated) {
    readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(chalk.redBright('Error reading the file:'), err);
        return;
      }
      writeFile(file, data, (writeErr) => {
        if (writeErr) {
          console.error(chalk.redBright('Error saving the updated code:'), writeErr);
        } else {
          codeUpdated = true;
          console.log(chalk.greenBright('Updated code has been saved to the file.'));
        }
      });
    });
  }
});

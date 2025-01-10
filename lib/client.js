/*import {
	makeWASocket,
	fetchLatestBaileysVersion,
	makeCacheableSignalKeyStore,
	DisconnectReason,
	Browsers,
	useMultiFileAuthState,
	isJidBroadcast
} from 'baileys';
import { ProxyAgent } from 'proxy-agent';
import { EventEmitter } from 'events';
import Message from './class.js';
import { getRandomProxy, manageProcess } from '#utils';
import { AntiCall, AntiDelete, Greetings, GroupEventPartial, GroupEvents } from '#bot';
import { loadMessage, saveMessage, getGroupMetadata } from '#sql';
import { getConfigValues, upserts, Plugins, serialize, logger } from '#lib';

EventEmitter.defaultMaxListeners = 2000;
process.setMaxListeners(2000);

export const client = async () => {
	const session = await useMultiFileAuthState('./session');
	const { state, saveCreds } = session;
	const { version } = await fetchLatestBaileysVersion();

	const conn = makeWASocket({
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger)
		},
		printQRInTerminal: true,
		logger,
		agent: new ProxyAgent(`http://${getRandomProxy()}`),
		browser: Browsers.windows('Desktop'),
		version,
		keepAliveIntervalMs: 5000,
		syncFullHistory: true,
		defaultQueryTimeoutMs: 30000,
		retryRequestDelayMs: 5000,
		markOnlineOnConnect: false,
		fireInitQueries: true,
		emitOwnEvents: true,
		generateHighQualityLinkPreview: true,
		getMessage: async key => {
			const store = await loadMessage(key.id);
			return store ? store : { conversation: null };
		},
		cachedGroupMetadata: async jid => {
			const store = await getGroupMetadata(jid);
			return store || null;
		}
	});

	conn.ev.on('call', async calls => {
		await AntiCall(calls, conn);
	});

	conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
		switch (connection) {
			case 'connecting':
				console.log('Connecting...');
				break;

			case 'close':
				lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut
					? manageProcess()
					: client();
				break;

			case 'open':
				const vInfo = version.join('.');
				await conn.sendMessage(conn.user.id, { text: `\`\`\`Bot Connected\n${vInfo}\`\`\`` });
				console.log(`Wa Version: ${vInfo}`);
				break;
		}
	});

	conn.ev.on('creds.update', saveCreds);

	conn.ev.on('messages.upsert', async ({ messages, type }) => {
		if (type !== 'notify') return;

		const { autoRead, autoStatusRead, autolikestatus } = await getConfigValues();

		for (const message of messages) {
			const msg = await serialize(JSON.parse(JSON.stringify(message, null, 2)), conn);
			await Promise.all([
				Plugins(msg, conn, new Message(conn, msg)),
				saveMessage(msg),
				upserts(msg)
			]);

			if (autoRead) await conn.readMessages([msg.key]);
			if (autoStatusRead && isJidBroadcast(msg.from)) await conn.readMessages([message.key]);
			if (autolikestatus && isJidBroadcast(msg.from)) {
				await conn.sendMessage(
					message.key.remoteJid,
					{ react: { key: message.key, text: '💚' } },
					{ statusJidList: [message.key.participant, conn.user.id] }
				);
			}
		}
	});

	conn.ev.on('messages.update', async updates => {
		await AntiDelete(conn, updates);
	});

	conn.ev.on('group-participants.update', async ({ id, participants, action, author }) => {
		if ((await getConfigValues()).disablegc) return;
		const event = { Group: id, participants: participants, action: action, by: author };
		await Promise.all([Greetings(event, conn), GroupEvents(event, conn)]);
	});

	conn.ev.on('groups.update', async updates => {
		if ((await getConfigValues()).disablegc) return;
		for (const update of updates) {
			await GroupEventPartial(update, conn);
		}
	});

	return conn;
};
*/



import dotenv from 'dotenv';
import fs from 'fs';
import { File } from 'megajs';
import { makeWASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers, useMultiFileAuthState } from 'baileys';
import { ProxyAgent } from 'proxy-agent';
import { EventEmitter } from 'events';
import { getConfigValues, upserts, Plugins, serialize, logger } from '#lib';
import { AntiCall, AntiDelete, Greetings, GroupEventPartial, GroupEvents } from '#bot';
import { loadMessage, saveMessage, getGroupMetadata } from '#sql';
import { getRandomProxy, manageProcess } from '#utils';
import Message from './class.js';

// Load environment variables
dotenv.config();

const config = {
  SESSION_ID: process.env.SESSION_ID || 'Nikka-XJyYS3bSD#qtMTUla6hlryLN3lIHdNYPLPQYj76s9EUz-MzPlM9ho',
  SUDO: process.env.SUDO || '',
  API_ID: process.env.API_ID || 'https://xstro-api-4fb28ece11a9.herokuapp.com',
  BOT_INFO: process.env.BOT_INFO || 'αѕтяσχ11;χѕтяσ м∂',
  STICKER_PACK: process.env.STICKER_PACK || 'h4ki xer',
  WARN_COUNT: process.env.WARN_COUNT || 3,
  TIME_ZONE: process.env.TIME_ZONE || 'Africa/Lagos',
  DEBUG: process.env.DEBUG || false,
  VERSION: '1.2.2'
};

EventEmitter.defaultMaxListeners = 2000;
process.setMaxListeners(2000);

export const client = async () => {
  const session = await useMultiFileAuthState('./session');
  const { state, saveCreds } = session;
  const { version } = await fetchLatestBaileysVersion();

  // Session File Path
  const sessionFilePath = './lib/session/creds.json';

  try {
    // Check if the session file exists
    if (!fs.existsSync(sessionFilePath)) {
      const prefix = 'Nikka-X';
      const output = './lib/session/';
      const pth = output + 'creds.json';

      // Retrieve SESSION_ID from config
      const sessionId = config.SESSION_ID;
      
      // Ensure the session ID starts with the correct prefix
      if (!sessionId.startsWith(prefix)) {
        throw new Error('Invalid session id.');
      }

      // Construct URL to download the session from Mega
      const url = `https://mega.nz/file/${sessionId.replace(prefix, '')}`;
      const file = File.fromURL(url);
      await file.loadAttributes();

      // Ensure the output directory exists
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true });
      }

      // Download the session file buffer and save to disk
      const data = await file.downloadBuffer();
      fs.writeFileSync(pth, data);
    }
  } catch (error) {
    console.error('Error downloading session:', error);
  }

  const conn = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    printQRInTerminal: true,
    logger,
    agent: new ProxyAgent(`http://${getRandomProxy()}`),
    browser: Browsers.windows('Desktop'),
    version,
    keepAliveIntervalMs: 5000,
    syncFullHistory: true,
    defaultQueryTimeoutMs: 30000,
    retryRequestDelayMs: 5000,
    markOnlineOnConnect: false,
    fireInitQueries: true,
    emitOwnEvents: true,
    generateHighQualityLinkPreview: true,
    getMessage: async key => {
      const store = await loadMessage(key.id);
      return store ? store : { conversation: null };
    },
    cachedGroupMetadata: async jid => {
      const store = await getGroupMetadata(jid);
      return store || null;
    }
  });

  conn.ev.on('call', async calls => {
    await AntiCall(calls, conn);
  });

  conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    switch (connection) {
      case 'connecting':
        console.log('Connecting...');
        break;

      case 'close':
        lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut
          ? manageProcess()
          : client();
        break;

      case 'open':
        const vInfo = version.join('.');
        await conn.sendMessage(conn.user.id, { text: `\`\`\`Bot Connected\n${vInfo}\`\`\`` });
        console.log(`Wa Version: ${vInfo}`);
        break;
    }
  });

  conn.ev.on('creds.update', saveCreds);

  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const { autoRead, autoStatusRead, autolikestatus } = await getConfigValues();

    for (const message of messages) {
      const msg = await serialize(JSON.parse(JSON.stringify(message, null, 2)), conn);
      await Promise.all([
        Plugins(msg, conn, new Message(conn, msg)),
        saveMessage(msg),
        upserts(msg)
      ]);

      if (autoRead) await conn.readMessages([msg.key]);
      if (autoStatusRead && isJidBroadcast(msg.from)) await conn.readMessages([message.key]);
      if (autolikestatus && isJidBroadcast(msg.from)) {
        await conn.sendMessage(
          message.key.remoteJid,
          { react: { key: message.key, text: '💚' } },
          { statusJidList: [message.key.participant, conn.user.id] }
        );
      }
    }
  });

  conn.ev.on('messages.update', async updates => {
    await AntiDelete(conn, updates);
  });

  conn.ev.on('group-participants.update', async ({ id, participants, action, author }) => {
    if ((await getConfigValues()).disablegc) return;
    const event = { Group: id, participants: participants, action: action, by: author };
    await Promise.all([Greetings(event, conn), GroupEvents(event, conn)]);
  });

  conn.ev.on('groups.update', async updates => {
    if ((await getConfigValues()).disablegc) return;
    for (const update of updates) {
      await GroupEventPartial(update, conn);
    }
  });

  return conn;
};

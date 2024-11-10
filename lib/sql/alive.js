import { runtime } from '../utils.js';
import { DataTypes } from 'sequelize';
import { DATABASE, BOT_INFO, PREFIX } from '../../config.js';

const AliveDB = DATABASE.define(
	'AliveDB',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		message: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: 'alive',
		timestamps: false,
	},
);

const getAliveMsg = async () => {
	const msg = await AliveDB.findOne();
	return msg?.message || 'ᴛʜᴀɴᴋ ʏᴏᴜ ғᴏʀ ᴄʜᴏᴏsɪɴɢ xsᴛʀᴏ ᴍᴅ, ɪ ᴀᴍ ᴀʟɪᴠᴇ ᴀɴᴅ ʀᴜɴɴɪɴɢ, ᴍᴀᴅᴇ ʙʏ ᴀsᴛʀᴏ ғᴏʀ ʏᴏᴜ\nᴜsᴇ ' + PREFIX + 'ᴀʟɪᴠᴇ ᴡɪᴛʜ ɴᴇᴡ ᴡᴏʀᴅs ᴛᴏ ᴄʜᴀɴɢᴇ ᴛʜᴇ ᴀʟɪᴠᴇ ᴍᴇssᴀɢᴇ';
};

const setAliveMsg = async text => {
	await AliveDB.destroy({ where: {} });
	await AliveDB.create({ message: text });
	return true;
};

const getRandomQuote = () => {
	const quotes = ["Life is what happens while you're busy making other plans.", 'The only way to do great work is to love what you do.', 'Success is not final, failure is not fatal.', 'Be the change you wish to see in the world.', 'Every moment is a fresh beginning.'];
	return quotes[Math.floor(Math.random() * quotes.length)];
};

const getRandomFact = () => {
	const facts = ['Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old!', 'A day on Venus is longer than its year.', "The first oranges weren't orange.", 'A small cup of coffee has more caffeine than a shot of espresso.', 'Octopuses have three hearts.'];
	return facts[Math.floor(Math.random() * facts.length)];
};

const aliveMessage = async message => {
	const msg = await getAliveMsg();
	if (!msg) return 'ᴛʜᴀɴᴋ ʏᴏᴜ ғᴏʀ ᴄʜᴏᴏsɪɴɢ xsᴛʀᴏ ᴍᴅ, ɪ ᴀᴍ ᴀʟɪᴠᴇ ᴀɴᴅ ʀᴜɴɴɪɴɢ, ᴍᴀᴅᴇ ʙʏ ᴀsᴛʀᴏ ғᴏʀ ʏᴏᴜ\nᴜsᴇ ' + PREFIX + 'ᴀʟɪᴠᴇ ᴡɪᴛʜ ɴᴇᴡ ᴡᴏʀᴅs ᴛᴏ ᴄʜᴀɴɢᴇ ᴛʜᴇ ᴀʟɪᴠᴇ ᴍᴇssᴀɢᴇ';

	return msg
		.replace(/&runtime/g, runtime(process.uptime()))
		.replace(/&user/g, message.pushName || 'user')
		.replace(/@user/g, `@${message.sender.split('@')[0]}`)
		.replace(/&quotes/g, getRandomQuote())
		.replace(/&facts/g, getRandomFact())
		.replace(/&owner/g, BOT_INFO.split(';')[0])
		.replace(/&botname/g, BOT_INFO.split(';')[1]);
};

export { getAliveMsg, setAliveMsg, aliveMessage };
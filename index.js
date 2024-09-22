import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import fs from "fs";

import {
	sendDataAboutText,
	sendDataAboutButton,
	sendDataAboutError,
} from "./tgterminal.js";

import { config } from "./config.js";

import {
	foodmenu27c1,
	foodmenu27c2,
	class10a,
	class10b,
	class10g,
	class11a,
	class11v,
	class11g,
	class11d,
} from "./sheets.js";

const TOKEN = config.TOKENs[0]; // 1 - оригинал
const bot = new TelegramBot(TOKEN, { polling: true });

const qu1z3xId = "923690530";
const stepanovId = "5786876945";
const jackId = "6815420098";
let BotName = "digschbot";

//? МАССИВЫ ДАННЫХ

let usersData = []; // информация о пользователях
let remindersData = []; // существующие напоминания
let diningRoomData = []; // отзывы о еде в столовой

// Приветственные стикеры

const stickers = [
	"CAACAgIAAxkBAAIXI2U1QcFdX12aOkHp0zodw3LWDX5KAAKFAAPBnGAMi4wdH0hTXSIwBA",
	"CAACAgIAAxkBAAIXJGU1QclHfnHsU6z0isqU3v72p11mAAJ0AAPBnGAMtJfqrsmMmrQwBA",
	"CAACAgIAAxkBAAIXJWU1QdMJWNfIOh9odZH8Q25K98A-AAJvAAPBnGAMyw59i8DdTVYwBA",
	"CAACAgIAAxkBAAIXJmU1QdsTofm7uh7hi3mNYNE837HpAAJ6AAPBnGAM0GBdiVRCvP4wBA",
];

bot.setMyCommands([
	{
		command: "/restart",
		description: "Перезапуск 👾",
	},
]);

// Что нового? text

const newsText = [
	"",
	"Новостей нет.. 🤔",
	`- УРА! Актуальное расписание! 🤗\n\n- Обновлен раздел с настройками ✅\n\n- Статистика сыгранных игр 👌\n\n- Объем всего функционала бота, упирается в +6000 строк кода <a href= "https://t.me/${BotName}/?start=minidetail5">🫡</a>\n\n- Я стал быстрее, во всех смыслах 🏎️\n\n- Максимальная нагрузка до 50 запросов в СЕКУНДУ 🤯`,
	'МБОУ СОШ №27 | Школа с 2023 года, разделена на два корпуса, но как в первом, так и во втором царит уникальная ученическая атмосфера! Здесь каждый день — новое приключение. Ученики и учителя образуют единую большую семью, где дружба и знание всегда рядом. Также у нас существует множество спортивных секций в обоих корпусах!\n\nСовсем недавно наша школа заняла 3-е место в турнире "Кубок памяти А. З. Бакурова", сыграв со всеми школами в округе!',
];

// Классы

const weekDayNames = [
	"Воскресенье",
	"Понедельник",
	"Вторник",
	"Среда",
	"Четверг",
	"Пятница",
	"Суббота",
];
const weekDayNamesSHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const monthNames = [
	"Января",
	"Февраля",
	"Марта",
	"Апреля",
	"Мая",
	"Июня",
	"Июля",
	"Августа",
	"Сентября",
	"Октября",
	"Ноября",
	"Декабря",
];

const monthNamesSHORT = [
	"янв",
	"фев",
	"мар",
	"апр",
	"мая",
	"июн",
	"июл",
	"авг",
	"сен",
	"окт",
	"ноя",
	"дек",
];

const timesOnLesson = [
	"08:15", // 1-й урок
	"09:10", // 2-й урок
	"10:05", // 3-й урок
	"10:50", // 4-й урок
	"11:45", // 5-й урок
	"12:45", // 6-й урок
	"13:30", // 7-й урок
];

const timesOnBreak = [
	"08:55", // Перемена после 1-го урока
	"09:50", // Перемена после 2-го урока
	"10:45", // Перемена после 3-го урока
	"11:30", // Перемена после 4-го урока
	"12:25", // Перемена после 5-го урока
	"13:25", // Перемена после 6-го урока
	"14:10", // Перемена после 7-го урока
];

let textToSayHello = "",
	// Raspisanie
	month,
	day,
	dayW,
	maxCountMiniDetails = 10,
	// games
	rndNum,
	// adminMenu
	chatIdForBlacklist = "",
	buttonUpdateActive = true,
	numberArr = 0,
	paragrafs = [
		"❗ВНИМАНИЕ❗",
		"✉️ Уведомление 🗨️",
		"📢 Объявление 📢",
		"🆕 Новости 🌍",
	],
	textMessageForAllUsers;

const newFunctionsNotification = [
	"Напоминание о звонке за 5 минут? 🧐\nВ разделе Звонки - Уведомления! 🤗\n\n",
	"Говорят, в Крестики-Нолики невозможно выиграть! 🧐\n\n",
	"Плохая память? Давай я напомню! 😅\n\n",
	"Актуальное расписание - актуально! ✌️\n\n",
	"Какой процент побед у тебя в играх? 🧐\nПосмотри в настройках! 😉\n\n",
	"А правда, что в расписании подчеркивается текущий урок? 🤔\n\n",
	"Попробуй найди хоть одну смайлик-пасхалку 😉\n\n",
	"А что же я умею? ⬆️\n\n",
	"Что же сегодня на завтрак? 🤔\nРаздел Столовая! 😉\n\n",
	"Ты всегда можешь посмотреть, что будет на обед! 😋\nРаздел Столовая! 😉\n\n",
	"Интересно, какого предмета у тебя больше всего на неделе??\nВ разделе Расписание - Предметы! 🤗\n\n",
	"Я активно развиваюсь, и новое о себе рассказываю в разделе:\nИнтересное - О боте! 🤗\n\n",
	"",
	"",
	"",
	"",
	"",
	"Нижнее предложение каждый раз разное❓\n\n",
];

const menuHomeText = [
	`Чем я могу тебе пригодиться? <a href="https://t.me/${BotName}/?start=minidetail0">😉</a>`,
	`Чем я могу быть полезен? <a href="https://t.me/${BotName}/?start=minidetail0">🤓</a>`,
	`Чем я могу быть полезным? <a href="https://t.me/${BotName}/?start=minidetail0">🥸</a>`,
	`Чем я могу тебя облегчить? <a href="https://t.me/${BotName}/?start=minidetail0">🐵</a>`,
	`Чем я могу помочь сегодня? <a href="https://t.me/${BotName}/?start=minidetail0">🤖</a>`,
	`С чем я могу тебе помочь? <a href="https://t.me/${BotName}/?start=minidetail0">🤔</a>`,
	`В чем я могу быть полезен? <a href="https://t.me/${BotName}/?start=minidetail0">👾</a>`,
	`Как я могу тебя удовлетворить? <a href="https://t.me/${BotName}/?start=minidetail0">🐤</a>`,
];

//?  ФУНКЦИИ

async function menuHome(chatId, exit = true) {
	rndNum = Math.floor(Math.random() * menuHomeText.length);
	let rnd2 = Math.floor(Math.random() * newFunctionsNotification.length);

	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		if (exit) {
			await bot.editMessageText(
				`<i>${newFunctionsNotification[rnd2]}</i><b>${menuHomeText[rndNum]}</b>`,
				{
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					parse_mode: "HTML",
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "📆 Расписание 📚",
									callback_data: "today",
								},
							],
							[
								{
									text: "Звонки ⏰",
									callback_data: "calls",
								},
								{ text: "Напоминания 🗓️", callback_data: "reminders" },
							],
							[
								{
									text: "Столовая 🍜",
									callback_data: "foodmenutoday",
								},
								{ text: "Интересное❗", callback_data: "news" },
							],
							[
								{ text: "Развлечения 🕹️", callback_data: "games" },
								{ text: "Настройки ⚙️", callback_data: "settings" },
							],
							[
								{
									text: `${
										chatId == qu1z3xId ? "💠 Управление 💠" : ""
									}`,
									callback_data: "adminMenu",
								},
							],
						],
					},
				}
			);
		} else if (!exit) {
			bot.sendMessage(
				chatId,
				`<i>${newFunctionsNotification[rnd2]}</i><b>${menuHomeText[rndNum]}</b>`,
				{
					parse_mode: "html",
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "📆 Расписание 📚",
									callback_data: "today",
								},
							],
							[
								{
									text: "Звонки ⏰",
									callback_data: "calls",
								},
								{ text: "Напоминания 🗓️", callback_data: "reminders" },
							],
							[
								{
									text: "Столовая 🍜",
									callback_data: "foodmenutoday",
								},
								{ text: "Интересное❗", callback_data: "news" },
							],
							[
								{ text: "Развлечения 🕹️", callback_data: "games" },
								{ text: "Настройки ⚙️", callback_data: "settings" },
							],
							[
								{
									text: `${
										chatId == qu1z3xId ? "💠 Управление 💠" : ""
									}`,
									callback_data: "adminMenu",
								},
							],
						],
					},
				}
			).then((message) => {
				dataAboutUser.messageId = message.message_id;
			});
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function rulesBot(chatId, RulesToStart = true) {
	let rulesText = `<i>🤖 Правила пользования 📃</i>\n\n❗ЭТО ОЧЕНЬ ВАЖНО <a href = "https://t.me/${BotName}/?start=minidetail6">❗</a>\n\n-  Обязательно ознакомься с <a href = "https://t.me/${BotName}/?start=showhi2">Что умеет этот чат-бот?</a>\n\n-  Пользоваться приложением строго в благих целях🌍\n\n-  Не совершать намеренные нарушения правил, или создание сбоев❌\n\n-  Бот не отвечает - команда /restart в твоем распоряжении!😉\n\n-  Нашлась ошибка? Бот по-прежнему не отвечает? Есть замечания по работе проекта? - пожалуйста, сообщи об этом автору @digfusionsupport 👍\n\n-  Также принимая правила, ты разрешаешь использование личных данных, полученных в рамках школьного бота (т.е. полученные мной) 😉🔒`;

	if (RulesToStart) {
		try {
			await bot.editMessageText(`<b>${rulesText}</b>`, {
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				parse_mode: "html",
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "Я принимаю правила ✅",
								callback_data: "chooseclass1",
							},
						],
					],
				},
			});
		} catch (error) {
			console.log(error);
			sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
			bot.sendMessage(
				chatId,
				`<b>Сверху ничего не было 🙈\n\n${rulesText}</b>`,
				{
					parse_mode: "html",
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️Назад", callback_data: "chooseclass1" },
								{ text: "Принять✅", callback_data: "agreerules" },
							],
						],
					},
				}
			);
			sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
		}
	} else if (!RulesToStart) {
		try {
			await bot.editMessageText(`<b>${rulesText}</b>`, {
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				parse_mode: "html",
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "⬅️Назад", callback_data: "settings" },
							{
								text: "Поддержка 💭",
								url: "https://t.me/digfusionsupport",
							},
							,
						],
					],
				},
			});
		} catch (error) {
			console.log(error);
			sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
		}
	}
}

async function ChoosingClass(chatId, start = 1) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	try {
		if (start == 0) {
			await bot.editMessageText(
				`<i><b>✏️ Изменение класса/школы 🔄️\n\n</b>Класс используется для составления расписания!🔒</i><b>${
					dataAboutUser.className != "Не определен"
						? `</b>\n\nТекущий: <b>${dataAboutUser.className} • ${
								dataAboutUser.schoolName == "27c2"
									? "№27к2"
									: `${
											dataAboutUser.schoolName == "27c1"
												? "№27к1"
												: `${
														dataAboutUser.schoolName == ""
															? "Нет данных"
															: ""
												  }`
									  }`
						  }`
						: ``
				}\n\n</b>Пожалуйста, выбери <b>свой</b> класс 🙂🔎`,
				{
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					parse_mode: "html",
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: `${
										dataAboutUser.className == "10А" ? "•10А•" : "10А"
									}`,
									callback_data: "10a",
								},
								{
									text: `${
										dataAboutUser.className == "10Б" ? "•10Б•" : "10Б"
									}`,
									callback_data: "10b",
								},
								{
									text: `${
										dataAboutUser.className == "10Г" ? "•10Г•" : "10Г"
									}`,
									callback_data: "10g",
								},
							],
							[
								{
									text: `${
										dataAboutUser.className == "11А" ? "•11A•" : "11A"
									}`,
									callback_data: "11a",
								},
								{
									text: `${
										dataAboutUser.className == "11В" ? "•11В•" : "11В"
									}`,
									callback_data: "11v",
								},
								{
									text: `${
										dataAboutUser.className == "11Г" ? "•11Г•" : "11Г"
									}`,
									callback_data: "11g",
								},
								{
									text: `${
										dataAboutUser.className == "11Д" ? "•11Д•" : "11Д"
									}`,
									callback_data: "11d",
								},
							],
							[
								{ text: "⬅️Назад", callback_data: "settings" },
								{ text: "Нет моего😞", callback_data: "netclassa" },
							],
						],
					},
				}
			);
		} else if (start == 1) {
			bot.editMessageText(
				`<b><a href ="https://t.me/${BotName}/?start=rules">Правила пользования ресурсом</a>\n\n</b><i>Класс используется для составления расписания!</i><b> 🔒\n\nА теперь выбери класс 🙂🔎</b>`,
				{
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					parse_mode: "html",
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[{ text: "Войти как гость 🤠", callback_data: "10g" }],
							[
								{ text: "10А", callback_data: "10a" },
								{ text: "10Б", callback_data: "10b" },
								{ text: "10Г", callback_data: "10g" },
							],
							[
								{ text: "11A", callback_data: "11a" },
								{ text: "11В", callback_data: "11v" },
								{ text: "11Г", callback_data: "11g" },
								{ text: "11Д", callback_data: "11d" },
							],
							[{ text: "Нет моего😞", callback_data: "netclassa1" }],
						],
					},
				}
			);
		} else if (start == 2) {
			bot.editMessageText(
				`*Будем ближе знакомиться\\! 😊\n\nПожалуйста, _ознакомься и СОГЛАСИСЬ_ с [правилами пользования ресурсом](https://t.me/${BotName}/?start=rules)❗🙂* `,
				{
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					parse_mode: "MarkdownV2",
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "Правила пользования 📃",
									callback_data: `rules1`,
								},
							],
						],
					},
				}
			);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function Raspisanie(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.weekday = dayW;
		await bot.editMessageText(
			`<b><i>⏰ День расписания 📚</i></b>\n\nСегодня: <b>${
				weekDayNames[dayW]
			}, ${day} ${monthNames[month]}</b>\nКласс: <b>${
				usersData.find((obj) => obj.chatId == chatId).className
			}</b> - <a href ="https://t.me/${BotName}/?start=editclass">изменить</a>\n\n<b>На какой день расписание❓🤔</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "На сегодня 🕚",
								callback_data: "today",
							},
							{
								text: "На завтра 🕰️",
								callback_data: "nextweekday",
							},
						],
						[
							{ text: "Пн 🐥", callback_data: "mon" },
							{ text: "Вт 🙈", callback_data: "tue" },
							{ text: "Ср 🎯", callback_data: "wen" },
						],
						[
							{ text: "⬅️Назад", callback_data: "today" },
							{ text: "Чт ☀️", callback_data: "thu" },
							{ text: "Пт 🥇", callback_data: "fri" },
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function RaspisanieText(
	chatId,
	dayForRaspisanie = usersData.find((obj) => obj.chatId == chatId).weekday
) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	dataAboutUser.userAction = "RaspisanieText";

	try {
		dataAboutUser.weekday = dayForRaspisanie;

		if (dataAboutUser.className == "Не определен") {
			await bot.editMessageText(
				`<b><i>📆 Расписание 📚\n\nНе нахожу твой класс❗</i></b>\n\nДля начала <b>выбери</b> его! 😉`,
				{
					parse_mode: "html",
					chat_id: chatId,
					disable_web_page_preview: true,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️Назад", callback_data: "exit" },
								{ text: "Выбрать ⚙️", callback_data: "chooseclass0" },
							],
						],
					},
				}
			);
		} else {
			let raspisanieText = "";
			const dateNowHHMM =
				new Date().getHours() * 100 + new Date().getMinutes();
			const classArr =
				dataAboutUser.className == "10Г"
					? class10g
					: dataAboutUser.className == "10Б"
					? class10b
					: dataAboutUser.className == "10А"
					? class10a
					: dataAboutUser.className == "11Д"
					? class11d
					: dataAboutUser.className == "11Г"
					? class11g
					: dataAboutUser.className == "11В"
					? class11v
					: dataAboutUser.className == "11А"
					? class11a
					: [];
			if (
				classArr[dataAboutUser.weekday - 1] &&
				classArr[dataAboutUser.weekday - 1].filter((item) => item !== "")
					.length > 0 &&
				dataAboutUser.weekday != 0
			) {
				for (
					let i = 0;
					i < classArr[dataAboutUser.weekday - 1].length;
					i++
				) {
					if (
						classArr[dataAboutUser.weekday - 1][i] &&
						classArr[dataAboutUser.weekday - 1][i] != "" &&
						((i + 1 == 1 &&
							dateNowHHMM >= 700 &&
							dateNowHHMM < 910 &&
							dataAboutUser.weekday == dayW) ||
							(i + 1 == 2 &&
								dateNowHHMM >= 925 &&
								dateNowHHMM < 1005 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 3 &&
								dateNowHHMM >= 1025 &&
								dateNowHHMM < 1105 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 4 &&
								dateNowHHMM >= 1125 &&
								dateNowHHMM < 1205 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 5 &&
								dateNowHHMM >= 1220 &&
								dateNowHHMM < 1300 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 6 &&
								dateNowHHMM >= 1315 &&
								dateNowHHMM < 1355 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 7 &&
								dateNowHHMM >= 1410 &&
								dateNowHHMM < 1450 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 8 &&
								dateNowHHMM >= 1505 &&
								dateNowHHMM < 1545 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 9 &&
								dateNowHHMM >= 1600 &&
								dateNowHHMM < 1640 &&
								dataAboutUser.weekday == dayW))
					)
						raspisanieText += `${i + 1}. <u>${classArr[
							dataAboutUser.weekday - 1
						][i].trim()}</u>\n`;
					else if (
						classArr[dataAboutUser.weekday - 1][i] &&
						classArr[dataAboutUser.weekday - 1][i] != ""
					)
						if (
							(i + 1 == 1 &&
								dateNowHHMM >= 910 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 2 &&
								dateNowHHMM >= 1005 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 3 &&
								dateNowHHMM >= 1105 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 4 &&
								dateNowHHMM >= 1205 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 5 &&
								dateNowHHMM >= 1300 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 6 &&
								dateNowHHMM >= 1355 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 7 &&
								dateNowHHMM >= 1450 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 8 &&
								dateNowHHMM >= 1545 &&
								dataAboutUser.weekday == dayW) ||
							(i + 1 == 9 &&
								dateNowHHMM >= 1640 &&
								dataAboutUser.weekday == dayW)
						) {
							raspisanieText += `${i + 1}. <s>${classArr[
								dataAboutUser.weekday - 1
							][i].trim()}</s>\n`;
						} else
							raspisanieText += `${i + 1}. ${classArr[
								dataAboutUser.weekday - 1
							][i].trim()}\n`;
				}
			}

			await bot.editMessageText(
				`<b><i><a href="https://t.me/${BotName}/?start=minidetail8">📆</a> Расписание</i> • <a href = "https://t.me/${BotName}/?start=editclass">${
					dataAboutUser.className
				}</a> 📚\n\n${weekDayNamesSHORT[dataAboutUser.weekday]} • ${
					classArr[dataAboutUser.weekday - 1] &&
					classArr[dataAboutUser.weekday - 1].filter((item) => item !== "")
						.length
						? `${
								classArr[dataAboutUser.weekday - 1].filter(
									(item) => item !== ""
								).length
						  } ${
								classArr[dataAboutUser.weekday - 1].filter(
									(item) => item !== ""
								).length == 1
									? "занятие"
									: `${
											classArr[dataAboutUser.weekday - 1].filter(
												(item) => item !== ""
											).length >= 2 &&
											classArr[dataAboutUser.weekday - 1].filter(
												(item) => item !== ""
											).length <= 4
												? "занятия"
												: `${
														classArr[
															dataAboutUser.weekday - 1
														].filter((item) => item !== "")
															.length >= 5 &&
														classArr[
															dataAboutUser.weekday - 1
														].filter((item) => item !== "")
															.length <= 20
															? "занятий"
															: ``
												  }`
									  }`
						  }`
						: "Занятий нет"
				}\n\n${
					raspisanieText == ""
						? "В этот день нет мероприятий! 😉"
						: `${raspisanieText}\n${
								raspisanieText != ""
									? `<a href="https://t.me/${BotName}/?start=callson${dataAboutUser.weekday}">Звонки в этот день</a>`
									: ""
						  }`
				}</b>`,
				{
					parse_mode: "html",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "⬅️",
									callback_data: "previousweekday",
								},
								{
									text: `${
										dataAboutUser.weekday == dayW
											? `Сегодня`
											: `${weekDayNamesSHORT[dataAboutUser.weekday]}`
									}`,
									callback_data: "raspisanie",
								},
								{
									text: "➡️",
									callback_data: "nextweekday",
								},
							],

							[
								{ text: "⬅️Назад", callback_data: "exit" },
								{
									text: "Предметы 📙",
									callback_data: "allsubjects",
								},
							],
						],
					},
				}
			);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function allSubjectsCount(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	dataAboutUser.userAction = "RaspisanieText";

	try {
		const classArr =
			dataAboutUser.className == "10Г"
				? class10g
				: dataAboutUser.className == "10Б"
				? class10b
				: dataAboutUser.className == "10А"
				? class10a
				: dataAboutUser.className == "11Д"
				? class11d
				: dataAboutUser.className == "11Г"
				? class11g
				: dataAboutUser.className == "11В"
				? class11v
				: dataAboutUser.className == "11А"
				? class11a
				: [];

		if (dataAboutUser.className != "Не определен" && classArr.length > 0) {
			const subjectsCount = {};

			let j = 0;
			classArr.forEach((week) => {
				week.forEach((subject) => {
					const subjectKey = subject.trim();
					j++;
					if (subjectKey in subjectsCount) {
						subjectsCount[subjectKey]++;
					} else {
						subjectsCount[subjectKey] = 1;
					}
				});
			});

			// Преобразуем объект в массив для сортировки
			const sortedSubjects = Object.entries(subjectsCount).sort(
				(a, b) => b[1] - a[1]
			);

			let text = "";
			let i = 1;
			sortedSubjects.forEach(([subject, count]) => {
				if (subject != "") {
					text += `<b>${i}. </b> ${subject}: <b>${count}шт</b>\n`;
					i++;
				}
			});

			bot.editMessageText(
				`<b><i>📋 Все предметы  •  </i>${
					dataAboutUser.className
				} 📙\n\n</b>${text}\nВсего: <b> ${i - 1} ${
					i - 1 >= 5 && i - 1 <= 20
						? "предметов"
						: `${
								(i - 1) % 10 == 1
									? "предмет"
									: `${
											(i - 1) % 10 >= 2 && (i - 1) % 10 <= 4
												? "предмета"
												: ``
									  }`
						  }`
				}</b>\nВ неделю: <b>${j} ${
					i - 1 >= 5 && i - 1 <= 20
						? "предметов"
						: `${
								(i - 1) % 10 == 1
									? "предмет"
									: `${
											(i - 1) % 10 >= 2 && (i - 1) % 10 <= 4
												? "предмета"
												: ``
									  }`
						  }`
				}</b>`,
				{
					parse_mode: "HTML",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[{ text: "⬅️Назад", callback_data: "today" }],
						],
					},
				}
			);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function netClassaText(chatId, exitMenu = true) {
	try {
		if (exitMenu) {
			await bot.editMessageText(
				`*Грустно это осознавать, но видимо именно твой класс не входит в список программы _"Цифровые классы"_ 🫤\n\nНо\\! Ты всегда можешь написать @digfusionsupport, и уточнить все свои потребности\\! 😉*`,
				{
					parse_mode: "MarkdownV2",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️Назад", callback_data: "chooseclass0" },
								{
									text: "Поддержка 💭",
									url: "https://t.me/digfusionsupport",
								},
								,
							],
						],
					},
				}
			);
		} else if (!exitMenu) {
			await bot.editMessageText(
				`*Грустно это осознавать, но видимо именно твой класс не входит в список программы _"Цифровые классы"_ 🫤\n\nНо\\! Ты всегда можешь написать @digfusionsupport, и уточнить все свои потребности\\! 😉*`,
				{
					parse_mode: "MarkdownV2",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️К выбору", callback_data: "chooseclass1" },
								{
									text: "Поддержка 💭",
									url: "https://t.me/digfusionsupport",
								},
							],
						],
					},
				}
			);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function foodMenu(
	chatId,
	dayForFoodMenu = usersData.find((obj) => obj.chatId == chatId).weekday
) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	const dateNowHHMM = new Date().getHours() * 100 + new Date().getMinutes();

	const dataAboutDining = diningRoomData.find(
		(obj) =>
			obj.botName == BotName && obj.weekdayMenu == dataAboutUser.weekday
	);

	try {
		dataAboutUser.weekday = dayForFoodMenu;
		dataAboutUser.userAction = "foodMenu";

		if (dataAboutUser.schoolName) {
			await bot.editMessageText(
				`<b><i>🍜 Столовая</i> • ${
					weekDayNamesSHORT[dataAboutUser.weekday]
				} • <a href = "https://t.me/${BotName}/?start=editclass">${
					dataAboutUser.schoolName == "27c2"
						? "№27к2"
						: `${
								dataAboutUser.schoolName == "27c1"
									? "№27к1"
									: `Не указано`
						  }`
				}</a></b> 😋\n\n${
					dataAboutUser.weekday != 6 && dataAboutUser.weekday != 0
						? `<b><i>• ${
								dateNowHHMM >= 925 &&
								dateNowHHMM < 1105 &&
								dayW != 6 &&
								dayW != 0
									? "<u>Завтрак</u>"
									: "Завтрак"
						  }:</i>\n\n</b>${
								dataAboutUser.schoolName == "27c2"
									? `${foodmenu27c2[dataAboutUser.weekday - 1][0]}`
									: `${
											dataAboutUser.schoolName == "27c1"
												? `${
														foodmenu27c1[
															dataAboutUser.weekday - 1
														][0]
												  }`
												: `Не указано`
									  }`
						  }<b>\n\n<i>• ${
								dateNowHHMM >= 1300 &&
								dateNowHHMM < 1505 &&
								dayW != 6 &&
								dayW != 0
									? "<u>Обед</u>"
									: "Обед"
						  }:</i>\n\n</b>${
								dataAboutUser.schoolName == "27c2"
									? `${foodmenu27c2[dataAboutUser.weekday - 1][1]}`
									: `${
											dataAboutUser.schoolName == "27c1"
												? `${
														foodmenu27c1[
															dataAboutUser.weekday - 1
														][1]
												  }`
												: `Не указано`
									  }`
						  }\n\n<b>Рейтинг еды сегодня:\n<a href="https://t.me/${BotName}/?start=ratelikeonfood">👍</a>${
								dataAboutDining.countOfLikesOnFood
						  }   <a href="https://t.me/${BotName}/?start=rateneutralonfood">😑</a>${
								dataAboutDining.countOfNeutralOnFood
						  }   <a href="https://t.me/${BotName}/?start=ratedislikeonfood">👎</a>${
								dataAboutDining.countOfDislikesOnFood
						  }</b>`
						: `<b>Сегодня столовая закрыта! 🤷‍♂️</b>`
				}`,
				{
					parse_mode: "html",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "⬅️",
									callback_data: "foodmenupreviousday",
								},
								{
									text: `${
										dataAboutUser.weekday == dayW
											? `Сегодня`
											: `${weekDayNamesSHORT[dataAboutUser.weekday]}`
									}`,
									callback_data: "foodmenutoday",
								},
								{
									text: "➡️",
									callback_data: "foodmenunextday",
								},
							],

							[{ text: "⬅️Назад", callback_data: "exit" }],
						],
					},
				}
			);
		} else {
			await bot.editMessageText(
				`<b><i>🍜 Столовая 😋\n\nНе могу определить школу❗</i></b>\n\nДля начала выбери <b>класс!</b> 😉`,
				{
					parse_mode: "html",
					chat_id: chatId,
					disable_web_page_preview: true,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️Назад", callback_data: "exit" },
								{ text: "Выбрать ⚙️", callback_data: "chooseclass0" },
							],
						],
					},
				}
			);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function Calls(
	chatId,
	dayForCalls = usersData.find((obj) => obj.chatId == chatId).weekday
) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	try {
		const dateNowHHMM = new Date().getHours() * 100 + new Date().getMinutes();
		dataAboutUser.weekday = dayForCalls;
		dataAboutUser.userAction = "Calls";

		let countCalls = 0;
		if (dataAboutUser.callOnLesson) countCalls++;
		if (dataAboutUser.callOnBreak) countCalls++;
		if (dataAboutUser.callOnLessonIn5minutes) countCalls++;
		if (dataAboutUser.callOnLessonIn10minutes) countCalls++;
		if (dataAboutUser.callOnBreakIn5minutes) countCalls++;
		if (dataAboutUser.callOnBreakIn10minutes) countCalls++;

		const classArr =
			dataAboutUser.className == "10Г"
				? class10g
				: dataAboutUser.className == "10Б"
				? class10b
				: dataAboutUser.className == "10А"
				? class10a
				: dataAboutUser.className == "11Д"
				? class11d
				: dataAboutUser.className == "11Г"
				? class11g
				: dataAboutUser.className == "11В"
				? class11v
				: dataAboutUser.className == "11А"
				? class11a
				: [];

		if (dataAboutUser.className == "Не определен" || classArr == []) {
			await bot.editMessageText(
				`<b><i>⏰ Звонки 🕓\n\nНе нахожу твой класс❗</i></b>\n\nДля начала <b>выбери</b> его! 😉`,
				{
					parse_mode: "html",
					chat_id: chatId,
					disable_web_page_preview: true,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️В меню", callback_data: "exit" },
								{ text: "Выбрать ⚙️", callback_data: "chooseclass0" },
							],
						],
					},
				}
			);
		} else {
			// определение времени начала уроков

			let startTime = "";
			if (
				classArr &&
				classArr[dataAboutUser.weekday - 1] &&
				classArr[dataAboutUser.weekday - 1].length > 0
			) {
				if (
					classArr[dataAboutUser.weekday - 1].find(
						(className) => className !== ""
					)
				) {
					if (
						classArr[dataAboutUser.weekday - 1].indexOf(
							classArr[dataAboutUser.weekday - 1].find(
								(className) => className !== ""
							)
						) !== -1
					) {
						startTime =
							timesOnLesson[
								classArr[dataAboutUser.weekday - 1].indexOf(
									classArr[dataAboutUser.weekday - 1].find(
										(className) => className !== ""
									)
								)
							];
					}
				}
			}
			// определение времени конца уроков

			let endTime = "";
			if (
				classArr[dataAboutUser.weekday - 1] &&
				classArr[dataAboutUser.weekday - 1].length > 0
			) {
				if (
					classArr[dataAboutUser.weekday - 1].filter(
						(className) => className !== ""
					).length > 0 &&
					classArr[dataAboutUser.weekday - 1].indexOf(
						classArr[dataAboutUser.weekday - 1].filter(
							(className) => className !== ""
						)[
							classArr[dataAboutUser.weekday - 1].filter(
								(className) => className !== ""
							).length - 1
						]
					) !== -1
				) {
					endTime =
						timesOnBreak[
							classArr[dataAboutUser.weekday - 1].indexOf(
								classArr[dataAboutUser.weekday - 1].filter(
									(className) => className !== ""
								)[
									classArr[dataAboutUser.weekday - 1].filter(
										(className) => className !== ""
									).length - 1
								]
							)
						];
				}
			}

			await bot.editMessageText(
				`<b><i>⏰ Звонки</i> • <a href ="https://t.me/${BotName}/?start=editclass">${
					dataAboutUser.className
				}</a> • ${weekDayNamesSHORT[dataAboutUser.weekday]} 🕓\n</b>${
					classArr[dataAboutUser.weekday - 1] &&
					classArr[dataAboutUser.weekday - 1].filter((item) => item !== "")
						.length > 0
						? `\n<i>Начало в <b>${startTime}</b></i>\n${
								classArr[dataAboutUser.weekday - 1][0] &&
								classArr[dataAboutUser.weekday - 1][0] !== ""
									? `\n - ${
											dateNowHHMM >= 815 &&
											dateNowHHMM < 855 &&
											dataAboutUser.weekday == dayW
												? "<u><b>1</b> урок <b>08:15 - 08:55</b></u>"
												: "<b>1</b> урок <b>08:15 - 08:55</b>"
									  }\n`
									: ""
						  }${
								classArr[dataAboutUser.weekday - 1][1] &&
								classArr[dataAboutUser.weekday - 1][1] !== ""
									? `\n - ${
											dateNowHHMM >= 910 &&
											dateNowHHMM < 950 &&
											dataAboutUser.weekday == dayW
												? "<u><b>2</b> урок <b>09:10 - 09:50</b></u>"
												: "<b>2</b> урок <b>09:10 - 09:50</b>"
									  }\n`
									: ""
						  }${
								classArr[dataAboutUser.weekday - 1][2] &&
								classArr[dataAboutUser.weekday - 1][2] !== ""
									? `\n - ${
											dateNowHHMM >= 1005 &&
											dateNowHHMM < 1045 &&
											dataAboutUser.weekday == dayW
												? "<u><b>3</b> урок <b>10:05 - 10:45</b></u>"
												: "<b>3</b> урок <b>10:05 - 10:45</b>"
									  }\n`
									: ""
						  }${
								classArr[dataAboutUser.weekday - 1][3] &&
								classArr[dataAboutUser.weekday - 1][3] !== ""
									? `\n - ${
											dateNowHHMM >= 1050 &&
											dateNowHHMM < 1130 &&
											dataAboutUser.weekday == dayW
												? "<u><b>4</b> урок <b>10:50 - 11:30</b></u>"
												: "<b>4</b> урок <b>10:50 - 11:30</b>"
									  }\n`
									: ""
						  }${
								classArr[dataAboutUser.weekday - 1][4] &&
								classArr[dataAboutUser.weekday - 1][4] !== ""
									? `\n - ${
											dateNowHHMM >= 1145 &&
											dateNowHHMM < 1225 &&
											dataAboutUser.weekday == dayW
												? "<u><b>5</b> урок <b>11:45 - 12:25</b></u>"
												: "<b>5</b> урок <b>11:45 - 12:25</b>"
									  }\n`
									: ""
						  }${
								classArr[dataAboutUser.weekday - 1][5] &&
								classArr[dataAboutUser.weekday - 1][5] !== ""
									? `\n - ${
											dateNowHHMM >= 1245 &&
											dateNowHHMM < 1325 &&
											dataAboutUser.weekday == dayW
												? "<u><b>6</b> урок <b>12:45 - 13:25</b></u>"
												: "<b>6</b> урок <b>12:45 - 13:25</b>"
									  }\n`
									: ""
						  }${
								classArr[dataAboutUser.weekday - 1][6] &&
								classArr[dataAboutUser.weekday - 1][6] !== ""
									? `\n - ${
											dateNowHHMM >= 1330 &&
											dateNowHHMM < 1410 &&
											dataAboutUser.weekday == dayW
												? "<u><b>7</b> урок <b>13:30 - 14:10</b></u>"
												: "<b>7</b> урок <b>13:30 - 14:10</b>"
									  }\n`
									: ""
						  }\n<i>Домой в <b>${endTime}</b></i>\n\n<b><a href= "https://t.me/${BotName}/?start=raspisanieon${
								dataAboutUser.weekday
						  }">Уроки в этот день</a></b>`
						: "<b>\nСегодня звонки не звенят! 😉</b>"
				}`,
				{
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					parse_mode: "html",
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️", callback_data: "previousweekdaycalls" },
								{
									text: `${
										dataAboutUser.weekday == dayW
											? `Сегодня`
											: `${weekDayNamesSHORT[dataAboutUser.weekday]}`
									}`,
									callback_data: "todaycalls",
								},
								{ text: "➡️", callback_data: "nextweekdaycalls" },
							],
							[
								{ text: "⬅️В меню", callback_data: "exit" },
								{
									text: `Повтор ${
										countCalls > 0 ? `(${countCalls})` : ""
									} 🔔`,
									callback_data: "callsnotificationsmenu",
								},
							],
						],
					},
				}
			);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function NotificationsMenuCalls(
	chatId,
	callOnLesson = usersData.find((obj) => obj.chatId == chatId).callOnLesson,
	callOnBreak = usersData.find((obj) => obj.chatId == chatId).callOnBreak,
	callOnLessonIn5minutes = usersData.find((obj) => obj.chatId == chatId)
		.callOnLessonIn5minutes,
	callOnBreakIn5minutes = usersData.find((obj) => obj.chatId == chatId)
		.callOnBreakIn5minutes,
	callOnLessonIn10minutes = usersData.find((obj) => obj.chatId == chatId)
		.callOnLessonIn10minutes,
	callOnBreakIn10minutes = usersData.find((obj) => obj.chatId == chatId)
		.callOnBreakIn10minutes
) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	// Присваивание данных

	dataAboutUser.callOnLesson = callOnLesson;
	dataAboutUser.callOnBreak = callOnBreak;
	dataAboutUser.callOnLessonIn5minutes = callOnLessonIn5minutes;
	dataAboutUser.callOnBreakIn5minutes = callOnBreakIn5minutes;
	dataAboutUser.callOnLessonIn10minutes = callOnLessonIn10minutes;
	dataAboutUser.callOnBreakIn10minutes = callOnBreakIn10minutes;

	let countOnLesson = 0;
	let countOnBreak = 0;

	if (dataAboutUser.callOnLesson) countOnLesson++;
	if (dataAboutUser.callOnLessonIn5minutes) countOnLesson++;
	if (dataAboutUser.callOnLessonIn10minutes) countOnLesson++;
	if (dataAboutUser.callOnBreak) countOnBreak++;
	if (dataAboutUser.callOnBreakIn5minutes) countOnBreak++;
	if (dataAboutUser.callOnBreakIn10minutes) countOnBreak++;
	try {
		await bot.editMessageText(
			`*_${
				dataAboutUser.callOnBreak ||
				dataAboutUser.callOnLesson ||
				dataAboutUser.callOnBreakIn5minutes ||
				dataAboutUser.callOnLessonIn5minutes ||
				dataAboutUser.callOnBreakIn10minutes ||
				dataAboutUser.callOnLessonIn10minutes
					? "🔔 Повтор уведомлений 🔔"
					: "🔕 Повтор уведомлений 🔕"
			}\n\nНапоминания:_\n*На урок: *${
				dataAboutUser.callOnLesson ? "сразу" : ""
			}${
				dataAboutUser.callOnLesson && dataAboutUser.callOnLessonIn5minutes
					? ", "
					: `${
							dataAboutUser.callOnLesson &&
							dataAboutUser.callOnLessonIn10minutes
								? ", "
								: ""
					  }`
			}${dataAboutUser.callOnLessonIn5minutes ? "за 5" : ""}${
				dataAboutUser.callOnLessonIn5minutes &&
				dataAboutUser.callOnLessonIn10minutes
					? " и "
					: ""
			}${dataAboutUser.callOnLessonIn10minutes ? "за 10" : ""}${
				!dataAboutUser.callOnLesson &&
				!dataAboutUser.callOnLessonIn5minutes &&
				!dataAboutUser.callOnLessonIn10minutes
					? "не выбрано"
					: `${
							dataAboutUser.callOnLesson &&
							!dataAboutUser.callOnLessonIn5minutes &&
							!dataAboutUser.callOnLessonIn10minutes
								? ""
								: " минут"
					  }`
			}*\nНа перемену: *${dataAboutUser.callOnBreak ? "сразу" : ""}${
				dataAboutUser.callOnBreak && dataAboutUser.callOnBreakIn5minutes
					? ", "
					: `${
							dataAboutUser.callOnBreak &&
							dataAboutUser.callOnBreakIn10minutes
								? ", "
								: ""
					  }`
			}${dataAboutUser.callOnBreakIn5minutes ? "за 5" : ""}${
				dataAboutUser.callOnBreakIn5minutes &&
				dataAboutUser.callOnBreakIn10minutes
					? " и "
					: ""
			}${dataAboutUser.callOnBreakIn10minutes ? "за 10" : ""}${
				!dataAboutUser.callOnBreak &&
				!dataAboutUser.callOnBreakIn5minutes &&
				!dataAboutUser.callOnBreakIn10minutes
					? "не выбрано"
					: `${
							dataAboutUser.callOnBreak &&
							!dataAboutUser.callOnBreakIn5minutes &&
							!dataAboutUser.callOnBreakIn10minutes
								? ""
								: " минут"
					  }`
			}\n\n${
				dayW == 6 || dayW == 0
					? "_❗Звонки не активны \\- выходной❗_\n\n"
					: "_❗ПРОВЕРЬ УВЕДОМЛЕНИЯ❗_\n\n"
			}За сколько до звонка оповещать\\?* 🤔`,
			{
				parse_mode: "MarkdownV2",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: `На урок: ${countOnLesson}`,
								callback_data: "-",
							},
							{
								text: `На перемену: ${countOnBreak}`,
								callback_data: "-",
							},
						],
						[
							{
								text: `В момент ${
									dataAboutUser.callOnLesson ? "✅" : ""
								}`,
								callback_data: "toggleСallOnLesson",
							},
							{
								text: `В момент ${
									dataAboutUser.callOnBreak ? "✅" : ""
								}`,
								callback_data: "toggleСallOnBreak",
							},
						],
						[
							{
								text: `За 5 мин ${
									dataAboutUser.callOnLessonIn5minutes ? "✅" : ""
								}`,
								callback_data: "toggleСallOnLessonIn5minutes",
							},
							{
								text: `За 5 мин ${
									dataAboutUser.callOnBreakIn5minutes ? "✅" : ""
								}`,
								callback_data: "toggleСallOnBreakIn5minutes",
							},
						],
						[
							{
								text: `За 10 мин ${
									dataAboutUser.callOnLessonIn10minutes ? "✅" : ""
								}`,
								callback_data: "toggleСallOnLessonIn10minutes",
							},
							{
								text: `За 10 мин ${
									dataAboutUser.callOnBreakIn10minutes ? "✅" : ""
								}`,
								callback_data: "toggleСallOnBreakIn10minutes",
							},
						],

						[
							{ text: "⬅️Назад", callback_data: "calls" },
							{
								text: `${
									dataAboutUser.callOnLesson ||
									dataAboutUser.callOnBreak ||
									dataAboutUser.callOnLessonIn5minutes ||
									dataAboutUser.callOnLessonIn10minutes ||
									dataAboutUser.callOnBreakIn5minutes ||
									dataAboutUser.callOnBreakIn10minutes
										? "Сброс ❌"
										: ""
								}`,
								callback_data: "resetallcalls",
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function Games(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.userAction = "menuHome";
		await bot.editMessageText(
			`<b><i>😆 Развлечения 🕹️</i>${
				dataAboutUser.game1NiceResults + dataAboutUser.game1BadResults >
					dataAboutUser.game2NiceResults +
						dataAboutUser.game2BadResults +
						dataAboutUser.game2DrawResults &&
				dataAboutUser.game1NiceResults + dataAboutUser.game1BadResults >
					dataAboutUser.game3NiceResults +
						dataAboutUser.game3BadResults +
						dataAboutUser.game3DrawResults
					? "</b>\n\nЛюбимая: <b>Угадай-ка ❓"
					: `${
							dataAboutUser.game2NiceResults +
								dataAboutUser.game2BadResults +
								dataAboutUser.game2DrawResults >
								dataAboutUser.game1NiceResults +
									dataAboutUser.game1BadResults &&
							dataAboutUser.game2NiceResults +
								dataAboutUser.game2BadResults +
								dataAboutUser.game2DrawResultss >
								dataAboutUser.game3NiceResults +
									dataAboutUser.game3BadResults +
									dataAboutUser.game3DrawResults
								? "</b>\n\nЛюбимая: <b>Цуе-Фа ✌️"
								: `${
										dataAboutUser.game3NiceResults +
											dataAboutUser.game3BadResults +
											dataAboutUser.game3DrawResults >
											dataAboutUser.game1NiceResults +
												dataAboutUser.game1BadResults &&
										dataAboutUser.game3NiceResults +
											dataAboutUser.game3BadResults +
											dataAboutUser.game3DrawResults >
											dataAboutUser.game2NiceResults +
												dataAboutUser.game2BadResults +
												dataAboutUser.game2DrawResults
											? "</b>\n\nЛюбимая: <b>❌ Кр-Нолики ⭕"
											: ""
								  }`
					  }`
			}\n\nВо что сыграем? 🤔</b>`,
			{
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				parse_mode: "html",
				reply_markup: {
					inline_keyboard: [
						[{ text: "❌ Крестики-Нолики ⭕", callback_data: "game3" }],
						[
							{ text: "Угадай-ка ❓", callback_data: "game1" },
							{ text: "Цуе-Фа ✌️", callback_data: "game2" },
						],
						// [{ text: "Рейтинг 🥇", callback_data: "bestplayerslist" }],
						[{ text: "⬅️В меню", callback_data: "exit" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function game1(chatId, startGame = true) {
	try {
		if (startGame)
			//? загаданное число
			rndNum = Math.floor(Math.random() * 10);
		bot.editMessageText(
			`*_❓ Угадай\\-ка ❓_\n\nЯ загадал цифру\\! ${
				chatId == qu1z3xId ? rndNum : ""
			}\n\nОтгадывай 😉*`,
			{
				parse_mode: "MarkdownV2",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "1", callback_data: "1" },
							{ text: "2", callback_data: "2" },
							{ text: "3", callback_data: "3" },
						],
						[
							{ text: "4", callback_data: "4" },
							{ text: "5", callback_data: "5" },
							{ text: "6", callback_data: "6" },
						],
						[
							{ text: "7", callback_data: "7" },
							{ text: "8", callback_data: "8" },
							{ text: "9", callback_data: "9" },
						],
						[
							{ text: "⬅️", callback_data: "games" },
							{ text: "0", callback_data: "0" },
							{ text: "💡", callback_data: "hint" },
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function game2(chatId) {
	try {
		await bot.editMessageText(
			"*_✋ Цуе\\-Фа ✌️_\n\nСоперник уже на подходе❗😥\n\nЧто выберешь❓*",
			{
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				parse_mode: "MarkdownV2",
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "✊", callback_data: "stoneGame2" },
							{ text: "✌️", callback_data: "scissorsGame2" },
							{ text: "🖐️", callback_data: "paperGame2" },
						],
						[{ text: "⬅️Назад", callback_data: "games" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function game2_2(chatId, playerNum) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	const options = ["✊", "✌️", "🖐️"];
	rndNum = Math.floor(Math.random() * options.length);

	try {
		if (options[playerNum - 1] == options[rndNum]) {
			bot.editMessageText(
				`*_🪨 Камень\\-Ножницы\\-Бумага ✂️_\n\n🤷‍♂️ Ничья\\! 🤷‍♀️\n\nРезультат\\:\n 👤${
					options[playerNum - 1]
				}  vs  [${
					options[rndNum]
				}](https://t.me/${BotName}/?start=minidetail3)🤖\n\n[Статистика](https://t.me/${BotName}/?start=options)\n\nЕще партейку\\? 🤔*`,
				{
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					parse_mode: "MarkdownV2",
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️В меню", callback_data: "games" },
								{ text: "Давай👌", callback_data: "game2" },
							],
						],
					},
				}
			);
			dataAboutUser.game2DrawResults += 1;
		} else if (
			(options[playerNum - 1] == "✊" && options[rndNum] == "✌️") ||
			(options[playerNum - 1] == "✌️" && options[rndNum] == "🖐️") ||
			(options[playerNum - 1] == "🖐️" && options[rndNum] == "✊")
		) {
			bot.editMessageText(
				`*_🪨 Камень\\-Ножницы\\-Бумага ✂️_\n\n🥇 Выигрыш\\! 🥳\n\nРезультат:\n 👤${
					options[playerNum - 1]
				}  vs  [${
					options[rndNum]
				}](https://t.me/${BotName}/?start=minidetail3)🤖\n\n[Статистика](https://t.me/${BotName}/?start=options)\n\nЕще партейку\\? 🤔*`,
				{
					parse_mode: "MarkdownV2",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️Назад", callback_data: "games" },
								{ text: "Давай👌", callback_data: "game2" },
							],
						],
					},
				}
			);
			dataAboutUser.game2NiceResults += 1;
		} else {
			bot.editMessageText(
				`*_🪨 Камень\\-Ножницы\\-Бумага ✂️_\n\n🥈 Поражение\\! 😔\n\nРезультат:\n 👤${
					options[playerNum - 1]
				}  vs  [${
					options[rndNum]
				}](https://t.me/${BotName}/?start=minidetail3)🤖\n\n[Статистика](https://t.me/${BotName}/?start=options)\n\nЕще партейку\\? 🤔*`,
				{
					parse_mode: "MarkdownV2",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️Назад", callback_data: "games" },
								{ text: "Давай👌", callback_data: "game2" },
							],
						],
					},
				}
			);
			dataAboutUser.game2BadResults += 1;
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function game3(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.userAction = "menuHome";
		await bot.editMessageText(
			`<b><i>❌ Крестики-Нолики ⭕</i></b>\n\nТы ходишь за: <b>${
				dataAboutUser.game3PlayerSticker == "❌"
					? "❌"
					: `${
							dataAboutUser.game3PlayerSticker == "⭕"
								? "⭕"
								: "Не выбрано"
					  }`
			}</b>\nСложность: <b>${
				dataAboutUser.game3Difficulty == 0
					? "Легко"
					: `${
							dataAboutUser.game3Difficulty == 2
								? "Средняя"
								: `${
										dataAboutUser.game3Difficulty == 1
											? "Тяжело"
											: "Не выбрано"
								  }`
					  }`
			}\n\nПараметры игры ⚙️</b>`,
			{
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: `${
									dataAboutUser.game3PlayerSticker == "❌"
										? "• ❌ •"
										: "❌"
								}`,
								callback_data: `${
									dataAboutUser.game3PlayerSticker == "❌"
										? "-"
										: "XGame3"
								}`,
							},
							{
								text: `${
									dataAboutUser.game3PlayerSticker == "⭕"
										? "• ⭕ •"
										: "⭕"
								}`,
								callback_data: `${
									dataAboutUser.game3PlayerSticker == "⭕"
										? "-"
										: "OGame3"
								}`,
							},
						],
						[
							{
								text: `${
									dataAboutUser.game3Difficulty == 0 ? "• 😪 •" : "😪"
								}`,
								callback_data: `${
									dataAboutUser.game3Difficulty == 0
										? "-"
										: "Dificulty0Game3"
								}`,
							},
							{
								text: `${
									dataAboutUser.game3Difficulty == 2 ? "• 🤨 •" : "🤨"
								}`,
								callback_data: `${
									dataAboutUser.game3Difficulty == 2
										? "-"
										: "Dificulty2Game3"
								}`,
							},
							{
								text: `${
									dataAboutUser.game3Difficulty == 1 ? "• 😡 •" : "😡"
								}`,
								callback_data: `${
									dataAboutUser.game3Difficulty == 1
										? "-"
										: "Dificulty1Game3"
								}`,
							},
						],
						[
							{ text: "⬅️Назад", callback_data: "games" },
							{
								text: `${
									dataAboutUser.game3PlayerSticker != "" &&
									dataAboutUser.game3Difficulty != 3
										? "Играть✅"
										: ""
								}`,
								callback_data: "game3_2",
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function game3_2(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.userAction = "game3_2";

		dataAboutUser.playerGame3Board = [
			[" ", " ", " "],
			[" ", " ", " "],
			[" ", " ", " "],
		];
		await bot.editMessageText(
			`<b><i>❌ Крестики-Нолики ⭕</i>\n\nУдачи! 😉\nНачинаешь ты ${dataAboutUser.game3PlayerSticker}</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: " ", callback_data: "0|0" },
							{ text: " ", callback_data: "0|1" },
							{ text: " ", callback_data: "0|2" },
						],
						[
							{ text: " ", callback_data: "1|0" },
							{ text: " ", callback_data: "1|1" },
							{ text: " ", callback_data: "1|2" },
						],
						[
							{ text: " ", callback_data: "2|0" },
							{ text: " ", callback_data: "2|1" },
							{ text: " ", callback_data: "2|2" },
						],
						[{ text: "⬅️Назад", callback_data: "game3" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

function game3Result(chatId, gameIsDraw = false) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		for (let i = 0; i < 3; i++) {
			// Горизонтали
			if (
				dataAboutUser.playerGame3Board[i][0] !== " " &&
				dataAboutUser.playerGame3Board[i][0] ==
					dataAboutUser.playerGame3Board[i][1] &&
				dataAboutUser.playerGame3Board[i][1] ==
					dataAboutUser.playerGame3Board[i][2]
			) {
				return `${dataAboutUser.playerGame3Board[i][0]}`;
			}
			// Вертикали
			else if (
				dataAboutUser.playerGame3Board[0][i] !== " " &&
				dataAboutUser.playerGame3Board[0][i] ==
					dataAboutUser.playerGame3Board[1][i] &&
				dataAboutUser.playerGame3Board[1][i] ==
					dataAboutUser.playerGame3Board[2][i]
			) {
				return `${dataAboutUser.playerGame3Board[0][i]}`;
				// Диогонали
			} else if (
				dataAboutUser.playerGame3Board[0][0] !== " " &&
				dataAboutUser.playerGame3Board[0][0] ==
					dataAboutUser.playerGame3Board[1][1] &&
				dataAboutUser.playerGame3Board[1][1] ==
					dataAboutUser.playerGame3Board[2][2]
			) {
				return `${dataAboutUser.playerGame3Board[0][0]}`;
			} else if (
				dataAboutUser.playerGame3Board[0][2] !== " " &&
				dataAboutUser.playerGame3Board[0][2] ==
					dataAboutUser.playerGame3Board[1][1] &&
				dataAboutUser.playerGame3Board[1][1] ==
					dataAboutUser.playerGame3Board[2][0]
			) {
				return `${dataAboutUser.playerGame3Board[0][2]}`;
			}
		}
		if (gameIsDraw) {
			return "Ничья!";
		}
		return null;
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
		return null;
	}
}

function game3InlineKeyboard(chatId, isPlayer = true) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	let buttons = [];

	try {
		if (isPlayer) {
			buttons = dataAboutUser.playerGame3Board.map((row, rowIndex) => {
				return row.map((cell, colIndex) => {
					const text = cell == " " ? " " : cell;
					const callbackData = `${rowIndex}|${colIndex}`;
					return { text, callback_data: callbackData };
				});
			});
		} else if (!isPlayer) {
			buttons = dataAboutUser.playerGame3Board.map((row, rowIndex) => {
				return row.map((cell, colIndex) => {
					const text = cell == " " ? " " : cell;
					return { text, callback_data: "-" };
				});
			});
		}

		buttons.push([
			{ text: "⬅️Назад", callback_data: "game3" },
			{ text: "Заново🔄️", callback_data: "game3_2" },
		]);

		return { inline_keyboard: buttons };
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

function checkUsersActivity() {
	try {
		for (let i = 0; i < usersData.length; i++) {
			const currentTime = Date.now();

			if (
				currentTime - usersData[i].lastActivity >=
					7 * 24 * 60 * 60 * 1000 &&
				currentTime - usersData[i].lastActivity < 9 * 24 * 60 * 60 * 1000 &&
				!usersData[i].reminderForReturn1
			) {
				if (usersData[i].remindersForReturnIsActive) {
					usersData[i].reminderForReturn1 = true;
					sendNotificationForReturn(usersData[i].chatId);
					console.log(1);
				}
			} else if (
				currentTime - usersData[i].lastActivity >=
					9 * 24 * 60 * 60 * 1000 &&
				currentTime - usersData[i].lastActivity <
					13 * 24 * 60 * 60 * 1000 &&
				!usersData[i].reminderForReturn2
			) {
				if (usersData[i].remindersForReturnIsActive) {
					usersData[i].reminderForReturn2 = true;
					sendNotificationForReturn(usersData[i].chatId);
				}
			} else if (
				currentTime - usersData[i].lastActivity >=
					13 * 24 * 60 * 60 * 1000 &&
				currentTime - usersData[i].lastActivity <
					16 * 24 * 60 * 60 * 1000 &&
				!usersData[i].reminderForReturn3
			) {
				if (usersData[i].remindersForReturnIsActive) {
					usersData[i].reminderForReturn3 = true;
					sendNotificationForReturn(usersData[i].chatId);
				}
			} else if (
				currentTime - usersData[i].lastActivity >=
					16 * 24 * 60 * 60 * 1000 &&
				!usersData[i].reminderForReturn4
			) {
				if (usersData[i].remindersForReturnIsActive) {
					usersData[i].reminderForReturn4 = true;
					sendNotificationForReturn(usersData[i].chatId);
				}
			}
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

function sendNotificationForReturn(chatId) {
	const textsForUsersReturn = [
		"Без тебя совсем не то! Не пропадай, загляни как сможешь! 🙏",
		"Без твоего присутствия что-то не хватает! Заглядывай, когда у тебя будет время! 😉",
		"А какой в среду 3-й урок? Я могу тебе подсказать, возвращайся! 😉",
		"Мы давно не встречались! Заходи почаще! 🙏",
		"Моя цифровая память подсказывает, что тебя со мной давно не было! ☹️",
	];
	let rndNum = Math.floor(Math.random() * textsForUsersReturn.length);

	try {
		bot.sendMessage(chatId, `<b>${textsForUsersReturn[rndNum]}</b>`, {
			parse_mode: "html",
			disable_web_page_preview: true,
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: "Отключить 🔕",
							callback_data: `remindersforreturnOff`,
						},
						{
							text: "Удалить ❌",
							callback_data: `deleteexcess`,
						},
					],
				],
			},
		});
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function News(chatId, newsNum, newsName) {
	let news1Button, news2Button, news3Button;

	let newsButtons = [
		{ text: "Новости 📖", callback_data: "news" },
		{ text: "• Новости 📖 •", callback_data: "-" },
		{ text: "О боте 🤖", callback_data: "botnews" },
		{ text: "• О боте 🤖 •", callback_data: "-" },
		{ text: "О школе 🏫", callback_data: "schoolnews" },
		{ text: "• О школе 🏫 •", callback_data: "-" },
	];

	if (newsNum == 1) {
		news1Button = 1;
		news2Button = 2;
		news3Button = 4;
	} else if (newsNum == 2) {
		news1Button = 0;
		news2Button = 3;
		news3Button = 4;
	} else if (newsNum == 3) {
		news1Button = 0;
		news2Button = 2;
		news3Button = 5;
	}

	try {
		await bot.editMessageText(
			`<b><i>❗ Интересное | ${newsName}</i></b>\n\n${newsText[newsNum]}\n\n<b>• По любым вопросам к @digfusionsupport</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[newsButtons[news1Button]],
						[newsButtons[news2Button], newsButtons[news3Button]],
						[
							{ text: "⬅️В меню", callback_data: "exit" },
							{ text: "Обновить🔄️", callback_data: "news" },
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function allNewsTextEdit(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.userAction = "allNewsTextEdit";
		bot.editMessageText(
			`<b><i>✏️ Редактирование: Новости 📖</i>\n\n📖 Текущий текст:</b>\n\n<code>${newsText[1]}</code>\n\n<b>Напиши измененный текст ниже ✍️</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "⬅️Назад", callback_data: "adminMenu" },
							{
								text: "Сбросить ❌",
								callback_data: "allnewstextRESETmenu",
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function allNewsTextEdit_2(chatId, text) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.userAction = "menuHome";
		bot.editMessageText(
			`<b><i>✏️ Редактирование: Новости 📖</i>\n\n🆕 Измененный текст:</b>\n\n<i>"${text}"</i>\n\n<b>Применить изменения?🧐</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "Сбросить ❌",
								callback_data: "allnewstextRESETmenu",
							},
							{ text: "Применить✅", callback_data: "allnewsadd" },
						],
						[{ text: "⬅️Назад", callback_data: "allnewsEDIT" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function AllNewsTextReset(chatId) {
	try {
		await bot.editMessageText(
			`*_✏️ Редактирование: Новости 📖_\n\nCбросить раздел _"Новости 📖"_ ⁉️*`,
			{
				parse_mode: "MarkdownV2",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "⬅️Назад", callback_data: "adminMenu" },
							{
								text: "Сбросить ✅",
								callback_data: "allnewstextRESETend",
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function Settings(chatId) {
	const countRem = remindersData.filter(
		(obj) => obj.chatId == chatId && obj.isDone == false
	).length;
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	let countCalls = 0;
	if (dataAboutUser.callOnLesson) countCalls++;
	if (dataAboutUser.callOnBreak) countCalls++;
	if (dataAboutUser.callOnLessonIn5minutes) countCalls++;
	if (dataAboutUser.callOnLessonIn10minutes) countCalls++;
	if (dataAboutUser.callOnBreakIn5minutes) countCalls++;
	if (dataAboutUser.callOnBreakIn10minutes) countCalls++;

	try {
		await bot.editMessageText(
			`<b><i>🛠️ Настройки • <code>${chatId}</code> ⚙️</i>\n\nДанные:</b>\nТвой логин: <b>${
				dataAboutUser.login
			}</b> - <a href="https://t.me/${BotName}/?start=editfistname">изменить</a>\nРоль: <b>${
				dataAboutUser.userStatus
			}</b>\nШкола: <b>${
				dataAboutUser.schoolName == "27c2"
					? "МБОУ СОШ №27к2"
					: `${
							dataAboutUser.schoolName == "27c1"
								? "МБОУ СОШ №27к1"
								: `${
										dataAboutUser.schoolName == "" ? "Нет данных" : ""
								  }`
					  }`
			}</b>\nКласс: <b>${
				dataAboutUser.className
			}</b> - <a href="https://t.me/${BotName}/?start=editclass">${
				dataAboutUser.className == "Не определен" ? "выбрать" : "изменить"
			}</a>\n\n<b>Уведомления:</b>\nЗвонки: <b>${
				dataAboutUser.callOnLesson ||
				dataAboutUser.callOnBreak ||
				dataAboutUser.callOnLessonIn5minutes ||
				dataAboutUser.callOnLessonIn10minutes ||
				dataAboutUser.callOnBreakIn5minutes ||
				dataAboutUser.callOnBreakIn10minutes
					? `✅ (${countCalls})`
					: "❌"
			}</b> - <a href="https://t.me/${BotName}/?start=notificationsmenucalls">${
				dataAboutUser.callOnLesson ||
				dataAboutUser.callOnBreak ||
				dataAboutUser.callOnLessonIn5minutes ||
				dataAboutUser.callOnLessonIn10minutes ||
				dataAboutUser.callOnBreakIn5minutes ||
				dataAboutUser.callOnBreakIn10minutes
					? "изменить"
					: "включить"
			}</a>\nНапоминание о себе: ${
				dataAboutUser.remindersForReturnIsActive ? "✅" : "❌"
			} - ${
				dataAboutUser.remindersForReturnIsActive
					? `<a href="https://t.me/${BotName}/?start=remindersforreturntoggle">выкл</a>`
					: `<a href="https://t.me/${BotName}/?start=remindersforreturntoggle">вкл</a>`
			}\nНапоминания: <b>${
				countRem > 0 ? "✅🔔" : "❌"
			}</b>\nСоздано: <b>${countRem}</b> - ${
				countRem > 0
					? `<a href="https://t.me/${BotName}/?start=remindersList">список</a>`
					: `<a href="https://t.me/${BotName}/?start=remindersAdd">создать</a>`
			}<b>\n\nСтатистика в играх:</b>\nУгадай-ка: <b>${
				dataAboutUser.game1NiceResults + dataAboutUser.game1BadResults >
					0 &&
				Math.round(
					(dataAboutUser.game1NiceResults /
						(dataAboutUser.game1NiceResults +
							dataAboutUser.game1BadResults)) *
						10000
				) / 100
					? `${
							Math.round(
								(dataAboutUser.game1NiceResults /
									(dataAboutUser.game1NiceResults +
										dataAboutUser.game1BadResults)) *
									10000
							) / 100
					  }% ✅, из ${
							dataAboutUser.game1NiceResults +
							dataAboutUser.game1BadResults
					  }`
					: "Нет данных"
			}</b>\nЦуе-фа: <b>${
				dataAboutUser.game2NiceResults +
					dataAboutUser.game2BadResults +
					dataAboutUser.game2DrawResults >
					0 &&
				Math.round(
					(dataAboutUser.game2NiceResults /
						(dataAboutUser.game2NiceResults +
							dataAboutUser.game2BadResults +
							dataAboutUser.game2DrawResults)) *
						10000
				) / 100
					? `${
							Math.round(
								(dataAboutUser.game2NiceResults /
									(dataAboutUser.game2NiceResults +
										dataAboutUser.game2BadResults +
										dataAboutUser.game2DrawResults)) *
									10000
							) / 100
					  }% <a href="https://t.me/${BotName}/?start=minidetail7">✅</a>, из ${
							dataAboutUser.game2NiceResults +
							dataAboutUser.game2BadResults +
							dataAboutUser.game2DrawResults
					  }`
					: "Нет данных"
			}</b>\nКр-нолики: <b>${
				dataAboutUser.game3NiceResults +
					dataAboutUser.game3BadResults +
					dataAboutUser.game3DrawResults >
					0 &&
				Math.round(
					(dataAboutUser.game3NiceResults /
						(dataAboutUser.game3NiceResults +
							dataAboutUser.game3BadResults +
							dataAboutUser.game3DrawResults)) *
						10000
				) / 100
					? `${
							Math.round(
								(dataAboutUser.game3NiceResults /
									(dataAboutUser.game3NiceResults +
										dataAboutUser.game3BadResults +
										dataAboutUser.game3DrawResults)) *
									10000
							) / 100
					  }% ✅, из ${
							dataAboutUser.game3NiceResults +
							dataAboutUser.game3BadResults +
							dataAboutUser.game3DrawResults
					  }`
					: "Нет данных"
			}</b>\nПасхалки: <b>${
				dataAboutUser.miniDetail666 +
				dataAboutUser.miniDetail0 +
				dataAboutUser.miniDetail1 +
				dataAboutUser.miniDetail2 +
				dataAboutUser.miniDetail3 +
				dataAboutUser.miniDetail4 +
				dataAboutUser.miniDetail5 +
				dataAboutUser.miniDetail6 +
				dataAboutUser.miniDetail7 +
				dataAboutUser.miniDetail8 +
				dataAboutUser.miniDetail9
			} / ${maxCountMiniDetails} ${
				dataAboutUser.miniDetail666 +
					dataAboutUser.miniDetail0 +
					dataAboutUser.miniDetail1 +
					dataAboutUser.miniDetail2 +
					dataAboutUser.miniDetail3 +
					dataAboutUser.miniDetail4 +
					dataAboutUser.miniDetail5 +
					dataAboutUser.miniDetail6 +
					dataAboutUser.miniDetail7 +
					dataAboutUser.miniDetail8 +
					dataAboutUser.miniDetail9 >=
				maxCountMiniDetails
					? "✅"
					: ""
			}</b> - <a href= "https://t.me/${BotName}/?start=detailsRules">как это?</a>\n\n<b><a href= "https://t.me/${BotName}/?start=rules2">Правила пользования ресурсом</a></b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "Поддержка 💭",
								url: "https://t.me/digfusionsupport",
							},
						],
						[
							{ text: "⬅️В меню", callback_data: "exit" },
							{
								text: "Прочие➡️",
								callback_data: "settingsother",
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function Settings_2(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		await bot.editMessageText(
			`<b><i>🛠️ Прочие настройки ⚙️</i>\n\n❗Раздел повышенной опасности❗\n\nАктивность:\n</b>Игр сыграно: <b>${
				dataAboutUser.game1NiceResults +
				dataAboutUser.game1BadResults +
				dataAboutUser.game2NiceResults +
				dataAboutUser.game2BadResults +
				dataAboutUser.game2DrawResults +
				dataAboutUser.game3NiceResults +
				dataAboutUser.game3BadResults +
				dataAboutUser.game3DrawResults
			}\n</b>Действий всего: <b>${
				dataAboutUser.countOfActions
			}\n</b>Регистрация: <b>${
				dataAboutUser.dateOfRegistration
			}\n\nПригласительный:\n<code>https://t.me/${BotName}/?start=</code></b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "Новый диалог ♻️", callback_data: "start" },
							{ text: "Перезапуск 🔄️", callback_data: "restart1" },
						],
						[
							{
								text: "❌ Удалить Аккаунт❗",
								callback_data: "deleteaccount",
							},
						],
						[
							{ text: "⬅️Назад", callback_data: "settings" },
							{
								text: "digfusion❔",
								callback_data: "moreAboutUs",
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function moreAboutUs(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		await bot.editMessageText(
			`<b><i>❔digfusion • О нас 💁🏻‍♂️</i></b>\n\nКомпания <b><i>digfusion</i></b> - <b>начинающий стартап,</b> разрабатывающий <b>свои приложения</b> и предоставляющий услуги по <b>созданию чат-ботов</b> различных типов! ☑️\n\nПросмотреть все <b>наши проекты, реальные отзывы, каталог услуг</b> и <b>прочую информацию о компании</b> можно в нашем <b>Telegram канале</b> и <b>боте-консультанте! 🤗\n\n<a href="https://t.me/digfusion">digfusion | инфо</a> • <a href="https://t.me/digfusionbot">digfusion | услуги</a></b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "⬅️Назад", callback_data: "settingsother" },
							{
								text: "Поддержка 💭",
								url: "https://t.me/digfusionsupport",
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
	}
}

async function editFistName(chatId, after) {
	try {
		const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

		dataAboutUser.userAction = "editFistName";

		await bot.editMessageText(
			`<i><b>🛠️ Изменение логина ⚙️\n\n</b>Логин используется для идентификации пользователя! 🔒</i><b>\n\n${
				after ? "Изменённый:" : "Текущий:"
			}  <code>${dataAboutUser.login}</code>${
				after ? "" : "\n\nНапиши изменённый логин ✍️"
			}</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: `${
									dataAboutUser.login ==
									dataAboutUser.telegramFirstName
										? "⬅️Назад"
										: ""
								}`,
								callback_data: "settings",
							},
							{
								text: `${
									dataAboutUser.login !=
									dataAboutUser.telegramFirstName
										? "Сбросить❌"
										: ""
								}`,
								callback_data: "resetfirstname",
							},
							{ text: "Принять✅", callback_data: "settings" },
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function adminMenu(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.userAction = "menuHome";

		await bot.editMessageText(
			`<b><i>💠Центр управления💠</i>\n\nЧем я могу быть полезен? 🤖</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "Реестр 💾", callback_data: "usersdatalist" },
							{
								text: "Черный список 📋",
								callback_data: "usersblacklist",
							},
						],
						[
							{
								text: "Изменение ✏️",
								callback_data: "adminMenuEdit",
							},
							{
								text: "Объявление 📢",
								callback_data: "adminMenuSendMessage",
							},
						],
						[{ text: "⬅️Назад", callback_data: "exit" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function adminMenuSendMessage(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.userAction = "adminMenuSendMessage";

		await bot.editMessageText(
			"<b><i>📋 Объявление 📢 \n\n❗ВНИМАНИЕ❗</i>\n\nВсе пользователи получат уведомление!\n\n<i>Пример:</i>\n</b><code>В школе родительское собрание❗😉</code><b>\n\nНапиши объявление ниже ✍️</b>",
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				reply_markup: {
					inline_keyboard: [
						[{ text: "⬅️Назад", callback_data: "adminMenu" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function adminMenuSendMessage_2(chatId, recipient) {
	try {
		await bot.editMessageText(
			`<b><i>📋 Создание объявления 📢</i>\n\n</b>Объявление <b>успешно</b> опубликовано! 😉✅`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "⬅️Назад", callback_data: "adminMenu" },
							{
								text: "Создать еше ➕",
								callback_data: "adminMenuSendMessage",
							},
						],
					],
				},
			}
		);
		for (let i = 0; i < usersData.length; i++) {
			if (usersData[i].chatId != qu1z3xId) {
				bot.sendMessage(
					usersData[i].chatId,
					`<b><i>${paragrafs[numberArr]}</i>\n\n${textMessageForAllUsers}</b>`,
					{
						parse_mode: "html",
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "Удалить ❌",
										callback_data: "deleteexcess",
									},
									{
										text: "Спасибо 👍",
										callback_data: "deleteexcess",
									},
								],
							],
						},
					}
				);
			}
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function adminMenuSendMessageSettings(chatId) {
	try {
		await bot.editMessageText(
			`<b><i>📋 Заголовок объявления 📢\n\n</i></b>Объявление выглядит так:\n\n<b><i>${paragrafs[numberArr]}</i>\n\n${textMessageForAllUsers}</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: `${
									numberArr == 0
										? `• ${paragrafs[0]} •`
										: `${paragrafs[0]}`
								}`,
								callback_data: "p0",
							},
						],
						[
							{
								text: `${
									numberArr == 1
										? `• ${paragrafs[1]} •`
										: `${paragrafs[1]}`
								}`,
								callback_data: "p1",
							},
						],
						[
							{
								text: `${
									numberArr == 2
										? `• ${paragrafs[2]} •`
										: `${paragrafs[2]}`
								}`,
								callback_data: "p2",
							},
						],
						[
							{
								text: `${
									numberArr == 3
										? `• ${paragrafs[3]} •`
										: `${paragrafs[3]}`
								}`,
								callback_data: "p3",
							},
						],
						[
							{
								text: "⬅️Назад",
								callback_data: "adminMenuSendMessage",
							},
							{
								text: "Создать ✅",
								callback_data: "adminMenuSendMessage2",
							},
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function adminMenuEdit(chatId) {
	try {
		await bot.editMessageText(
			`<b><i>📖 Изменение ✏️</i>${
				buttonUpdateActive
					? ""
					: `\n\n<i>Примечание:</i>\n</b>Интервал обновления данных 1 мин 🕑<b>`
			}\n\nКакие правки нужно внести? 🤖</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: `Расписание ✏️`,
								url: "https://docs.google.com/spreadsheets/d/18xSi-VnqkjKbY9se4Q4bYeVPZAVqfHZd97nkVtYTiwY/edit#gid=0",
							},
							{
								text: `${
									buttonUpdateActive ? "Обновить ✅" : "Через 5м 🕑"
								}`,
								callback_data: `${
									buttonUpdateActive ? "updateraspisaniesheets" : "-"
								}`,
							},
						],
						[
							{
								text: `База данных ✏️`,
								url: "https://console.firebase.google.com/u/0/project/digschraspisanie/database/digschraspisanie-default-rtdb/data",
							},
							{
								text: `${
									buttonUpdateActive ? "Обновить ✅" : "Через 5м 🕑"
								}`,
								callback_data: `${
									buttonUpdateActive ? "readnewdatabase" : "-"
								}`,
							},
						],
						[
							{
								text: `✏️Изменить "Новости📖"`,
								callback_data: "allnewsEDIT",
							},
						],
						[{ text: "⬅️Назад", callback_data: "adminMenu" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function registryUsersData(chatId, listNum) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.userAction = "registryUsersData";

		// сортировка по количеству активности в боте
		usersData.sort((a, b) => b.countOfActions - a.countOfActions);

		let text = "";
		if (listNum == 1) {
			for (let i = 0; i < usersData.length; i++) {
				let countCalls = 0;
				if (usersData[i].callOnLesson) countCalls++;
				if (usersData[i].callOnBreak) countCalls++;
				if (usersData[i].callOnLessonIn5minutes) countCalls++;
				if (usersData[i].callOnLessonIn10minutes) countCalls++;
				if (usersData[i].callOnBreakIn5minutes) countCalls++;
				if (usersData[i].callOnBreakIn10minutes) countCalls++;

				text += `[${i + 1}]  ${
					usersData[i].inBlackList
						? `<a href="https://t.me/${BotName}/?start=deletefromblacklistuser${usersData[i].chatId}">❌</a>`
						: ``
				} @${usersData[i].username}${
					usersData[i].chatId != qu1z3xId && !usersData[i].inBlackList
						? `${
								!usersData[i].inBlackList
									? `<a href="https://t.me/${BotName}/?start=addtoblacklistuser${usersData[i].chatId}"> - забанить ❌</a>`
									: ``
						  }`
						: ""
				}\n${usersData[i].inBlackList ? `<s>` : ``}• login: ${
					usersData[i].login != usersData[i].telegramFirstName
						? `${usersData[i].login} (${usersData[i].telegramFirstName})`
						: `${usersData[i].login}`
				}\n• chatId: <code>${usersData[i].chatId}</code>\n• userStatus: ${
					usersData[i].userStatus
				}\n• className: "${usersData[i].className}"\n• gamesPlayed: ${
					usersData[i].game1BadResults +
					usersData[i].game1NiceResults +
					usersData[i].game2BadResults +
					usersData[i].game2NiceResults +
					usersData[i].game2DrawResults +
					usersData[i].game3BadResults +
					usersData[i].game3NiceResults +
					usersData[i].game3DrawResults
				}\n• totalActions: ${
					usersData[i].countOfActions
				} \n• callsReminders: ${countCalls}\n• detailsFound: ${
					usersData[i].miniDetail666 +
					usersData[i].miniDetail0 +
					usersData[i].miniDetail1 +
					usersData[i].miniDetail2 +
					usersData[i].miniDetail3 +
					usersData[i].miniDetail4 +
					usersData[i].miniDetail5 +
					usersData[i].miniDetail6 +
					usersData[i].miniDetail7 +
					usersData[i].miniDetail8 +
					usersData[i].miniDetail9
				} / ${maxCountMiniDetails}\n• registration: ${
					usersData[i].dateOfRegistration
				}${usersData[i].inBlackList ? `</s>` : ``}\n\n`;
			}

			bot.editMessageText(
				`<b><i>💾 Реестр  •  <a href="https://console.firebase.google.com/u/0/project/digschraspisanie/database/digschraspisanie-default-rtdb/data">База данных</a> 📁\n\nДанные о пользователях:\n\n${text}</i></b>Всего: <b>${usersData.length}</b>`,
				{
					parse_mode: "HTML",
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: "⬅️Назад", callback_data: "adminMenu" },
								{ text: "Обновить🔄️", callback_data: "usersdatalist" },
							],
						],
					},
				}
			);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function usersBlacklist(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.userAction = "usersBlacklist";
		let blacklistText = "";
		const blacklist = usersData.filter((obj) => obj.inBlackList == true);
		if (blacklist.length > 0) {
			blacklist.forEach((obj) => {
				blacklistText += `<b><a href="https://t.me/${BotName}/?start=deletefromblacklistuser${
					obj.chatId
				}">❌</a>  ${
					obj.username != null ? `@${obj.username}` : `${obj.login}`
				} - <i>${obj.chatId}</i></b>\n\n`;
			});
		} else if (blacklist.length == 0) {
			blacklistText = "</b>Черный список <b>пуст 🏝️\n\n";
		}

		bot.editMessageText(
			`<b><i>🤬 Черный список 📋</i>\n\n${blacklistText}${
				blacklist.length != 0
					? `Всего: ${blacklist.length} ${
							blacklist.length == 1
								? `неудачник`
								: `${
										blacklist.length >= 2 && blacklist.length <= 4
											? `неудачника`
											: `${
													blacklist.length >= 5 &&
													blacklist.length <= 20
														? `неудачников`
														: ``
											  }`
								  }`
					  }`
					: ""
			}</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "⬅️Назад", callback_data: "adminMenu" },
							{ text: "Добавить✅", callback_data: "addinblacklist" },
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function addInBlacklist(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		dataAboutUser.userAction = "addInBlacklist";

		bot.editMessageText(
			`<b><i>🤬 Добавление в список 📋</i></b>\n\nНужен <b>только Id</b> пользователя! 🙏`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[{ text: "⬅️Назад", callback_data: "usersblacklist" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function addInBlacklist_2(chatId, chatIdForBlacklist) {
	const dataAboutUser = usersData.find(
		(obj) => obj.chatId == chatIdForBlacklist
	);

	try {
		let countCalls = 0;
		if (dataAboutUser.callOnLesson) countCalls++;
		if (dataAboutUser.callOnBreak) countCalls++;
		if (dataAboutUser.callOnLessonIn5minutes) countCalls++;
		if (dataAboutUser.callOnLessonIn10minutes) countCalls++;
		if (dataAboutUser.callOnBreakIn5minutes) countCalls++;
		if (dataAboutUser.callOnBreakIn10minutes) countCalls++;

		bot.editMessageText(
			`<b><i>🤬 Добавление в список 📋\n\nДанные о пользователе:\n\n@${
				dataAboutUser.username
			}\n• login: ${dataAboutUser.login}\n• chatId: <code>${
				dataAboutUser.chatId
			}</code>\n• userStatus: ${dataAboutUser.userStatus}\n• className: "${
				dataAboutUser.className
			}"\n• gamesPlayed: ${
				dataAboutUser.game1BadResults +
				dataAboutUser.game1NiceResults +
				dataAboutUser.game2BadResults +
				dataAboutUser.game2NiceResults +
				dataAboutUser.game2DrawResults +
				dataAboutUser.game3BadResults +
				dataAboutUser.game3NiceResults +
				dataAboutUser.game3DrawResults
			}\n• totalActions: ${
				dataAboutUser.countOfActions
			} \n• callsReminders: ${countCalls}\n• detailsFound: ${
				dataAboutUser.miniDetail666 +
				dataAboutUser.miniDetail0 +
				dataAboutUser.miniDetail1 +
				dataAboutUser.miniDetail2 +
				dataAboutUser.miniDetail3 +
				dataAboutUser.miniDetail4 +
				dataAboutUser.miniDetail5 +
				dataAboutUser.miniDetail6 +
				dataAboutUser.miniDetail7 +
				dataAboutUser.miniDetail8 +
				dataAboutUser.miniDetail9
			} / ${maxCountMiniDetails}\n• registration: ${
				dataAboutUser.dateOfRegistration
			}\n\n</i></b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "⬅️Назад", callback_data: "usersblacklist" },
							{ text: "Кинуть ❌", callback_data: "addinblacklistend" },
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function addInBlacklistEnd(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		bot.editMessageText(
			`<b><i>🤬 Черный список 📋</i></b>\n\nПользователь <b>успешно</b> стал неудачником! 😉✅`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "⬅️Назад", callback_data: "exit" },
							{ text: "Список 📋", callback_data: "usersblacklist" },
						],
					],
				},
			}
		);
		usersData[
			usersData.findIndex((obj) => obj.chatId == chatIdForBlacklist)
		].inBlackList = true;
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function Reminders(chatId) {
	const countRem = remindersData.filter((obj) => obj.chatId == chatId).length;

	try {
		bot.editMessageText(
			"*_🔔 Напоминания 🗓️_\n\nЯ могу тебе напомнить\\:\n• Когда сдать докла\\.\\.\\.\n• Да всё что угодно\\!🤯\n\\- и я не забуду, то что ты мне поручишь напомнить\\!😉\n\nНе засоряй телефон, пиши мне🤗*",
			{
				parse_mode: "MarkdownV2",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: `Текущие ${countRem} 📃`,
								callback_data: "reminderslist",
							},
							{ text: "Создать📝", callback_data: "remindersadd" },
						],
						[{ text: "⬅️В меню", callback_data: "exit" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function RemindersList(chatId) {
	try {
		let reminderText = "";
		const userReminders = remindersData.filter((obj) => obj.chatId == chatId);
		if (userReminders.length > 0) {
			let i = 1;
			userReminders.forEach((obj) => {
				reminderText += `<b><a href="https://t.me/${BotName}/?start=deleterem${i}">❌</a>${
					userReminders[i - 1].isDone
						? ""
						: `<a href="https://t.me/${BotName}/?start=crossoutrem${i}">✅</a>`
				}  ${i}.</b> ${
					userReminders[i - 1].isDone
						? `<s>${obj.text} - <b>${obj.time}</b></s>`
						: `${obj.text} - <b>${obj.time}</b>`
				}\n\n`;
				i++;
			});
		} else if (userReminders.length == 0) {
			reminderText = "У тебя <b>нет</b> активных напоминаний 😉\n\n";
		}

		bot.editMessageText(
			`<b><i>🔔 Текущие напоминания 🗓️</i>\n\nТвои напоминания:</b><i>\n\n${reminderText}</i><b>${
				userReminders.length != 0 ? `Всего: ${userReminders.length}` : ""
			}</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: `${
									userReminders.length > 1 ? "Удалить все ❌" : ""
								}`,
								callback_data: "deleteallreminder",
							},
						],
						[
							{ text: "⬅️Назад", callback_data: "reminders" },
							{ text: "Создать📝", callback_data: "remindersadd" },
						],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function remindersAdd(chatId) {
	let hours = new Date().getHours(),
		minutes = new Date().getMinutes();

	minutes++;
	if (minutes >= 60) {
		hours += 1;
		minutes -= 60;
	}
	if (hours >= 24) hours -= 24;

	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	try {
		dataAboutUser.userAction = "remindersAdd";
		bot.editMessageText(
			`<b><i>🔔 Создание напоминания 📝\n\nПример:</i></b>\n<code>Сесть за уроки в <b>${String(
				hours
			).padStart(2, "0")}:${String(minutes).padStart(
				2,
				"0"
			)}</b></code>\n\n<i>Используй <b>"В"</b>❗</i>\n\n<b>Пиши прямо под сообщением 😉✍️</b>`,
			{
				parse_mode: "html",
				chat_id: chatId,
				message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
				reply_markup: {
					inline_keyboard: [
						[{ text: "⬅️Назад", callback_data: "reminders" }],
					],
				},
			}
		);
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function start(
	chatId,
	firstName,
	quickStart = false,
	afterAbsenceData = false
) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
	let rndNum = Math.floor(Math.random() * stickers.length);

	const dateNowHHNN = new Date().getHours() * 100 + new Date().getMinutes();
	if (dateNowHHNN < 1200 && dateNowHHNN >= 600) textToSayHello = "Доброе утро";
	else if (dateNowHHNN < 1700 && dateNowHHNN >= 1200)
		textToSayHello = "Добрый день";
	else if (dateNowHHNN < 2200 && dateNowHHNN >= 1700)
		textToSayHello = "Добрый вечер";
	else if (dateNowHHNN >= 2200 || dateNowHHNN < 600)
		textToSayHello = "Доброй ночи";

	try {
		if (afterAbsenceData) {
			await bot
				.sendMessage(
					chatId,
					`<b>Ух.. Извини меня вдвойне! 🙏\n\n</b><i>Я старался, но не смог убрать сообщения <b>сверху! ⬆️</b></i><b>\n\nПожалуйста, удали и забудь про них! 😉</b>`,
					{
						parse_mode: "HTML",
						disable_web_page_preview: true,
					}
				)
				.then((message) => {
					dataAboutUser.messageIdForApologies = message.message_id;
				});
		}

		await bot.sendSticker(chatId, stickers[rndNum]).then((message) => {
			dataAboutUser.messageIdSayHi0 = message.message_id;
		});
		await bot
			.sendMessage(
				chatId,
				`*${textToSayHello}, ${firstName}\\! [✌️](https://t.me/${BotName}/?start=minidetail1)*`,
				{
					parse_mode: "MarkdownV2",
					disable_web_page_preview: true,
				}
			)
			.then((message) => {
				dataAboutUser.messageIdSayHi1 = message.message_id;
			});

		await bot
			.sendMessage(
				chatId,
				`<b><a href = "https://t.me/${BotName}/?start=showhi2">Что умеет этот чат-бот?</a></b>`,
				{
					parse_mode: "html",
					disable_web_page_preview: true,
				}
			)
			.then((message) => {
				dataAboutUser.messageIdSayHi2 = message.message_id;
			});

		await bot.sendMessage(chatId, `ㅤ`, {}).then((message) => {
			dataAboutUser.messageId = message.message_id;
		});
		if (quickStart) {
			menuHome(chatId);
		} else if (!quickStart) {
			ChoosingClass(chatId, 2);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function deleteAllMessages(chatId) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		bot.deleteMessage(chatId, dataAboutUser.messageIdSayHi0);
		bot.deleteMessage(chatId, dataAboutUser.messageIdSayHi1);
		bot.deleteMessage(chatId, dataAboutUser.messageIdSayHi2);
		bot.deleteMessage(chatId, dataAboutUser.messageId);
	} catch (error) {
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function miniDetails(chatId, numberOfDetail) {
	const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

	try {
		let foundDetailsDoneText = [
			"Прекрасно!\nЕще одна пасхалка в кармане! 😆",
			"Так держать!\nИ еще одну! 🥳",
			"Нашлась ещё одна! 😀",
			"Ещё плюс одна в копилку! 👍",
		];
		rndNum = Math.floor(Math.random() * foundDetailsDoneText.length);

		let detailIsHonest = false;

		if (numberOfDetail == 666) {
			dataAboutUser.miniDetail666 = 1;
			detailIsHonest = true;
		} else if (numberOfDetail == 0 && dataAboutUser.miniDetail0 != 1) {
			dataAboutUser.miniDetail0 = 1;
			detailIsHonest = true;
		} else if (numberOfDetail == 1 && dataAboutUser.miniDetail1 != 1) {
			dataAboutUser.miniDetail1 = 1;
			detailIsHonest = true;
		} else if (numberOfDetail == 2 && dataAboutUser.miniDetail2 != 1) {
			dataAboutUser.miniDetail2 = 1;
			detailIsHonest = true;
		} else if (numberOfDetail == 3 && dataAboutUser.miniDetail3 != 1) {
			dataAboutUser.miniDetail3 = 1;
			detailIsHonest = true;
		} else if (numberOfDetail == 4 && dataAboutUser.miniDetail4 != 1) {
			dataAboutUser.miniDetail4 = 1;
			detailIsHonest = true;
		} else if (numberOfDetail == 5 && dataAboutUser.miniDetail5 != 1) {
			dataAboutUser.miniDetail5 = 1;
			detailIsHonest = true;
		} else if (numberOfDetail == 6 && dataAboutUser.miniDetail6 != 1) {
			dataAboutUser.miniDetail6 = 1;
			detailIsHonest = true;
		} else if (numberOfDetail == 7 && dataAboutUser.miniDetail7 != 1) {
			dataAboutUser.miniDetail7 = 1;
			detailIsHonest = true;
		} else if (numberOfDetail == 8 && dataAboutUser.miniDetail8 != 1) {
			dataAboutUser.miniDetail8 = 1;
			detailIsHonest = true;
		} else if (numberOfDetail == 9 && dataAboutUser.miniDetail9 != 1) {
			dataAboutUser.miniDetail9 = 1;
			detailIsHonest = true;
		} else {
			await bot.editMessageText(
				`${
					dataAboutUser.miniDetail666 +
						dataAboutUser.miniDetail0 +
						dataAboutUser.miniDetail1 +
						dataAboutUser.miniDetail2 +
						dataAboutUser.miniDetail3 +
						dataAboutUser.miniDetail4 +
						dataAboutUser.miniDetail5 +
						dataAboutUser.miniDetail6 +
						dataAboutUser.miniDetail7 +
						dataAboutUser.miniDetail8 +
						dataAboutUser.miniDetail9 ==
					maxCountMiniDetails
						? `<b>Да ладно тебе!😆\n\nНа твоем счету и так ${maxCountMiniDetails} / ${maxCountMiniDetails}!\n\nТолько не рассказывай никому о тайниках!🙏</b>`
						: `<b>Твои следы - тебя выдают..\n\nПо второму кругу нечестно! 😠</b>
			\nПока что <b>${
				dataAboutUser.miniDetail666 +
				dataAboutUser.miniDetail0 +
				dataAboutUser.miniDetail1 +
				dataAboutUser.miniDetail2 +
				dataAboutUser.miniDetail3 +
				dataAboutUser.miniDetail4 +
				dataAboutUser.miniDetail5 +
				dataAboutUser.miniDetail6 +
				dataAboutUser.miniDetail7 +
				dataAboutUser.miniDetail8 +
				dataAboutUser.miniDetail9
			} из ${maxCountMiniDetails}!</b>`
				}`,
				{
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					parse_mode: "html",
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "⬅️В меню",
									callback_data: "exit",
								},
							],
						],
					},
				}
			);
		}
		if (detailIsHonest) {
			await bot.editMessageText(
				`${
					dataAboutUser.miniDetail666 +
						dataAboutUser.miniDetail0 +
						dataAboutUser.miniDetail1 +
						dataAboutUser.miniDetail2 +
						dataAboutUser.miniDetail3 +
						dataAboutUser.miniDetail4 +
						dataAboutUser.miniDetail5 +
						dataAboutUser.miniDetail6 +
						dataAboutUser.miniDetail7 +
						dataAboutUser.miniDetail8 +
						dataAboutUser.miniDetail9 <=
					1
						? `<b>Стоп что⁉️\nЭто похоже <i>спрятанная</i> пасхалка!\n\nГоворят, они разбросаны по <i>всему</i> интерфейсу бота! 🤔\n\nCобрано ${
								dataAboutUser.miniDetail666 +
								dataAboutUser.miniDetail0 +
								dataAboutUser.miniDetail1 +
								dataAboutUser.miniDetail2 +
								dataAboutUser.miniDetail3 +
								dataAboutUser.miniDetail4 +
								dataAboutUser.miniDetail5 +
								dataAboutUser.miniDetail6 +
								dataAboutUser.miniDetail7 +
								dataAboutUser.miniDetail8 +
								dataAboutUser.miniDetail9
						  } из ${maxCountMiniDetails}!</b>`
						: `${
								dataAboutUser.miniDetail666 +
									dataAboutUser.miniDetail0 +
									dataAboutUser.miniDetail1 +
									dataAboutUser.miniDetail2 +
									dataAboutUser.miniDetail3 +
									dataAboutUser.miniDetail4 +
									dataAboutUser.miniDetail5 +
									dataAboutUser.miniDetail6 +
									dataAboutUser.miniDetail7 +
									dataAboutUser.miniDetail8 +
									dataAboutUser.miniDetail9 ==
								maxCountMiniDetails
									? `<b>Постой! Это разве ты собрал..\n\nВСЕ</b> пасхалки, которые я <b>так долго</b> прятал⁉️🤯\n\nНа твоем счету <b>${maxCountMiniDetails} / ${maxCountMiniDetails}! ✅</b>`
									: `<b>${
											foundDetailsDoneText[rndNum]
									  }</b>\n\nCобрано <b>${
											dataAboutUser.miniDetail666 +
											dataAboutUser.miniDetail0 +
											dataAboutUser.miniDetail1 +
											dataAboutUser.miniDetail2 +
											dataAboutUser.miniDetail3 +
											dataAboutUser.miniDetail4 +
											dataAboutUser.miniDetail5 +
											dataAboutUser.miniDetail6 +
											dataAboutUser.miniDetail7 +
											dataAboutUser.miniDetail8 +
											dataAboutUser.miniDetail9
									  } из ${maxCountMiniDetails}!</b>`
						  }`
				}`,
				{
					chat_id: chatId,
					message_id: usersData.find((obj) => obj.chatId == chatId)
						.messageId,
					parse_mode: "html",
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "⬅️В меню",
									callback_data: "exit",
								},
								{
									text: "Что и как❓",
									callback_data: "detailsrules",
								},
							],
						],
					},
				}
			);
		}
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

async function detailsRules(chatId) {
	bot.editMessageText(
		`*Суть заключается в нахождении \\- запрятанных в ||смайлики|| пасхалочек\\! 🥚\n\n_Вот одна из них:_*\nНажми на *улыбающийся* стикер \\- [😆](https://t.me/${BotName}/?start=minidetail666)`,
		{
			parse_mode: "MarkdownV2",
			chat_id: chatId,
			message_id: usersData.find((obj) => obj.chatId == chatId).messageId,
			disable_web_page_preview: true,
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: "⬅️Назад",
							callback_data: "miniDetails",
						},
					],
				],
			},
		}
	);
}

async function StartAll() {
	try {
		if (TOKEN == config.TOKENs[0]) {
			BotName = "digtestingbot";
			// База данных ПРОТОТИП
		} else if (TOKEN == config.TOKENs[1]) {
			BotName = "digschbot";

			updateSheetsData();
		}

		cron.schedule(`*/1 * * * *`, function () {
			buttonUpdateActive = true;
		});

		cron.schedule(`1 * * * * *`, function () {
			let textToCallReminder = "";

			const dateNowHHNN =
				new Date().getHours() * 100 + new Date().getMinutes();
			try {
				if (dateNowHHNN < 1200 && dateNowHHNN >= 600)
					textToSayHello = "Доброе утро";
				else if (dateNowHHNN < 1700 && dateNowHHNN >= 1200)
					textToSayHello = "Добрый день";
				else if (dateNowHHNN < 2200 && dateNowHHNN >= 1700)
					textToSayHello = "Добрый вечер";
				else if (dateNowHHNN >= 2200 || dateNowHHNN < 600)
					textToSayHello = "Доброй ночи";

				for (let i = 0; i < usersData.length; i++) {
					if (
						usersData[i].messageIdSayHi1 &&
						usersData[i].messageIdSayHi1 != ""
					) {
						bot.editMessageText(
							`*${textToSayHello}, ${usersData[i].login}\\! [✌️](https://t.me/${BotName}/?start=minidetail1)*`,
							{
								parse_mode: "MarkdownV2",
								chat_id: usersData[i].chatId,
								message_id: usersData[i].messageIdSayHi1,
								disable_web_page_preview: true,
							}
						);
					}
				}

				const timeSimple = `${String(new Date().getHours()).padStart(
					2,
					"0"
				)}:${String(new Date().getMinutes()).padStart(2, "0")}`;
				const time5Minutes = `${String(new Date().getHours()).padStart(
					2,
					"0"
				)}:${String(new Date().getMinutes() + 5).padStart(2, "0")}`;
				const time10Minutes = `${String(new Date().getHours()).padStart(
					2,
					"0"
				)}:${String(new Date().getMinutes() + 10).padStart(2, "0")}`;

				const dateNowHNNText = `${String(new Date().getHours())}:${String(
					new Date().getMinutes()
				).padStart(2, "0")}`;
				const dateNowHHNNText = `${String(new Date().getHours()).padStart(
					2,
					"0"
				)}:${String(new Date().getMinutes()).padStart(2, "0")}`;

				//! CALLS NOTIFICATION

				const dayW = new Date().getDay();

				for (let j = 0; j < usersData.length; j++) {
					const classArr =
						usersData[j].className == "10Г"
							? class10g
							: usersData[j].className == "10Б"
							? class10b
							: usersData[j].className == "10А"
							? class10a
							: usersData[j].className == "11Д"
							? class11d
							: usersData[j].className == "11Г"
							? class11g
							: usersData[j].className == "11В"
							? class11v
							: usersData[j].className == "11А"
							? class11a
							: [];
					if (
						(usersData[j].callOnLessonIn5minutes ||
							usersData[j].callOnLessonIn10minutes ||
							usersData[j].callOnBreakIn5minutes ||
							usersData[j].callOnBreakIn10minutes) &&
						classArr[dayW]
					) {
						for (let i = 0; i < timesOnLesson.length; i++) {
							if (
								((timeSimple == timesOnLesson[i] &&
									usersData[j].callOnLesson) ||
									(timeSimple == timesOnBreak[i] &&
										usersData[j].callOnBreak) ||
									(time5Minutes == timesOnLesson[i] &&
										usersData[j].callOnLessonIn5minutes) ||
									(time5Minutes == timesOnBreak[i] &&
										usersData[j].callOnBreakIn5minutes) ||
									(time10Minutes == timesOnLesson[i] &&
										usersData[j].callOnLessonIn10minutes) ||
									(time10Minutes == timesOnBreak[i] &&
										usersData[j].callOnBreakIn10minutes)) &&
								classArr[day][i] &&
								classArr[day][i] != ""
							) {
								textToCallReminder = "";

								if (
									timeSimple == timesOnLesson[i] &&
									usersData[j].callOnLesson
								)
									textToCallReminder =
										"Особое внимание! 👆\nУ тебя начался урок! 😉";
								if (
									timeSimple == timesOnBreak[i] &&
									usersData[j].callOnBreak
								)
									textToCallReminder = `Можно выдохнуть! 😀\nУ тебя началась ${
										timeSimple == "11:05" || timeSimple == "10:05"
											? "БОЛЬШАЯ"
											: "маленькая"
									} перемена! 😉\n\n${
										timeSimple == "11:05"
											? "<i>Время завтрака! 😋</i>"
											: `${
													timeSimple == "13:55"
														? "<i>На этой перемене - Обед! 😀</i>"
														: ""
											  }`
									}`;
								if (
									time5Minutes == timesOnLesson[i] &&
									usersData[j].callOnLessonIn5minutes
								)
									textToCallReminder =
										"Готовься к уроку! 🧑‍🏫\nЧерез 5 минут у тебя урок! 😉";
								if (
									time5Minutes == timesOnBreak[i] &&
									usersData[j].callOnBreakIn5minutes
								)
									textToCallReminder = `Совсем скоро отдых! 😎\nРовно через 5 минут ${
										time5Minutes == "11:05" || time5Minutes == "10:05"
											? "БОЛЬШАЯ"
											: "маленькая"
									} перемена! 😉`;
								if (
									time10Minutes == timesOnLesson[i] &&
									usersData[j].callOnLessonIn10minutes
								)
									textToCallReminder =
										"Будь готовым! 📚\nЧерез 10 минут у тебя урок! 😉";
								if (
									time10Minutes == timesOnBreak[i] &&
									usersData[j].callOnBreakIn10minutes
								)
									textToCallReminder = `Скоро отдых! ☺️\nРовно через 10 минут ${
										time10Minutes == "11:05" ||
										time10Minutes == "10:05"
											? "БОЛЬШАЯ"
											: "маленькая"
									} перемена! 😉`;
								if (textToCallReminder != "") {
									bot.sendMessage(
										usersData[j].chatId,
										`<b>🔔 ${textToCallReminder}</b>`,
										{
											parse_mode: "HTML",
											reply_markup: {
												inline_keyboard: [
													[
														{
															text: "Выключить 🔕",
															callback_data:
																"notificationsMenuCallsAndDelete",
														},
														{
															text: "Спасибо 👍",
															callback_data: "deleteexcess",
														},
													],
												],
											},
										}
									);
								}
							}
						}
					}
				}

				//! REMINDERS NOTIFICATION

				if (remindersData.length > 0) {
					for (let i = 0; i < remindersData.length; i++) {
						if (
							(remindersData[i].time == dateNowHNNText ||
								remindersData[i].time == dateNowHHNNText) &&
							!remindersData[i].isDone
						) {
							bot.sendMessage(
								remindersData[i].chatId,
								`<b><a href="https://t.me/${BotName}/?start=minidetail9">🔔</a> Напоминание ❗\n<i>${remindersData[i].text}</i> на ${remindersData[i].time}</b>`,
								{
									parse_mode: "html",
									disable_web_page_preview: true,
									reply_markup: {
										inline_keyboard: [
											[
												{
													text: "Удалить ❌",
													callback_data: `deletereminder${remindersData[i].reminderId}`,
												},
												{
													text: "Перенести 🔄️",
													callback_data: `updatetimeforreminder${remindersData[i].reminderId}`,
												},
											],
										],
									},
								}
							);
						}
					}
				}
			} catch (error) {
				console.log(error);
				sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
			}
		});

		// иницилизация массива
		if (!diningRoomData.find((obj) => obj.botName == BotName)) {
			diningRoomData = [
				{
					botName: BotName,
					weekdayMenu: 1,
					countOfLikesOnFood: 0,
					countOfNeutralOnFood: 0,
					countOfDislikesOnFood: 0,
				},
				{
					botName: BotName,
					weekdayMenu: 2,
					countOfLikesOnFood: 0,
					countOfNeutralOnFood: 0,
					countOfDislikesOnFood: 0,
				},
				{
					botName: BotName,
					weekdayMenu: 3,
					countOfLikesOnFood: 0,
					countOfNeutralOnFood: 0,
					countOfDislikesOnFood: 0,
				},
				{
					botName: BotName,
					weekdayMenu: 4,
					countOfLikesOnFood: 0,
					countOfNeutralOnFood: 0,
					countOfDislikesOnFood: 0,
				},
				{
					botName: BotName,
					weekdayMenu: 5,
					countOfLikesOnFood: 0,
					countOfNeutralOnFood: 0,
					countOfDislikesOnFood: 0,
				},
			];
		}

		bot.onText(/(.+)/, async (message, match) => {
			const chatId = message.chat.id;
			const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
			try {
				const chatId = message.chat.id;
				if (
					chatId == qu1z3xId &&
					dataAboutUser &&
					dataAboutUser.userAction == "adminMenuSendMessage"
				) {
					textMessageForAllUsers = match[1];
					adminMenuSendMessageSettings(chatId);
				} else if (
					dataAboutUser.userAction == "editFistName" &&
					dataAboutUser &&
					match[1] != "/start editfistname" &&
					match[1] != message.from.first_name
				) {
					dataAboutUser.login = match[1];
					editFistName(chatId, dataAboutUser.telegramFirstName, true);
				} else if (
					dataAboutUser.userAction == "addInBlacklist" &&
					dataAboutUser &&
					match[1] != qu1z3xId
				) {
					if (usersData.find((obj) => obj.chatId == match[1])) {
						chatIdForBlacklist = match[1];
						addInBlacklist_2(chatId, chatIdForBlacklist);
					}
				}
			} catch (error) {
				console.log(error);
				sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
			}
		});

		const timeFormat = /^\d{1,2}:\d{2}$/;

		bot.onText(/^(.+?) в (.+)/, async (message, match) => {
			const chatId = message.chat.id;
			const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);
			if (dataAboutUser && dataAboutUser.userAction == "remindersAdd") {
				let formatIsNice = true,
					hours,
					minutes;

				try {
					[hours, minutes] = match[2].split(":").map(Number);
					formatIsNice = true;
				} catch (error) {
					console.log(error);
					sendDataAboutError(
						chatId,
						dataAboutUser.login,
						`${String(error)}`
					);
					formatIsNice = false;
				}

				try {
					if (
						!timeFormat.test(match[2]) ||
						hours > 23 ||
						minutes > 59 ||
						!formatIsNice
					) {
						await bot.editMessageText(
							`<b>❗ Не верный формат времени 🚫\n\n<i>Пример:</i></b>\n<code>Выкинуть мусор в </code><b>H:MM\n\nПерепиши напоминание ниже 😉✍️</b>`,
							{
								parse_mode: "html",
								chat_id: chatId,
								message_id: usersData.find(
									(obj) => obj.chatId == chatId
								).messageId,
								reply_markup: {
									inline_keyboard: [
										[
											{
												text: "⬅️Назад",
												callback_data: "reminders",
											},
										],
									],
								},
							}
						);
					} else {
						let rndId = 1; // присвоение уникального id
						do {
							rndId = Math.floor(Math.random() * 1000);
						} while (
							remindersData.some(
								(remindersData) => remindersData.reminderId == rndId
							) &&
							remindersData.length != 0
						);
						remindersData.push({
							chatId: chatId,
							text: match[1],
							time: match[2],
							isDone: false,
							reminderId: rndId, // присвоение уникального id
						});

						await bot.editMessageText(
							`<b>Поставил напоминание</b> 😉🔔\n\n<i>"${
								match[1]
							}" - <b>${
								hours < new Date().getHours() ||
								(hours <= new Date().getHours() &&
									minutes <= new Date().getMinutes())
									? "завтра в "
									: ""
							}${match[2]}\n\n❗ПРОВЕРЬ УВЕДОМЛЕНИЯ❗</b></i>`,
							{
								parse_mode: "html",
								chat_id: message.chat.id,
								message_id: usersData.find(
									(obj) => obj.chatId == chatId
								).messageId,
								reply_markup: {
									inline_keyboard: [
										[
											{
												text: `Текущие ${
													remindersData.filter(
														(obj) => obj.chatId == chatId
													).length
												} 📃`,
												callback_data: "reminderslist",
											},
											{
												text: "Создать еще ➕",
												callback_data: "remindersadd",
											},
										],
										[
											{
												text: "⬅️Назад",
												callback_data: "reminders",
											},
										],
									],
								},
							}
						);
					}
				} catch (error) {
					console.log(error);
					sendDataAboutError(
						chatId,
						dataAboutUser.login,
						`${String(error)}`
					);
				}
			}
		});

		bot.on("text", async (message) => {
			const chatId = message.chat.id;
			const text = message.text;

			if (!usersData.find((obj) => obj.chatId == chatId)) {
				usersData.push({
					chatId: chatId,
					inBlackList: false,
					username: message.from.username,
					login: message.from.first_name,
					telegramFirstName: message.from.first_name,
					userStatus:
						chatId == qu1z3xId ? "Администратор 👑" : "Ученик 🧑‍🏫",
					userAction: 0,
					countOfActions: 1,
					lastActivity: Date.now(),
					dateOfRegistration: `${new Date()
						.getDate()
						.toString()
						.padStart(2, "0")}.${(new Date().getMonth() + 1)
						.toString()
						.padStart(2, "0")}.${(new Date().getFullYear() % 100)
						.toString()
						.padStart(2, "0")}`,
					schoolName: "",
					className: "Не определен",
					messageId: "",
					messageIdSayHi0: "",
					messageIdSayHi1: "",
					messageIdSayHi2: "",
					weekday: "",
					// calls
					callOnLesson: false,
					callOnLessonIn5minutes: false,
					callOnLessonIn10minutes: false,
					callOnBreak: false,
					callOnBreakIn5minutes: false,
					callOnBreakIn10minutes: false,
					// game1
					game1NiceResults: 0,
					game1BadResults: 0,
					// game2
					game2NiceResults: 0,
					game2BadResults: 0,
					game2DrawResults: 0,
					// game3
					game3NiceResults: 0,
					game3BadResults: 0,
					game3DrawResults: 0,
					game3Difficulty: 3,
					game3PlayerSticker: "",
					playerGame3Board: [
						[" ", " ", " "],
						[" ", " ", " "],
						[" ", " ", " "],
					],
					// mini details
					miniDetail666: 0,
					miniDetail0: 0,
					miniDetail1: 0,
					miniDetail2: 0,
					miniDetail3: 0,
					miniDetail4: 0,
					miniDetail5: 0,
					miniDetail6: 0,
					miniDetail7: 0,
					miniDetail8: 0,
					miniDetail9: 0,
					// reminders for return
					remindersForReturnIsActive: true,
					reminderForReturn1: false,
					reminderForReturn2: false,
					reminderForReturn3: false,
					reminderForReturn4: false,
				});
			}

			const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

			if (dataAboutUser) {
				const dataAboutDining = diningRoomData.find(
					(obj) =>
						obj.botName == BotName &&
						obj.weekdayMenu == dataAboutUser.weekday
				);

				try {
					if (
						!dataAboutUser.inBlackList ||
						text == "/start" ||
						text == "/start afterabsencedata"
					) {
						if (
							dataAboutUser &&
							dataAboutUser.userAction == "allNewsTextEdit"
						) {
							dataAboutUser.userAction = "menuHome";
							newsText[0] = text;
							allNewsTextEdit_2(chatId, text);
						}

						//! reminders крестики

						if (text.includes("/start deleterem")) {
							let remNum = text.match(/^\/start deleterem(\d+)$/);
							remNum = parseInt(remNum[1]) - 1;
							const userReminders = remindersData.filter(
								(obj) => obj.chatId == chatId
							);
							if (userReminders.length != 0) {
								remindersData.splice(
									remindersData.indexOf(
										remindersData.find(
											(obj) =>
												obj.reminderId ==
												userReminders[remNum].reminderId
										)
									),
									1
								);
							}
							RemindersList(chatId);
						}
						if (text.includes("/start crossoutrem")) {
							let remNum = text.match(/^\/start crossoutrem(\d+)$/);
							remNum = parseInt(remNum[1]) - 1;
							const userReminders = remindersData.filter(
								(obj) => obj.chatId == chatId
							);

							if (
								userReminders.length != 0 &&
								remindersData[
									remindersData.indexOf(
										remindersData.find(
											(obj) =>
												obj.reminderId ==
												userReminders[remNum].reminderId
										)
									)
								]
							) {
								remindersData[
									remindersData.indexOf(
										remindersData.find(
											(obj) =>
												obj.reminderId ==
												userReminders[remNum].reminderId
										)
									)
								].isDone = true;
							}
							RemindersList(chatId);
						}

						//! Мини пасхалки

						if (text.includes("/start minidetail")) {
							let miniDetailNum = text.match(
								/^\/start minidetail(\d+)$/
							);
							miniDetailNum = parseInt(miniDetailNum[1]);
							miniDetails(chatId, miniDetailNum);
						}

						if (text.includes("/start raspisanieon")) {
							let dayForRaspisanie = text.match(
								/^\/start raspisanieon(\d+)$/
							);
							dayForRaspisanie = parseInt(dayForRaspisanie[1]);
							RaspisanieText(chatId, dayForRaspisanie);
						}

						if (
							text.includes("/start addtoblacklistuser") &&
							chatId == qu1z3xId
						) {
							let idToAdd = text.match(
								/^\/start addtoblacklistuser(\d+)$/
							);
							chatIdForBlacklist = parseInt(idToAdd[1]);

							addInBlacklist_2(chatId, chatIdForBlacklist);
						}

						if (
							text.includes("/start deletefromblacklistuser") &&
							chatId == qu1z3xId
						) {
							let idToKill = text.match(
								/^\/start deletefromblacklistuser(\d+)$/
							);
							idToKill = parseInt(idToKill[1]);

							usersData[
								usersData.findIndex((obj) => obj.chatId == idToKill)
							].inBlackList = false;

							if (dataAboutUser.userAction == "usersBlacklist") {
								usersBlacklist(chatId);
							} else if (
								dataAboutUser.userAction == "registryUsersData"
							) {
								registryUsersData(chatId, 1);
							}
						}

						if (text.includes("/start callson")) {
							let dayForCalls = text.match(/^\/start callson(\d+)$/);
							dayForCalls = parseInt(dayForCalls[1]);
							Calls(chatId, dayForCalls);
						}

						//? КОМАНДЫ

						switch (text) {
							case "/start afterabsencedata":
								deleteAllMessages(chatId);
								start(chatId, message.from.first_name, false, true);
								break;
							case "/start":
								start(chatId, message.from.first_name);
								break;
							case "S":
							case "s":
								if (
									dataAboutUser &&
									(chatId == qu1z3xId || chatId == jackId)
								) {
									dataAboutUser.userAction = "menuHome";
									deleteAllMessages(chatId);
									start(chatId, message.from.first_name, true);
								}
								break;
							case "/restart":
								await bot
									.sendMessage(chatId, `ㅤ`, {})
									.then((message) => {
										dataAboutUser.messageId = message.message_id;
									});

								menuHome(chatId);
								break;
							case "/start rules":
								rulesBot(chatId);
								break;
							case "/start rules2":
								rulesBot(chatId, false);
								break;
							case "/start settings":
								Settings(chatId);
								break;
							case "/start editfistname":
								editFistName(chatId);
								break;
							case "/start editclass":
								ChoosingClass(chatId, 0);
								break;
							case "/start remindersList":
								RemindersList(chatId);
								break;
							case "/start remindersAdd":
								remindersAdd(chatId);
								break;
							case "/start notificationsmenucalls":
								NotificationsMenuCalls(chatId);
								break;

							case "/start remindersforreturntoggle":
								dataAboutUser.remindersForReturnIsActive =
									!dataAboutUser.remindersForReturnIsActive;
								Settings(chatId);
								break;
							case "/start ratelikeonfood":
								dataAboutDining.countOfLikesOnFood += 1;
								foodMenu(chatId);
								break;
							case "/start rateneutralonfood":
								dataAboutDining.countOfNeutralOnFood += 1;
								foodMenu(chatId);
								break;
							case "/start ratedislikeonfood":
								dataAboutDining.countOfDislikesOnFood += 1;
								foodMenu(chatId);
								break;
							case "/start showhi2":
								bot.editMessageText(
									`*[Скрыть](https://t.me/${BotName}/?start=hidehi2)\n\nЯ чат\\-бот 🤖, поддерживаю _цифровое_ обучение 🏫\\. Я буду твоим верным учебным помощником\\! 😉\n  • Нужно уточнить расписание? 📚\n  • Подсказать когда идти на урок? ⏰\n  • Напомнить о твоих планах? 📝\n  • Навеять аппетит столовым меню? 😋\n  • Сыграть партейку в Цуе\\-Фа? ✌️\n  • Рассказать школьные новости? 📖\nТогда я к твоим услугам\\! Поехали\\! [🚀](https://t.me/${BotName}/?start=minidetail2)*`,
									{
										parse_mode: "MarkdownV2",
										chat_id: dataAboutUser.chatId,
										message_id: dataAboutUser.messageIdSayHi2,
										disable_web_page_preview: true,
									}
								);
								break;
							case "/start hidehi2":
								bot.editMessageText(
									`<b><a href = "https://t.me/${BotName}/?start=showhi2">Что умеет этот чат-бот?</a></b>`,
									{
										parse_mode: "html",
										chat_id: dataAboutUser.chatId,
										message_id: dataAboutUser.messageIdSayHi2,
										disable_web_page_preview: true,
									}
								);
								break;
							case "/start detailsRules":
								detailsRules(chatId);
								break;
							default:
								break;
						}
						dataAboutUser.countOfActions += 1;
						dataAboutUser.lastActivity = Date.now();
						dataAboutUser.reminderForReturn1 = false;
						dataAboutUser.reminderForReturn2 = false;
						dataAboutUser.reminderForReturn3 = false;
						dataAboutUser.reminderForReturn4 = false;
					}
					bot.deleteMessage(chatId, message.message_id);
				} catch (error) {
					console.log(error);
					sendDataAboutError(
						chatId,
						dataAboutUser.login,
						`${String(error)}`
					);
				}
			}
		});

		//? ОБРАБОТЧИК КЛАВИАТУРЫ ПОД СООБЩЕНИЯМИ

		bot.on("callback_query", (query) => {
			const chatId = query.message.chat.id;
			const data = query.data;

			const dataAboutUser = usersData.find((obj) => obj.chatId == chatId);

			try {
				if (
					(dataAboutUser && !dataAboutUser.inBlackList) ||
					data == "rules2"
				) {
					day = new Date().getDate();
					dayW = new Date().getDay();
					month = new Date().getMonth();
					// dataAboutUser.messageId = query.message.message_id;

					// game1
					if (
						data == "0" ||
						data == "1" ||
						data == "2" ||
						data == "3" ||
						data == "4" ||
						data == "5" ||
						data == "6" ||
						data == "7" ||
						data == "8" ||
						data == "9"
					) {
						bot.editMessageText(
							`*_❓ Угадай\\-ка ❓_\n\n${
								data == rndNum
									? `✅ Правильно ${rndNum}\\!🥳`
									: `${
											data == "0" ||
											data == "1" ||
											data == "2" ||
											data == "3" ||
											data == "4" ||
											data == "5" ||
											data == "6" ||
											data == "7" ||
											data == "8" ||
											data == "9"
												? `❌ Не правильно 😔\nОтвет: ${rndNum}\\!`
												: ``
									  }`
							}\n\n[Статистика](https://t.me/${BotName}/?start=settings)\n\nЕщё партейку\\? 🤔*`,
							{
								parse_mode: "MarkdownV2",
								chat_id: chatId,
								message_id: usersData.find(
									(obj) => obj.chatId == chatId
								).messageId,
								disable_web_page_preview: true,
								reply_markup: {
									inline_keyboard: [
										[
											{ text: "⬅️Назад", callback_data: "games" },
											{ text: "Давай👌", callback_data: "game1" },
										],
									],
								},
							}
						);
					}
					if (data == rndNum) dataAboutUser.game1NiceResults += 1;
					else if (
						data == "0" ||
						data == "1" ||
						data == "2" ||
						data == "3" ||
						data == "4" ||
						data == "5" ||
						data == "6" ||
						data == "7" ||
						data == "8" ||
						data == "9"
					)
						dataAboutUser.game1BadResults += 1;

					// game3

					if (
						dataAboutUser &&
						dataAboutUser.userAction == "game3_2" &&
						data != "game3" &&
						data != "games" &&
						data != "game3_2"
					) {
						const [row, col] = data.split("|").map(Number);
						if (dataAboutUser.playerGame3Board[row][col] == " ") {
							dataAboutUser.playerGame3Board[row][col] =
								dataAboutUser.game3PlayerSticker;

							let res = game3Result(chatId);
							if (!res) {
								bot.editMessageText(
									`<b><i>❌ Крестики-Нолики ⭕</i>\n\nТеперь хожу я ${
										dataAboutUser.game3PlayerSticker == "❌"
											? "⭕"
											: "❌"
									}</b>`,
									{
										chat_id: chatId,
										message_id: dataAboutUser.messageId,
										parse_mode: "HTML",
										reply_markup: game3InlineKeyboard(chatId, false),
									}
								);

								if (
									dataAboutUser &&
									dataAboutUser.userAction == "game3_2"
								) {
									let botRow,
										botCol,
										count = 0,
										difficultyMiddleCount = 2;
									if (dataAboutUser.game3Difficulty == 2) {
										difficultyMiddleCount = Math.floor(
											Math.random() * 2
										);
									}
									if (
										dataAboutUser.game3Difficulty == 0 ||
										difficultyMiddleCount == 0
									) {
										do {
											botRow = Math.floor(Math.random() * 3);
											botCol = Math.floor(Math.random() * 3);
											count++;
											if (count == 40) {
												res = "Ничья!";
												break;
											}
										} while (
											dataAboutUser.playerGame3Board[botRow][
												botCol
											] != " "
										);
									}
									if (
										dataAboutUser.game3Difficulty == 1 ||
										difficultyMiddleCount == 1
									) {
										let botMoveMade = false;
										// Проверка горизонтальных линий для блокировки/победы
										for (let i = 0; i < 3; i++) {
											if (
												dataAboutUser.playerGame3Board[i][0] ==
													dataAboutUser.playerGame3Board[i][1] &&
												dataAboutUser.playerGame3Board[i][0] !=
													" " &&
												dataAboutUser.playerGame3Board[i][2] == " "
											) {
												botRow = i;
												botCol = 2;
												botMoveMade = true;
												break;
											} else if (
												dataAboutUser.playerGame3Board[i][1] ==
													dataAboutUser.playerGame3Board[i][2] &&
												dataAboutUser.playerGame3Board[i][1] !=
													" " &&
												dataAboutUser.playerGame3Board[i][0] == " "
											) {
												botRow = i;
												botCol = 0;
												botMoveMade = true;
												break;
											} else if (
												dataAboutUser.playerGame3Board[i][0] ==
													dataAboutUser.playerGame3Board[i][2] &&
												dataAboutUser.playerGame3Board[i][0] !=
													" " &&
												dataAboutUser.playerGame3Board[i][1] == " "
											) {
												botRow = i;
												botCol = 1;
												botMoveMade = true;
												break;
											}
										}
										// Проверка вертикальных линий для блокировки/победы
										for (let i = 0; i < 3; i++) {
											// Проверка победы в вертикальных линиях
											if (
												dataAboutUser.playerGame3Board[0][i] ==
													dataAboutUser.playerGame3Board[1][i] &&
												dataAboutUser.playerGame3Board[0][i] !=
													" " &&
												dataAboutUser.playerGame3Board[2][i] == " "
											) {
												botRow = 2;
												botCol = i;
												botMoveMade = true;
												break;
											} else if (
												dataAboutUser.playerGame3Board[1][i] ==
													dataAboutUser.playerGame3Board[2][i] &&
												dataAboutUser.playerGame3Board[1][i] !=
													" " &&
												dataAboutUser.playerGame3Board[0][i] == " "
											) {
												botRow = 0;
												botCol = i;
												botMoveMade = true;
												break;
											} else if (
												dataAboutUser.playerGame3Board[0][i] ==
													dataAboutUser.playerGame3Board[2][i] &&
												dataAboutUser.playerGame3Board[0][i] !=
													" " &&
												dataAboutUser.playerGame3Board[1][i] == " "
											) {
												botRow = 1;
												botCol = i;
												botMoveMade = true;
												break;
											}
										}
										// Проверка диагоналей для блокировки/победы
										// Проверка победы в диагональной линии (слева направо)
										if (
											dataAboutUser.playerGame3Board[0][0] ==
												dataAboutUser.playerGame3Board[1][1] &&
											dataAboutUser.playerGame3Board[0][0] != " " &&
											dataAboutUser.playerGame3Board[2][2] == " "
										) {
											botRow = 2;
											botCol = 2;
											botMoveMade = true;
										} else if (
											dataAboutUser.playerGame3Board[1][1] ==
												dataAboutUser.playerGame3Board[2][2] &&
											dataAboutUser.playerGame3Board[1][1] != " " &&
											dataAboutUser.playerGame3Board[0][0] == " "
										) {
											botRow = 0;
											botCol = 0;
											botMoveMade = true;
										} else if (
											dataAboutUser.playerGame3Board[0][0] ==
												dataAboutUser.playerGame3Board[2][2] &&
											dataAboutUser.playerGame3Board[0][0] != " " &&
											dataAboutUser.playerGame3Board[1][1] == " "
										) {
											botRow = 1;
											botCol = 1;
											botMoveMade = true;
										}

										// Проверка победы в диагональной линии (справа налево)
										if (
											dataAboutUser.playerGame3Board[0][2] ==
												dataAboutUser.playerGame3Board[1][1] &&
											dataAboutUser.playerGame3Board[0][2] != " " &&
											dataAboutUser.playerGame3Board[2][0] == " "
										) {
											botRow = 2;
											botCol = 0;
											botMoveMade = true;
										} else if (
											dataAboutUser.playerGame3Board[1][1] ==
												dataAboutUser.playerGame3Board[2][0] &&
											dataAboutUser.playerGame3Board[1][1] != " " &&
											dataAboutUser.playerGame3Board[0][2] == " "
										) {
											botRow = 0;
											botCol = 2;
											botMoveMade = true;
										} else if (
											dataAboutUser.playerGame3Board[0][2] ==
												dataAboutUser.playerGame3Board[2][0] &&
											dataAboutUser.playerGame3Board[0][2] != " " &&
											dataAboutUser.playerGame3Board[1][1] == " "
										) {
											botRow = 1;
											botCol = 1;
											botMoveMade = true;
										}
										if (!botMoveMade) {
											do {
												botRow = Math.floor(Math.random() * 3);
												botCol = Math.floor(Math.random() * 3);
												count++;
												if (count == 40) {
													res = "Ничья!";
													break;
												}
											} while (
												dataAboutUser.playerGame3Board[botRow][
													botCol
												] != " "
											);
										}
									}
									if (!res) {
										dataAboutUser.playerGame3Board[botRow][
											botCol
										] = `${
											dataAboutUser.game3PlayerSticker == "❌"
												? "⭕"
												: "❌"
										}`;
										res = game3Result(chatId);

										if (
											res != "Ничья!" &&
											res != "❌" &&
											res != "⭕"
										) {
											setTimeout(() => {
												bot.editMessageText(
													`<b><i>❌ Крестики-Нолики ⭕</i>\n\nТвоя очередь ${dataAboutUser.game3PlayerSticker}</b>`,
													{
														chat_id: chatId,
														message_id: dataAboutUser.messageId,
														parse_mode: "HTML",
														reply_markup:
															game3InlineKeyboard(chatId),
													}
												);
											}, 1000);
										}
									}
								}
							}
							setTimeout(() => {
								if (
									(res == "Ничья!" || res == "❌" || res == "⭕") &&
									dataAboutUser.userAction != 0
								) {
									dataAboutUser.userAction = "menuHome";
									let boardString = "";
									for (
										let i = 0;
										i < dataAboutUser.playerGame3Board.length;
										i++
									) {
										for (
											let j = 0;
											j < dataAboutUser.playerGame3Board[i].length;
											j++
										) {
											const cell =
												dataAboutUser.playerGame3Board[i][j];
											boardString +=
												cell !== " " ? ` ${cell} ` : "⠀⠀⠀";
											if (
												j <
												dataAboutUser.playerGame3Board[i].length - 1
											) {
												boardString += "|";
											}
										}
										if (
											i <
											dataAboutUser.playerGame3Board.length - 1
										) {
											boardString += "\n— — — — — —\n";
										}
									}
									bot.editMessageText(
										`<b><i>❌ Крестики-Нолики ⭕</i>\n\n${
											res != dataAboutUser.game3PlayerSticker
												? `${
														res == "Ничья!"
															? `🤷‍♂️ Ничья! 🤷`
															: `🥈 Поражение! 😔`
												  }`
												: `🥇 Выигрыш! 🥳`
										}\n\nРезультат:\n${boardString}\n\nСложность: ${
											dataAboutUser.game3Difficulty == 0
												? "Легко"
												: `${
														dataAboutUser.game3Difficulty == 2
															? "Средняя"
															: `${
																	dataAboutUser.game3Difficulty ==
																	1
																		? "Тяжело"
																		: "Не выбрано"
															  }`
												  }`
										}\n<a href="https://t.me/${BotName}/?start=settings">Статистика</a>\n\nЕще партейку? 🤔</b>`,
										{
											parse_mode: "html",
											chat_id: chatId,
											message_id: dataAboutUser.messageId,
											disable_web_page_preview: true,
											reply_markup: {
												inline_keyboard: [
													[
														{
															text: "⬅️Назад",
															callback_data: "games",
														},
														{
															text: "Давай👌",
															callback_data: `game3_2`,
														},
													],
												],
											},
										}
									);
									// Статистика

									if (res && res != dataAboutUser.game3PlayerSticker) {
										if (res == "Ничья!")
											dataAboutUser.game3DrawResults += 1;
										else dataAboutUser.game3BadResults += 1;
									} else dataAboutUser.game3NiceResults += 1;
								}
							}, 500);
						}
					}

					if (data.includes("deletereminder")) {
						let remId = data.match(/^deletereminder(\d+)$/);
						remId = parseInt(remId[1]);

						try {
							bot.deleteMessage(chatId, query.message.message_id);

							let index = remindersData.findIndex(
								(obj) => obj.reminderId == remId
							);
							remindersData.splice(index, 1); // удаление напоминания которое уже объявилось
						} catch (error) {
							console.log(error);
							sendDataAboutError(
								chatId,
								dataAboutUser.login,
								`${String(error)}`
							);
						}
					}

					if (data.includes("updatetimeforreminder")) {
						let remId = data.match(/^updatetimeforreminder(\d+)$/);
						remId = parseInt(remId[1]);
						let index = remindersData.findIndex(
							(obj) => obj.reminderId == remId
						);

						bot.editMessageText(
							`<b><i>🔔 Перенос напоминания 🔄️</i>\n\nНапоминание:</b>\n"${remindersData[index].text}"\n\n<b>На какое время перенести? 😉</b>`,
							{
								parse_mode: "html",
								chat_id: chatId,
								message_id: query.message.message_id,
								reply_markup: {
									inline_keyboard: [
										[
											{
												text: "На завтра",
												callback_data: `reschedulereminder${remId}on${0}`,
											},
										],
										[
											{
												text: "1м",
												callback_data: `reschedulereminder${remId}on${1}`,
											},
											{
												text: "3м",
												callback_data: `reschedulereminder${remId}on${3}`,
											},
											{
												text: "5м",
												callback_data: `reschedulereminder${remId}on${5}`,
											},
											{
												text: "10м",
												callback_data: `reschedulereminder${remId}on${10}`,
											},
										],
										[
											{
												text: "15м",
												callback_data: `reschedulereminder${remId}on${15}`,
											},
											{
												text: "30м",
												callback_data: `reschedulereminder${remId}on${30}`,
											},
											{
												text: "1ч",
												callback_data: `reschedulereminder${remId}on${12}`,
											},
											{
												text: "2ч",
												callback_data: `reschedulereminder${remId}on${22}`,
											},
										],
										[
											{
												text: "Удалить ❌",
												callback_data: `deletereminder${remId}`,
											},
										],
									],
								},
							}
						);
					}

					if (data.includes("reschedulereminder")) {
						let remId = data.match(/^reschedulereminder(\d+)on(\d+)$/);
						let countTime = parseInt(remId[2]);
						remId = parseInt(remId[1]);

						let index = remindersData.findIndex(
							(obj) => obj.reminderId == remId
						);

						let [hours, minutes] = remindersData[index].time
							.split(":")
							.map(Number);

						switch (countTime) {
							case 0:
								break;
							case 1:
								minutes += 1;
								if (minutes >= 60) {
									hours += 1;
									minutes -= 60;
								}
								if (hours >= 24) hours -= 24;
								break;
							case 3:
								minutes += 3;
								if (minutes >= 60) {
									hours += 1;
									minutes -= 60;
								}
								if (hours >= 24) hours -= 24;
								break;
							case 5:
								minutes += 5;
								if (minutes >= 60) {
									hours += 1;
									minutes -= 60;
								}
								if (hours >= 24) hours -= 24;
								break;
							case 10:
								minutes += 10;
								if (minutes >= 60) {
									hours += 1;
									minutes -= 60;
								}
								if (hours >= 24) hours -= 24;
								break;
							case 15:
								minutes += 15;
								if (minutes >= 60) {
									hours += 1;
									minutes -= 60;
								}
								if (hours >= 24) hours -= 24;
								break;
							case 30:
								minutes += 30;
								if (minutes >= 60) {
									hours += 1;
									minutes -= 60;
								}
								if (hours >= 24) hours -= 24;
								break;
							case 12:
								hours += 1;
								if (hours >= 24) hours -= 24;

								break;
							case 22:
								hours += 2;
								if (hours >= 24) hours -= 24;
								break;
							default:
								break;
						}

						let newTime = `${String(hours).padStart(2, "0")}:${String(
							minutes
						).padStart(2, "0")}`;
						remindersData[index].time = newTime;

						bot.editMessageText(
							`<i><b>🔄️ Перенёс напоминание 🔔\n\nНовое:</b>\n"${
								remindersData[index].text
							}" - <b>${
								hours == new Date().getHours() &&
								minutes == new Date().getMinutes()
									? "завтра в "
									: ""
							}${remindersData[index].time}</b></i>`,
							{
								parse_mode: "html",
								chat_id: chatId,
								message_id: query.message.message_id,
								reply_markup: {
									inline_keyboard: [
										[
											{
												text: "Спасибо👍",
												callback_data: `deleteexcess`,
											},
										],
									],
								},
							}
						);
					}

					//? КЛАССЫ/РАСПИСАНИЕ
					if (
						data == "10a" ||
						data == "10b" ||
						data == "10g" ||
						data == "11d" ||
						data == "11g" ||
						data == "11a" ||
						data == "11v"
					) {
						switch (data) {
							case "10a":
								dataAboutUser.className = "10А";
								dataAboutUser.schoolName = "27c1";
								break;
							case "10b":
								dataAboutUser.className = "10Б";
								dataAboutUser.schoolName = "27c1";
								break;
							case "10g":
								dataAboutUser.className = "10Г";
								dataAboutUser.schoolName = "27c2";
								break;
							case "11d":
								dataAboutUser.className = "11Д";
								dataAboutUser.schoolName = "27c1";
								break;
							case "11g":
								dataAboutUser.className = "11Г";
								dataAboutUser.schoolName = "27c1";
								break;
							case "11a":
								dataAboutUser.className = "11А";
								dataAboutUser.schoolName = "27c1";
								break;
							case "11v":
								dataAboutUser.className = "11В";
								dataAboutUser.schoolName = "27c1";
								break;
						}
						if (dataAboutUser.userAction == "Calls") Calls(chatId);
						else if (dataAboutUser.userAction == "foodMenu")
							foodMenu(chatId);
						else if (dataAboutUser.userAction == "RaspisanieText")
							RaspisanieText(chatId);
						else menuHome(chatId);
					}

					//? ДЕНЬ НЕДЕЛИ

					switch (data) {
						case "mon":
							dataAboutUser.weekday = 1;
							RaspisanieText(chatId);
							break;
						case "tue":
							dataAboutUser.weekday = 2;
							RaspisanieText(chatId);
							break;
						case "wen":
							dataAboutUser.weekday = 3;
							RaspisanieText(chatId);
							break;
						case "thu":
							dataAboutUser.weekday = 4;
							RaspisanieText(chatId);
							break;
						case "fri":
							dataAboutUser.weekday = 5;
							RaspisanieText(chatId);
							break;
						case "today":
							RaspisanieText(chatId, dayW);
							break;
						case "nextweekday":
							if (dataAboutUser.weekday == 6) dataAboutUser.weekday = 0;
							else if (dataAboutUser.weekday < 6)
								dataAboutUser.weekday += 1;
							RaspisanieText(chatId);
							break;
						case "previousweekday":
							if (dataAboutUser.weekday == 0) dataAboutUser.weekday = 6;
							else if (dataAboutUser.weekday > 0)
								dataAboutUser.weekday -= 1;
							RaspisanieText(chatId);
							break;
						case "allsubjects":
							allSubjectsCount(chatId);
							break;

						//? ДЕЙСТВИЯ КНОПОК

						// НАЧАЛЬНЫЕ
						case "start":
							deleteAllMessages(chatId);
							start(chatId, dataAboutUser.login);
							break;
						case "exit":
							if (
								dataAboutUser &&
								dataAboutUser.userAction == "registryUsersData"
							) {
								registryUsersData(chatId, 1);
							} else {
								dataAboutUser.weekday = dayW;
								dataAboutUser.userAction = "menuHome";
								try {
									menuHome(chatId);
								} catch (error) {
									menuHome(chatId, false);
								}
							}

							break;
						case "rules1":
							rulesBot(chatId);
							break;
						case "rules2":
							rulesBot(chatId, false);
							break;
						case "miniDetails":
							miniDetails(chatId, 666);
							break;
						case "detailsrules":
							detailsRules(chatId);
							break;
						case "chooseclass1":
							ChoosingClass(chatId, 1);
							break;
						case "chooseclass2":
							ChoosingClass(chatId, 2);
							break;

						// RASPISANIE

						case "raspisanie":
							if (TOKEN == config.TOKENs[0]) {
							}
							Raspisanie(chatId);
							break;
						case "netclassa":
							netClassaText(chatId);
							break;
						case "netclassa1":
							netClassaText(chatId, false);
							break;

						// CALLS

						case "calls":
							Calls(chatId);
							break;
						case "todaycalls":
							dataAboutUser.weekday = dayW;
							Calls(chatId);
							break;
						case "nextweekdaycalls":
							if (dataAboutUser.weekday == 6) dataAboutUser.weekday = 0;
							else if (dataAboutUser.weekday < 6)
								dataAboutUser.weekday += 1;
							Calls(chatId);
							break;
						case "previousweekdaycalls":
							if (dataAboutUser.weekday == 0) dataAboutUser.weekday = 6;
							else if (dataAboutUser.weekday > 0)
								dataAboutUser.weekday -= 1;
							Calls(chatId);
							break;
						case "callsnotificationsmenu":
							NotificationsMenuCalls(chatId);
							break;
						case "notificationsMenuCallsAndDelete":
							try {
								bot.deleteMessage(chatId, query.message.message_id);
								NotificationsMenuCalls(chatId);
							} catch (error) {
								console.log(error);
								sendDataAboutError(
									chatId,
									dataAboutUser.login,
									`${String(error)}`
								);
							}
							break;
						case "toggleСallOnLesson":
							NotificationsMenuCalls(
								chatId,
								!dataAboutUser.callOnLesson,
								dataAboutUser.callOnBreak,
								dataAboutUser.callOnLessonIn5minutes,
								dataAboutUser.callOnBreakIn5minutes,
								dataAboutUser.callOnLessonIn10minutes,
								dataAboutUser.callOnBreakIn10minutes
							);
							break;
						case "toggleСallOnBreak":
							NotificationsMenuCalls(
								chatId,
								dataAboutUser.callOnLesson,
								!dataAboutUser.callOnBreak,
								dataAboutUser.callOnLessonIn5minutes,
								dataAboutUser.callOnBreakIn5minutes,
								dataAboutUser.callOnLessonIn10minutes,
								dataAboutUser.callOnBreakIn10minutes
							);
							break;
						case "toggleСallOnLessonIn5minutes":
							NotificationsMenuCalls(
								chatId,
								dataAboutUser.callOnLesson,
								dataAboutUser.callOnBreak,
								!dataAboutUser.callOnLessonIn5minutes,
								dataAboutUser.callOnBreakIn5minutes,
								dataAboutUser.callOnLessonIn10minutes,
								dataAboutUser.callOnBreakIn10minutes
							);

							break;
						case "toggleСallOnBreakIn5minutes":
							NotificationsMenuCalls(
								chatId,
								dataAboutUser.callOnLesson,
								dataAboutUser.callOnBreak,
								dataAboutUser.callOnLessonIn5minutes,
								!dataAboutUser.callOnBreakIn5minutes,
								dataAboutUser.callOnLessonIn10minutes,
								dataAboutUser.callOnBreakIn10minutes
							);

							break;
						case "toggleСallOnLessonIn10minutes":
							NotificationsMenuCalls(
								chatId,
								dataAboutUser.callOnLesson,
								dataAboutUser.callOnBreak,
								dataAboutUser.callOnLessonIn5minutes,
								dataAboutUser.callOnBreakIn5minutes,
								!dataAboutUser.callOnLessonIn10minutes,
								dataAboutUser.callOnBreakIn10minutes
							);

							break;
						case "toggleСallOnBreakIn10minutes":
							NotificationsMenuCalls(
								chatId,
								dataAboutUser.callOnLesson,
								dataAboutUser.callOnBreak,
								dataAboutUser.callOnLessonIn5minutes,
								dataAboutUser.callOnBreakIn5minutes,
								dataAboutUser.callOnLessonIn10minutes,
								!dataAboutUser.callOnBreakIn10minutes
							);
							break;
						case "resetallcalls":
							NotificationsMenuCalls(
								chatId,
								false,
								false,
								false,
								false,
								false,
								false
							);
							break;

						// FOODMENU

						case "foodmenu":
							break;
						case "foodmenutoday":
							foodMenu(chatId, dayW);
							break;
						case "foodmenunextday":
							if (dataAboutUser.weekday == 6) dataAboutUser.weekday = 0;
							else if (dataAboutUser.weekday < 6)
								dataAboutUser.weekday += 1;
							foodMenu(chatId);
							break;
						case "foodmenupreviousday":
							if (dataAboutUser.weekday == 0) dataAboutUser.weekday = 6;
							else if (dataAboutUser.weekday > 0)
								dataAboutUser.weekday -= 1;
							foodMenu(chatId);
							break;

						// GAMES

						case "games":
							Games(chatId);
							break;
						// game1
						case "game1":
							game1(chatId);
							break;
						case "game1_1":
							game1(chatId, false);
							break;
						case "hint":
							try {
								bot.editMessageText(
									`*_❓ Угадай\\-ка ❓_\n\n${
										rndNum <= 5
											? `Число _меньше_ или равно 5\\! [📉](https://t.me/${BotName}/?start=minidetail4)😉`
											: `${
													rndNum >= 5
														? `Число _больше_ или равно 5\\! [📈](https://t.me/${BotName}/?start=minidetail4)😉`
														: ""
											  }`
									}*`,
									{
										parse_mode: "MarkdownV2",
										chat_id: chatId,
										message_id: usersData.find(
											(obj) => obj.chatId == chatId
										).messageId,
										disable_web_page_preview: true,
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: "⬅️Назад",
														callback_data: "game1_1",
													},
													{
														text: "Ответ⁉️",
														callback_data: "game1res",
													},
												],
											],
										},
									}
								);
							} catch (error) {
								console.log(error);
								sendDataAboutError(
									chatId,
									dataAboutUser.login,
									`${String(error)}`
								);
							}
							break;
						case "game1res":
							try {
								bot.editMessageText(
									`*_❓ Угадай\\-ка ❓_\n\nНу так не интересно\\! 😒\nОтвет: ${rndNum}\\!\n\nЕще партейку\\? 🤔*`,
									{
										parse_mode: "MarkdownV2",
										chat_id: chatId,
										message_id: usersData.find(
											(obj) => obj.chatId == chatId
										).messageId,
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: "⬅️Назад",
														callback_data: "games",
													},
													{
														text: "Давай👌",
														callback_data: "game1",
													},
												],
											],
										},
									}
								);
							} catch (error) {
								console.log(error);
								sendDataAboutError(
									chatId,
									dataAboutUser.login,
									`${String(error)}`
								);
							}
							break;

						// game2
						case "game2":
							game2(chatId);
							break;
						case "stoneGame2":
							game2_2(chatId, 1);
							break;
						case "scissorsGame2":
							game2_2(chatId, 2);
							break;
						case "paperGame2":
							game2_2(chatId, 3);
							break;
						// game3
						case "game3":
							game3(chatId);
							break;
						case "game3_2":
							game3_2(chatId);
							break;
						case "XGame3":
							dataAboutUser.game3PlayerSticker = "❌";
							game3(chatId);
							break;
						case "OGame3":
							dataAboutUser.game3PlayerSticker = "⭕";
							game3(chatId);
							break;
						case "Dificulty0Game3":
							dataAboutUser.game3Difficulty = 0;
							game3(chatId);
							break;
						case "Dificulty1Game3":
							dataAboutUser.game3Difficulty = 1;
							game3(chatId);
							break;
						case "Dificulty2Game3":
							dataAboutUser.game3Difficulty = 2;
							game3(chatId);
							break;

						// NEWS

						case "news":
							News(chatId, 1, "Новости 📖");
							break;
						case "botnews":
							News(chatId, 2, "О боте 🤖");
							break;
						case "schoolnews":
							News(chatId, 3, "О школе 🏫");
							break;

						// SETTINGS

						case "settings":
							if (dataAboutUser.userAction == "Calls") Calls(chatId);
							else if (dataAboutUser.userAction == "foodMenu")
								foodMenu(chatId);
							else if (dataAboutUser.userAction == "RaspisanieText")
								RaspisanieText(chatId);
							else {
								dataAboutUser.userAction = "menuHome";
								Settings(chatId);
							}
							break;
						case "settingsother":
							Settings_2(chatId);
							break;
						case "resetfirstname":
							dataAboutUser.login = dataAboutUser.telegramFirstName;
							editFistName(chatId, dataAboutUser.telegramFirstName);
							break;
						case "deleteaccount":
							try {
								bot.editMessageText(
									"*_🛠️ Удаление аккаунта ❌\n\n❗ВНИМАНИЕ❗_\n\nДействительно _УДАЛИТЬ_ аккаунт\\?*",
									{
										parse_mode: "MarkdownV2",
										chat_id: chatId,
										message_id: usersData.find(
											(obj) => obj.chatId == chatId
										).messageId,
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: "⬅️Назад",
														callback_data: "settingsother",
													},
													{
														text: "Удалить ✅",
														callback_data: "deleteaccount2",
													},
												],
											],
										},
									}
								);
							} catch (error) {
								console.log(error);
								sendDataAboutError(
									chatId,
									dataAboutUser.login,
									`${String(error)}`
								);
							}
							break;
						case "deleteaccount2":
							try {
								dataAboutUser.className = "Не определен";
								// calls
								dataAboutUser.callOnLesson = false;
								dataAboutUser.callOnLessonIn5minutes = false;
								dataAboutUser.callOnLessonIn10minutes = false;
								dataAboutUser.callOnBreak = false;
								dataAboutUser.callOnBreakIn5minutes = false;
								dataAboutUser.callOnBreakIn10minutes = false;
								// game1
								dataAboutUser.game1NiceResults = 0;
								dataAboutUser.game1BadResults = 0;
								// game2
								dataAboutUser.game2NiceResults = 0;
								dataAboutUser.game2BadResults = 0;
								dataAboutUser.game2DrawResults = 0;
								// game3
								dataAboutUser.game3NiceResults = 0;
								dataAboutUser.game3BadResults = 0;
								dataAboutUser.game3DrawResults = 0;
								dataAboutUser.game3Difficulty = 3;
								dataAboutUser.game3PlayerSticker = "";
								// mini details
								dataAboutUser.miniDetail666 = 0;
								dataAboutUser.miniDetail0 = 0;
								dataAboutUser.miniDetail1 = 0;
								dataAboutUser.miniDetail2 = 0;
								dataAboutUser.miniDetail3 = 0;
								dataAboutUser.miniDetail4 = 0;
								dataAboutUser.miniDetail5 = 0;
								dataAboutUser.miniDetail6 = 0;
								dataAboutUser.miniDetail7 = 0;
								dataAboutUser.miniDetail8 = 0;
								dataAboutUser.miniDetail9 = 0;
								bot.editMessageText(
									"Твой профиль <b>успешно</b> удален! ✅\n\nПожалуйста, опиши причину - <b>@digfusionsupport</b>\n\nЕсли соскучишься - <b>/restart 😉</b>",
									{
										parse_mode: "html",
										chat_id: chatId,
										message_id: usersData.find(
											(obj) => obj.chatId == chatId
										).messageId,
									}
								);
							} catch (error) {
								console.log(error);
								sendDataAboutError(
									chatId,
									dataAboutUser.login,
									`${String(error)}`
								);
							}
							break;

						case "chooseclass0":
							ChoosingClass(chatId, 0);
							break;

						// ADMINMENU

						case "adminMenu":
							adminMenu(chatId);
							break;
						case "adminMenuSendMessage":
							adminMenuSendMessage(chatId);
							break;
						case "usersblacklist":
							usersBlacklist(chatId);
							break;
						case "addinblacklist":
							addInBlacklist(chatId);
							break;
						case "addinblacklistend":
							addInBlacklistEnd(chatId);
							break;
						case "adminMenuSendMessage":
							adminMenuSendMessage(chatId);
							break;
						case "adminMenuSendMessage2":
							adminMenuSendMessage_2(chatId);
							break;
						case "updateraspisaniesheets":
							buttonUpdateActive = false;
							updateSheetsData();
							adminMenuEdit(chatId);
							break;
						case "adminMenuEdit":
							adminMenuEdit(chatId);
							break;
						case "allnewsEDIT":
							allNewsTextEdit(chatId);
							break;
						case "allnewsadd":
							bot.editMessageText(
								"<b><i>✏️ Редактирование: Новости 📖</i></b>\n\nВы <b>успешно</b> обновили Новости! ✅📖",
								{
									parse_mode: "html",
									chat_id: chatId,
									message_id: usersData.find(
										(obj) => obj.chatId == chatId
									).messageId,
								}
							);
							newsText[1] = newsText[0];
							setTimeout(() => {
								adminMenu(chatId);
							}, 1500);
							break;
						case "allnewstextRESETmenu":
							AllNewsTextReset(chatId);
							break;
						case "allnewstextRESET":
							allNewsTextEdit(chatId);
							break;
						case "allnewstextRESETend":
							try {
								newsText[1] = "Новостей нет 😔";
								bot.editMessageText(
									`*_✏️ Редактирование: Новости 📖_\n\nРаздел _"Новости📖"_ \\- сброшен\\!✅*`,
									{
										parse_mode: "MarkdownV2",
										chat_id: chatId,
										message_id: usersData.find(
											(obj) => obj.chatId == chatId
										).messageId,
									}
								);
								setTimeout(() => {
									adminMenu(chatId);
								}, 1500);
							} catch (error) {
								console.log(error);
								sendDataAboutError(
									chatId,
									dataAboutUser.login,
									`${String(error)}`
								);
							}
							break;
						case "restart1":
							ChoosingClass(chatId, 2);
							break;
						case "agreerules":
							try {
								ChoosingClass(chatId, 1);
							} catch (error) {
								console.log(error);
								sendDataAboutError(
									chatId,
									dataAboutUser.login,
									`${String(error)}`
								);
							}
							break;
						case "usersdatalist":
							registryUsersData(chatId, 1);
							break;
						case "p0":
							numberArr = 0;
							adminMenuSendMessageSettings(chatId);
							break;
						case "p1":
							numberArr = 1;
							adminMenuSendMessageSettings(chatId);
							break;
						case "p2":
							numberArr = 2;
							adminMenuSendMessageSettings(chatId);
							break;
						case "p3":
							numberArr = 3;
							adminMenuSendMessageSettings(chatId);
							break;

						// REMINDERS

						case "reminders":
							if (dataAboutUser) dataAboutUser.userAction = "menuHome";
							Reminders(chatId);
							break;
						case "reminderslist":
							RemindersList(chatId);
							break;
						case "remindersadd":
							remindersAdd(chatId);
							break;
						case "deleteallreminder":
							try {
								bot.editMessageText(
									`*_🔔 Удаление напоминаний ❌\n\n❗ВНИМАНИЕ❗_*\n\nТвой список из *_${
										remindersData.filter(
											(obj) => obj.chatId == chatId
										).length
									} ${
										remindersData.filter(
											(obj) => obj.chatId == chatId
										).length == 1
											? "заметки"
											: "заметок"
									}_* будет *удален*\\!\n\nДействительно *_УДАЛИТЬ_* список?❗`,
									{
										parse_mode: "MarkdownV2",
										chat_id: chatId,
										message_id: usersData.find(
											(obj) => obj.chatId == chatId
										).messageId,
										reply_markup: {
											inline_keyboard: [
												[
													{
														text: "⬅️Назад",
														callback_data: "reminderslist",
													},
													{
														text: "Удалить ✅",
														callback_data: "deleteallreminder2",
													},
												],
											],
										},
									}
								);
							} catch (error) {
								console.log(error);
								sendDataAboutError(
									chatId,
									dataAboutUser.login,
									`${String(error)}`
								);
							}
							break;
						case "deleteallreminder2":
							try {
								remindersData = remindersData.filter(
									(obj) => obj.chatId !== chatId
								);
								if (
									remindersData.filter((obj) => obj.chatId == chatId)
										.length == 0
								) {
									bot.editMessageText(
										"<b><i>🔔 Удаление напоминаний ❌</i>\n\n</b>Все напоминания <b>успешно</b> удалены! 😉✅",
										{
											parse_mode: "html",
											chat_id: chatId,
											message_id: usersData.find(
												(obj) => obj.chatId == chatId
											).messageId,
										}
									);
									setTimeout(() => {
										RemindersList(chatId);
									}, 1500);
								}
							} catch (error) {
								console.log(error);
								sendDataAboutError(
									chatId,
									dataAboutUser.login,
									`${String(error)}`
								);
							}
							break;
						case "deleteexcess":
							try {
								bot.deleteMessage(chatId, query.message.message_id);
							} catch (error) {
								console.log(error);
								sendDataAboutError(
									chatId,
									dataAboutUser.login,
									`${String(error)}`
								);
							}
							break;
						case "remindersforreturnOff":
							try {
								dataAboutUser.remindersForReturnIsActive = false;
								bot.deleteMessage(chatId, query.message.message_id);
							} catch (error) {
								console.log(error);
								sendDataAboutError(
									chatId,
									dataAboutUser.login,
									`${String(error)}`
								);
							}
							break;
						case "moreAboutUs":
							moreAboutUs(chatId);
							break;
						case "":
							break;
						case "":
							break;
						case "":
							break;
						case "":
							break;
						case "":
							break;
						case "":
							break;
						case "":
							break;
						case "":
							break;
						case "":
							break;
						case "":
							break;
						case "":
							break;
						case "":
							break;
					}
					dataAboutUser.countOfActions += 1;
					if (data != "deleteexcess") {
						dataAboutUser.lastActivity = Date.now();
						dataAboutUser.reminderForReturn1 = false;
						dataAboutUser.reminderForReturn2 = false;
						dataAboutUser.reminderForReturn3 = false;
						dataAboutUser.reminderForReturn4 = false;
					}

					//* для удобства в терминале

					if (chatId != qu1z3xId && data != "-") {
						sendDataAboutButton(chatId, query.from.first_name, data);
					}
				} else if (dataAboutUser && dataAboutUser.inBlackList) {
					dataAboutUser.userAction = "inBlackList";

					bot.editMessageText(
						`<b>Похоже у тебя больше нет возможности общаться со мной! ☹️\n\nЧтобы узнать подробнее причину блокировки, обратись в поддержку! 🗯️😉</b>`,
						{
							chat_id: chatId,
							message_id: usersData.find((obj) => obj.chatId == chatId)
								.messageId,
							parse_mode: "html",
							disable_web_page_preview: true,
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: "Написать нам ✍️",
											url: "https://t.me/digfusionsupport",
										},
									],
									[
										{ text: "Обновить 🔄️", callback_data: "exit" },
										{
											text: "Правила 📃",
											callback_data: `rules2`,
										},
									],
								],
							},
						}
					);
				} else if (!dataAboutUser) {
					bot.editMessageText(
						`<b>Мы разве знакомы? 🤨\n</b>Мои системы тебя не помнят...<b> \n\n<i>Обычно такое бывает, когда происходят масштабные обновления! ☹️</i>\n\n</b>Раз уж так произошло, давай начнем все с <b>чистого листа!</b> Жми - <b><a href="https://t.me/${BotName}/?start=afterabsencedata">/start</a></b> 😉`,
						{
							chat_id: chatId,
							message_id: query.message.message_id,
							parse_mode: "html",
							disable_web_page_preview: true,
						}
					);
				}
			} catch (error) {
				sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
				console.log(error);
			}
		});
	} catch (error) {
		console.log(error);
		sendDataAboutError(chatId, dataAboutUser.login, `${String(error)}`);
	}
}

StartAll();

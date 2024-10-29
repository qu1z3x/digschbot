import { config } from "./config.js";

// import { google } from "googleapis";

let class10a, class10b, class10g, class11a, class11v, class11g, class11d;
let foodmenu27c1, foodmenu27c2;

class10a =
	class10b =
	class10g =
	class11a =
	class11v =
	class11g =
	class11d =
		[
			[
				"РоВ",
				"Физика",
				"Физкультура",
				"Алгебра",
				"Английский язык",
				"Информатика",
				"Электив",
				"",
			],
			[
				"Литература",
				"Химия",
				"Геометрия",
				"Геометрия",
				"Английский язык",
				"Информатика",
				"Физкультура",
				"",
			],
			[
				"Алгебра",
				"Алгебра",
				"Физика",
				"География",
				"Русский язык",
				"Индив. проект",
				"Литература",
				"",
			],
			[
				"История",
				"История",
				"Обществознание",
				"Обществознание",
				"Алгебра",
				"Биология",
				"Информатика",
			],
			[
				"Русский язык",
				"Литература",
				"Геометрия",
				"Вероятность",
				"Английский язык",
				"Информатика",
				"ОБЖ",
				"",
			],
			["", "", "", "", "", "", "", ""],
		];

foodmenu27c1 = [
	[
		"Каша гречневая, чай с лимоном",
		"Суп гороховый, плов, салат Оливье, кисель",
	],
	[
		"Овсяная каша, булочка с маслом, какао",
		"Борщ, куриная котлета с пюре, компот из сухофруктов",
	],
	[
		"Творожная запеканка, чай с мятой",
		"Суп с фрикадельками, макароны с сыром, салат свекольный, яблочный сок",
	],
	[
		"Ячневая каша, чай",
		"Рыбный суп, тушеная капуста с мясом, салат из огурцов, морс",
	],
	[
		"Манная каша, какао",
		"Щи, картофельное пюре с котлетой, салат из капусты, ягодный компот",
	],
];

foodmenu27c2 = [
	[
		"Рисовая каша с молоком, чай с лимоном",
		"Суп фасолевый, гречка с мясом, салат Оливье, кисель",
	],
	[
		"Кукурузная каша, булочка с вареньем, чай",
		"Борщ с пампушками, куриная грудка с картошкой, компот",
	],
	[
		"Омлет с овощами, какао",
		"Суп лапша, плов с курицей, салат из свежих овощей, яблочный сок",
	],
	[
		"Пшённая каша, чай с медом",
		"Солянка, тушеная капуста с колбасой, салат морковный, морс",
	],
	[
		"Гречневая каша с молоком, чай",
		"Щи, макароны по-флотски, салат из огурцов, компот",
	],
];

export {
	class10a,
	class10b,
	class10g,
	class11a,
	class11v,
	class11g,
	class11d,
	foodmenu27c1,
	foodmenu27c2,
};

// function NodeGoogleSheets(file, sheetId, keyMass, fun) {
// 	const auth = new google.auth.GoogleAuth({
// 		keyFile: file,
// 		scopes: "https://www.googleapis.com/auth/spreadsheets",
// 	});
// 	try {
// 		//
// 		(async () => {
// 			const client = await auth.getClient();
// 			//
// 			const googleSheets = google.sheets({ version: "v4", auth: client });
// 			//
// 			const spreadsheetId = sheetId;
// 			//
// 			const metaData = await googleSheets.spreadsheets.get({
// 				auth,
// 				spreadsheetId,
// 			});
// 			//
// 			const data = {
// 				auth,
// 				spreadsheetId,
// 				valueInputOption: "USER_ENTERED",
// 				resource: {
// 					values: keyMass.change,
// 				},
// 			};
// 			//
// 			if (keyMass.append) {
// 				data["range"] = keyMass.append;
// 				//
// 				const append = await googleSheets.spreadsheets.values.append(data);
// 				//
// 				fun(append);
// 			} else if (keyMass.values) {
// 				data["range"] = keyMass.values;
// 				//
// 				delete data.valueInputOption;
// 				delete data.resource;
// 				//
// 				const values = await googleSheets.spreadsheets.values.get(data);
// 				//
// 				fun(values);
// 			} else if (keyMass.update) {
// 				data["range"] = keyMass.update;
// 				//
// 				const update = await googleSheets.spreadsheets.values.update(data);
// 				//
// 				fun(update);
// 			}
// 		})();
// 	} catch (error) {
// 		console.log(error);
// 	}
// }

// async function updateSheetsData() {
// 	try {
// 		console.log("sheets updated");

// 		NodeGoogleSheets(
// 			config.sheetsConfig,
// 			config.sheetId,
// 			{ values: "B2:J7" },
// 			(data) => {
// 				class10a = data.data.values;
// 			}
// 		);
// 		NodeGoogleSheets(
// 			config.sheetsConfig,
// 			config.sheetId,
// 			{ values: "B12:J17" },
// 			(data) => {
// 				class10b = data.data.values;
// 			}
// 		);
// 		NodeGoogleSheets(
// 			config.sheetsConfig,
// 			config.sheetId,
// 			{ values: "B22:J27" },
// 			(data) => {
// 				class10g = data.data.values;
// 			}
// 		);
// 		NodeGoogleSheets(
// 			config.sheetsConfig,
// 			config.sheetId,
// 			{ values: "B32:J37" },
// 			(data) => {
// 				class11a = data.data.values;
// 			}
// 		);
// 		NodeGoogleSheets(
// 			config.sheetsConfig,
// 			config.sheetId,
// 			{ values: "B42:J47" },
// 			(data) => {
// 				class11v = data.data.values;
// 			}
// 		);
// 		NodeGoogleSheets(
// 			config.sheetsConfig,
// 			config.sheetId,
// 			{ values: "B52:J57" },
// 			(data) => {
// 				class11g = data.data.values;
// 			}
// 		);
// 		NodeGoogleSheets(
// 			config.sheetsConfig,
// 			config.sheetId,
// 			{ values: "B62:J67" },
// 			(data) => {
// 				class11d = data.data.values;
// 			}
// 		);
// 		NodeGoogleSheets(
// 			config.sheetsConfig,
// 			config.sheetId,
// 			{ values: "B86:C90" },
// 			(data) => {
// 				foodmenu27c1 = data.data.values;
// 			}
// 		);
// 		NodeGoogleSheets(
// 			config.sheetsConfig,
// 			config.sheetId,
// 			{ values: "B93:C97" },
// 			(data) => {
// 				foodmenu27c2 = data.data.values;
// 			}
// 		);
// 	} catch (error) {
// 		console.log(error);
// 	}
// }

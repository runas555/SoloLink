const fs = require('fs');
const path = require('path');

// Пути к файлам
const DB_INDEX_PATH = path.join(process.cwd(), 'src', 'db', 'index.ts');
const VERCEL_JSON_PATH = path.join(process.cwd(), 'vercel.json');

// Функция создания бэкапа (избегаем расширения .bak согласно правилам)
function createBackup(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = filePath + '.original';
    fs.copyFileSync(filePath, backupPath);
  }
}

function patchDbIndex() {
  if (!fs.existsSync(DB_INDEX_PATH)) {
    console.log(`[ОШИБКА] Файл не найден: ${DB_INDEX_PATH}`);
    return;
  }

  let content = fs.readFileSync(DB_INDEX_PATH, 'utf8');

  // Логика исключения: если патч уже применялся, пропускаем
  if (content.includes('globalThis') || content.includes('globalForDb')) {
    console.log(`[ПРОПУЩЕНО] Файл src/db/index.ts уже содержит Singleton-патч.`);
    return;
  }

  // Гибкий якорь для поиска экспорта (игнорирует пробелы, табы, комментарии)
  const anchorRegex = /export\s+const\s+client\s*=\s*createClient\s*\(\s*\{[\s\S]*?\}\s*\)\s*;?/m;
  
  if (!anchorRegex.test(content)) {
    console.log(`[ОШИБКА] Якорь "export const client = createClient..." не найден в src/db/index.ts`);
    return;
  }

  // Новый код с паттерном Singleton
  const replacementText = `const createDbClient = () => {
  return createClient({
    url: process.env.DATABASE_URL || 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
};

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createDbClient> | undefined;
};

export const client = globalForDb.client ?? createDbClient();

if (process.env.NODE_ENV !== 'production') globalForDb.client = client;`;

  // Выполняем автозамену
  content = content.replace(anchorRegex, replacementText);

  // Сохраняем результат
  createBackup(DB_INDEX_PATH);
  fs.writeFileSync(DB_INDEX_PATH, content, 'utf8');
  console.log(`[УСПЕШНО] Внедрен Singleton-патч в src/db/index.ts`);
}

function patchVercelJson() {
  if (fs.existsSync(VERCEL_JSON_PATH)) {
    try {
      let content = fs.readFileSync(VERCEL_JSON_PATH, 'utf8');
      let json = JSON.parse(content);

      // Логика исключения: если регион уже проставлен, пропускаем
      if (json.regions && json.regions.includes('dub1')) {
        console.log(`[ПРОПУЩЕНО] Файл vercel.json уже настроен на регион 'dub1' (Европа/Ирландия).`);
        return;
      }

      json.regions = ["dub1"];
      createBackup(VERCEL_JSON_PATH);
      fs.writeFileSync(VERCEL_JSON_PATH, JSON.stringify(json, null, 2), 'utf8');
      console.log(`[УСПЕШНО] Обновлен vercel.json с привязкой к региону 'dub1'.`);
    } catch (error) {
      console.log(`[ОШИБКА] Не удалось обработать существующий vercel.json (возможно невалидный JSON): ${error.message}`);
    }
  } else {
    // Если файла нет — создаем новый
    const newConfig = {
      regions: ["dub1"]
    };
    fs.writeFileSync(VERCEL_JSON_PATH, JSON.stringify(newConfig, null, 2), 'utf8');
    console.log(`[УСПЕШНО] Создан vercel.json с привязкой к региону 'dub1'.`);
  }
}

// === ЗАПУСК ===
console.log('\n--- Запуск применения патчей ---');
try {
  patchDbIndex();
  patchVercelJson();
} catch (err) {
  console.error(`[КРИТИЧЕСКАЯ ОШИБКА] Непредвиденный сбой скрипта: ${err.message}`);
}
console.log('--- Работа скрипта завершена ---\n');
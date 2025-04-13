const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

async function addAdmin() {
    try {
        const [results] = await sequelize.query(
            `SELECT * FROM Users WHERE username = ?`,
            { replacements: ["admin"] }
        );

        if (results.length > 0) {
            console.log("Користувач із username 'admin' вже існує.");
            return;
        }

        const hashedPassword = await bcrypt.hash("2005", 10); // Задайте надійний пароль
        await sequelize.query(
            `INSERT INTO users (username, email, password, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())`,
            {
                replacements: ["admin", "admin@example.com", hashedPassword, 1],
            }
        );
        console.log("Адміністратор успішно доданий!");
    } catch (error) {
        console.error("Помилка при додаванні адміністратора:", error);
    } finally {
        await sequelize.close();
    }
}

addAdmin();
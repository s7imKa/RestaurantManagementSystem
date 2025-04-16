const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = require("./models/User");

passport.use(
    new LocalStrategy(
        { usernameField: "email" }, // Використовуємо email замість username
        async (email, password, done) => {
            try {
                const user = await User.findOne({ where: { email: email } });

                if (!user) {
                    console.log("Incorrect email."); // Логування
                    return done(null, false, { message: "Incorrect email." });
                }

                const validPassword = await user.validPassword(password);

                if (!validPassword) {
                    console.log("Incorrect password."); // Логування
                    return done(null, false, { message: "Incorrect password." });
                } 

                return done(null, user);
            } catch (err) {
                console.error("Error in LocalStrategy:", err); // Логування
                return done(err);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    console.log("Serializing user:", user.id);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        console.log("Deserializing user with ID:", id);
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        console.error("Error deserializing user:", err);
        done(err);
    }
});

module.exports = passport;

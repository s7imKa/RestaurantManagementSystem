exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Будь ласка, увійдіть у систему.");
    res.redirect("/auth/login"); 
};

const { isAuthenticated } = require("./middleware/isAuthenticated");

app.get("/protected-route", isAuthenticated, (req, res) => {
    res.render("protected-page", { user: req.user });
});

// const User = require('./models/User');
// const Session = require('./models/Session');

// // sequelize.sync()
// //   .then(() => {
// //     console.log('Database & tables created!');
// //   });
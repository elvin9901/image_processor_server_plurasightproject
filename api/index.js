const app = require('./app');

module.exports = app.listen(3000, () => {
    console.log(`App running on port: ${3000}`);
});
const authService = require("../services/authService");

async function login(req, res) {
    try {
        const tokens = await authService.login(req.body);
        res.json(tokens);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = { login };

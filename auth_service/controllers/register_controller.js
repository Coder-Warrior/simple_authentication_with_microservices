const mongoose = require('mongoose');
const User = require('../models/userModel');
const handleErrors = require('../functions/handleErrorsFunction.js');

async function registerController(req, res) {
    const { username, email, password } = req.body;
    try {
        const user = await User.create({ username, email, password });
        req.session.userId = user._id;
        return res.status(200).json({ userId: user._id });
    } catch (e) {
        console.log(e);
        res.status(400).json({ errors: handleErrors(e) });
    }
}

module.exports = registerController;
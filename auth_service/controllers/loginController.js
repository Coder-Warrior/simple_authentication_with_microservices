const User = require('../models/userModel');
const handleErrors = require('../functions/handleErrorsFunction.js');

const loginController = async function (req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        req.session.userId = user._id;
        return res.status(200).json({ userId: user._id });
    } catch (e) {
        return res.status(400).json({ errors: handleErrors(e) });
    }
}

module.exports = loginController;
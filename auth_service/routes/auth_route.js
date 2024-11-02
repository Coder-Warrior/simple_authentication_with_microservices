const express = require('express');
const router = express.Router();
const registerController = require('../controllers/register_controller');
const authController = require('../controllers/authController');
const loginController = require('../controllers/loginController');

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/register', registerController);
router.post('/login', loginController);

router.post('/', authController); 

module.exports = router;
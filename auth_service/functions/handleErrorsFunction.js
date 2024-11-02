module.exports = function handleErrors(e) {

    let errors = { username: '', email: '', password: '' };

    if (e.message === "user isnt found") {
        errors.email = "user isnt found";
    }

    if (e.message === "incorrect password!") {
        errors.password = "incorrect password!";
    }

    if (e.code === 11000) {
        errors.email = 'the user already exsists!';
    }

    if (e.errors) {
        for (let i = 0; i < Object.keys(e.errors).length; i++) {
            errors[Object.keys(e.errors)[i]] = e.errors[Object.keys(e.errors)[i]].properties.message;
        }
    }

    return errors;

}
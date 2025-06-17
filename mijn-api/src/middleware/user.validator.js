function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z]{1}\.[a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

function isValidPhoneNumber(phone) {
  const phoneRegex = /^06\d{8}$/;
  return phoneRegex.test(phone);
}

function validateUserData(req, res, next) {
  try {
    const { emailAdress, password, phoneNumber } = req.body;

    if (!emailAdress || !isValidEmail(emailAdress)) {
      throw new Error('Ongeldig e-mailadres');
    }

    if (password !== undefined && !isValidPassword(password)) {
      throw new Error('Ongeldig wachtwoord. Minimaal 8 tekens, 1 hoofdletter, 1 cijfer.');
    }

    if (phoneNumber !== undefined && !isValidPhoneNumber(phoneNumber)) {
      throw new Error('Ongeldig telefoonnummer. Moet beginnen met 06 en 10 cijfers bevatten.');
    }

    next();
  } catch (err) {
    return next({ status: 400, message: err.message });
  }
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
  validateUserData
};

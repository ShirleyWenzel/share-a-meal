function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateCreateMeal(req, res, next) {
  const { name, description, price, dateTime, maxAmountOfParticipants, imageUrl } = req.body;

  if (!name || typeof name !== 'string') {
    return next({ status: 400, message: 'Ongeldige naam' });
  }
  if (!description || typeof description !== 'string') {
    return next({ status: 400, message: 'Ongeldige beschrijving' });
  }
  if (typeof price !== 'number' || price <= 0) {
    return next({ status: 400, message: 'Prijs moet een positief getal zijn' });
  }
  if (!dateTime || isNaN(Date.parse(dateTime))) {
    return next({ status: 400, message: 'Ongeldige datum/tijd' });
  }
  if (!Number.isInteger(maxAmountOfParticipants) || maxAmountOfParticipants <= 0) {
    return next({ status: 400, message: 'maxAmountOfParticipants moet een positief geheel getal zijn' });
  }
  if (!imageUrl || typeof imageUrl !== 'string' || !isValidUrl(imageUrl)) {
    return next({ status: 400, message: 'Ongeldige imageUrl' });
  }

  next();
}

module.exports = { validateCreateMeal };

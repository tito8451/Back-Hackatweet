function checkBody(body, keys) {
  const missingFields = []; // Tableau pour stocker les champs manquants

  for (const field of keys) {
    if (!body[field] || body[field] === '') {
      // console.log(`Missing field: ${field}`);
      missingFields.push(field); //champ manquant au tableau
    }
  }

  return missingFields.length > 0 ? missingFields : null; // Retourne le tableau ou null
}

module.exports = { checkBody };


// Logique de réponse du bot OrientIUG
export function getBotResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  if (msg.match(/^(bonjour|salut|coucou|hello|hey|yo)/i)) {
    return {
      text: "Bonjour ! Je suis OrientIUG, votre assistant d'orientation. Je peux vous aider à découvrir les filières de l'IUG, les débouchés, et même vous guider pour votre inscription. Que souhaitez-vous savoir ?",
      action: null
    };
  }

  if (msg.includes('inscription') || msg.includes('s\'inscrire') || msg.includes('fiche d\'inscription')) {
    return {
      text: "Pour vous inscrire, remplissez notre fiche d'inscription en ligne. Vous y trouverez tous les champs nécessaires (identité, coordonnées, parcours souhaité). ",
      action: { type: 'inscription', label: 'Accéder à la fiche d\'inscription' }
    };
  }

  if (msg.includes('merci') || msg.includes('super')) {
    return {
      text: "Avec plaisir ! Si vous souhaitez rejoindre l'IUG, n'hésitez pas à remplir notre fiche d'inscription.",
      action: { type: 'inscription', label: 'Accéder à la fiche' }
    };
  }

  if (msg.includes('esg') || msg.includes('débouchés')) {
    return { text: "La filière ESG prépare aux métiers de la gestion, du commerce et du management. Les débouchés incluent responsable RH, chargé de marketing, ou encore contrôleur de gestion.", action: null };
  } else if (msg.includes('ista') || msg.includes('informatique')) {
    return { text: "ISTA forme aux métiers de l'informatique et du numérique. Vous pouvez devenir développeur, administrateur réseau, ou data analyst.", action: null };
  } else if (msg.includes('isa') || msg.includes('agronomie')) {
    return { text: "ISA est spécialisé dans les sciences agronomiques et l'environnement. Les diplômés travaillent dans l'agroalimentaire, la gestion des ressources naturelles, ou la recherche.", action: null };
  } else if (msg.includes('admission') || msg.includes('condition')) {
    return { text: "Les conditions d'admission varient selon les filières. En général, il faut un baccalauréat et passer une étude de dossier. Consultez le site de l'IUG pour plus de détails.", action: null };
  } else if (msg.includes('contact') || msg.includes('téléphone') || msg.includes('email')) {
    return { text: "Vous pouvez contacter l'IUG par téléphone au +237 6XX XX XX XX ou par email à contact@univ-iug.com. Le secrétariat est ouvert du lundi au vendredi.", action: null };
  }

  return {
    text: "Je n'ai pas encore appris à répondre à cette question. Pouvez-vous reformuler ou me poser une question sur les filières (ESG, ISTA, ISA), les débouchés, les conditions d'admission ou l'inscription ?",
    action: null
  };
}

const axios = require("axios");

// Remplacez par vos identifiants Bambu Connect
const email = "tag.costa@bluewin.ch";
const password = "dNnhA&XeEHSi9n6n";

// URL d'authentification Bambu Connect à confirmer auprès de la doc officielle
const authUrl = "https://api.bambulab.com/v1/auth/token";

async function getToken() {
  try {
    const response = await axios.post(authUrl, {
      email: email,
      password: password
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.data && response.data.access_token) {
      console.log("Token d'accès :", response.data.access_token);
      // Vous pouvez sauvegarder ce token dans un fichier config par exemple
    } else {
      console.error("Réponse inattendue :", response.data);
    }
  } catch (error) {
    if (error.response) {
      console.error("Erreur API :", error.response.data);
    } else {
      console.error("Erreur :", error.message);
    }
  }
}

getToken();

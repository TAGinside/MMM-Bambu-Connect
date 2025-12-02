const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-Bambu-Connect helper started...");
    this.token = null;
    this.config = null;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "BAMBU_CONNECT_START") {
      this.config = payload;
      this.authenticate()
        .then(() => {
          this.sendBambuData();
          this.setupInterval();
        })
        .catch((error) => {
          console.error("Erreur d’authentification Bambu Connect:", error);
        });
    }
  },

  authenticate: async function () {
    if (!this.config || !this.config.email || !this.config.password) {
      throw new Error("Email ou mot de passe non configuré dans config.js");
    }

    try {
      const response = await axios.post(
        "https://api.bambulab.com/v1/auth/login",
        {
          username: this.config.email,
          password: this.config.password,
        }
      );
      this.token = response.data.token;
      console.log("Authentifié avec token Bambu Connect");
    } catch (error) {
      throw new Error("Échec d’authentification Bambu Connect");
    }
  },

  setupInterval: function () {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.sendBambuData();
    }, 60000);
  },

  sendBambuData: async function () {
    if (!this.token) {
      console.error("Token non disponible, impossible de récupérer données");
      return;
    }

    try {
      const response = await axios.get(
        "https://api.bambulab.com/v1/printer/status",
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );

      const data = response.data;

      this.sendSocketNotification("BAMBU_CONNECT_DATA", {
        objectName: data.currentPrint?.name || "N/A",
        timeRemaining: data.currentPrint?.timeRemaining || "N/A",
        nozzleTemp: data.temperatures?.nozzle || "N/A",
        bedTemp: data.temperatures?.bed || "N/A",
        chamberTemp: data.temperatures?.chamber || "N/A",
        snapshotUrl: data.currentPrint?.snapshotUrl || "",
      });
    } catch (error) {
      console.error("Erreur récupération données Bambu Connect:", error);
      this.sendSocketNotification("BAMBU_CONNECT_DATA", {
        objectName: "Erreur",
        timeRemaining: "N/A",
        nozzleTemp: "N/A",
        bedTemp: "N/A",
        chamberTemp: "N/A",
        snapshotUrl: "",
      });
    }
  },
});

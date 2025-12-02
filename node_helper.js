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
      if (!this.config.token) {
        console.error("Token d'accès Bambu Connect non configuré. Ajoutez 'token' dans config.js");
        return;
      }
      this.token = this.config.token;
      this.sendBambuData();
      this.setupInterval();
    }
  },

  setupInterval: function () {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.sendBambuData();
    }, this.config.updateInterval || 60000);
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
      console.error("Erreur récupération données Bambu Connect:", error.response?.data || error.message);
      this.sendSocketNotification("BAMBU_CONNECT_DATA", {
        objectName: "Erreur",
        timeRemaining: "N/A",
        nozzleTemp: "N/A",
        bedTemp: "N/A",
        chamberTemp: "N/A",
        snapshotUrl: "",
      });
    }
  }
});

Module.register("MMM-Bambu-Connect", {
  defaults: {
    updateInterval: 60000, // mise à jour toutes les 60s par défaut
  },

  start: function () {
    this.dataBambu = null; // contiendra les données reçues
    this.sendSocketNotification("BAMBU_CONNECT_START", this.config); // lance la requête au helper
    this.updateTimer = null;
  },

  getStyles: function () {
    return ["MMM-Bambu-Connect.css"]; // optionnel : fichier CSS personnalisé
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "BAMBU_CONNECT_DATA") {
      this.dataBambu = payload;
      this.updateDom();
    }
  },

  getDom: function () {
    var wrapper = document.createElement("div");
    wrapper.className = "bambu-container";

    if (!this.dataBambu) {
      wrapper.innerHTML = "Chargement des données Bambu Connect...";
      return wrapper;
    }

    // Affichage des données reçues (exemple simple)
    var title = document.createElement("h2");
    title.innerHTML = "Imprimante 3D BambuLab - Impression en cours";
    wrapper.appendChild(title);

    var objectName = document.createElement("div");
    objectName.innerHTML = "<strong>Objet : </strong>" + (this.dataBambu.objectName || "N/A");
    wrapper.appendChild(objectName);

    var tempsRestant = document.createElement("div");
    tempsRestant.innerHTML = "<strong>Temps restant : </strong>" + (this.dataBambu.timeRemaining || "N/A");
    wrapper.appendChild(tempsRestant);

    var temperature = document.createElement("div");
    temperature.innerHTML = "<strong>Températures (°C) - Buse : </strong>" + (this.dataBambu.nozzleTemp || "N/A") + 
                            " | Plateau : " + (this.dataBambu.bedTemp || "N/A") +
                            " | Chambre : " + (this.dataBambu.chamberTemp || "N/A");
    wrapper.appendChild(temperature);

    var img = document.createElement("img");
    img.src = this.dataBambu.snapshotUrl || "";
    img.alt = "Snapshot de l'objet";
    img.style.maxWidth = "100%";
    wrapper.appendChild(img);

    return wrapper;
  }
});

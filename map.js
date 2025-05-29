document.addEventListener('DOMContentLoaded', function () {
  const map = L.map('map').setView([48.864716, 2.349014], 13); // Paris center

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  console.log("Map initialized");

  const selectedNames = [
  "Berenice Abbott",
  "Bryher",
  "Claude Cahun",
  "Djuna Barnes",
  "Dorothy Wilde",
  "Élisabeth de Gramont",
  "Gertrude Stein",
  "Janet Flanner",
  "Kathryn Hulme",
  "Marcel Moore",
  "Margaret C. Anderson",
  "Natalie Clifford Barney",
  "Solita Solano",
  "Thelma Wood"
];

  // Load and parse your local JSON file
  $.getJSON("members.json", function (data) {
    console.log("Data loaded:", data);

    data.forEach(function (entry) {
      const lat = parseFloat(entry.latitude);
      const lon = parseFloat(entry.longitude);

      // Check for valid lat/lon
      if (!isNaN(lat) && !isNaN(lon)) {
        const member = entry.members[0];
        const name = member?.name || "Unnamed";
        const uri = member?.uri || "#";

        const popupContent = `
          <strong><a href="${uri}" target="_blank">${name}</a></strong><br/>
          ${entry.street_address || ''}<br/>
          ${entry.city || ''} ${entry.postal_code || ''}<br/>
          ${entry.country || ''}
        `;

        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(popupContent);
      } else {
        console.warn("Skipping entry with invalid or missing coordinates:", entry);
      }
    });
  }).fail(function (jqxhr, textStatus, error) {
    console.error("Error loading members.json:", textStatus, error);
  });

  // Optional reset zoom button
  document.getElementById("myButton").addEventListener("click", function () {
    map.setView([48.864716, 2.349014], 13);
  });
});

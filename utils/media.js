const axios = require("axios");

async function downloadBuffer(url) {
  const response = await axios.get(url, {
    responseType: "arraybuffer"
  });

  return Buffer.from(response.data);
}

module.exports = {
  downloadBuffer
};

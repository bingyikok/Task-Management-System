// Saved as .js file
const axios = require("axios");
let data = JSON.stringify({
     username: "dev",
     password: "admin123!",
     task_app_acronym: "demo",
     task_state: "open",
});

let config = {
     method: "post",
     maxBodyLength: Infinity,
     url: "http://localhost:3000/gettaskbystate",
     headers: {
          "Content-Type": "application/json",
     },
     data: data,
};

axios.request(config)
     .then((response) => {
          console.log(JSON.stringify(response.data));
     })
     .catch((error) => {
          console.log(error);
     });

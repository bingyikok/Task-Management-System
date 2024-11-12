// Saved as .js file
const axios = require("axios");
let data = JSON.stringify({
     username: "dev",
     password: "admin123!",
     task_id: "zoo_202",
     task_notes: "I am done with this task. Please review.",
});

let config = {
     method: "patch",
     maxBodyLength: Infinity,
     url: "http://localhost:3000/promotetask2done",
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

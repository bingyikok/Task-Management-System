// Saved as .js file
const axios = require("axios");
let data = JSON.stringify({
     username: "pl1",
     password: "admin123!",
     task_name: "eagle",
     task_app_acronym: "demo",
     task_description:
          "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,",
     task_notes: "a new task created.",
     task_plan: "sprint 2",
});

let config = {
     method: "post",
     maxBodyLength: Infinity,
     url: "http://localhost:3000/createtask",
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

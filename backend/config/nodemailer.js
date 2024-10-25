const nodemailer = require("nodemailer");
const connection = require("./database");
require("dotenv").config({ path: "./config.env" });

exports.sendMail = async (app_permit_done, task_id) => {
  const queryDonePermitUsers =
    "SELECT DISTINCT username FROM user_groups WHERE groupname = ?";
  const queryDonePermitEmail =
    "SELECT DISTINCT email FROM accounts WHERE username IN (?)";

  const transporter = nodemailer.createTransport({
    host: process.env.ETHHOST,
    port: process.env.ETHPORT,
    auth: {
      user: process.env.ETHUSER,
      pass: process.env.ETHPW,
    },
  });

  let message = {
    from: "admin <admin@ums.com>",
    to: "Project Lead <PL@tms.com>",
    subject: `Task ID: ${task_id} pending review`,
    text: "A new task is awaiting review.",
    html: "<p>A new task is awaiting review.</p>",
  };

  try {
    const [donePermitUsers] = await connection.query(queryDonePermitUsers, [app_permit_done,]);
    const usernames = donePermitUsers.map(user => user.username);
    const [donePermitEmail] = await connection.query(queryDonePermitEmail, [usernames,]);
    const emailList = donePermitEmail.map((email) => email.email).join(", ");
    message.to = emailList;

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log("Error occurred. " + err.message);
        return false;
      }
    });

    return true;
    
  } catch (error) {
    console.error("Error while sending mail: " + error.message);
    return false;
  }

  
};

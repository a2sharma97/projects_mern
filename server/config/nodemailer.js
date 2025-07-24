const nodemailer = require("nodemailer");
require("dotenv").config();
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

module.exports = {
  transporter,
};

const nodemailer = require('nodemailer')
const mailgunTransport = require('nodemailer-mailgun-transport')
const path=require("path")
var filepath = path.join(__dirname, '/images/');
const mailgunOptions = {
    auth: {
        api_key: process.env.MAILGUN_ACTIVE_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    }
}
const transport = mailgunTransport(mailgunOptions)
class EmailService {
    constructor() {
        this.emailClient = nodemailer.createTransport(transport)
    }
    sendText(to, subject, text,html) {
        return new Promise((resolve, reject) => {
            this.emailClient.sendMail({
                from: '"Renting Systems" <admin@renting.systems>',
                to,
                subject,
                text,
                html,
            }, (err, info) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(info)
                }
            })
        })
    }
}
module.exports = new EmailService()
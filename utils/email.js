const nodemailer = require('nodemailer');
// const nodemailerSendgrid = require('nodemailer-sendgrid');
// const sgMail = require('@sendgrid/mail');
const pug = require('pug');
const { htmlToText } = require('html-to-text')

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = class Email {
    constructor(user, url) {
       this.to = user.email;
       this.firstName = user.name.split(' ')[0];
       this.from = `Diyaz Mukhanov <${process.env.EMAIL_FROM}>`;
       this.url = url;
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production') {
            //Sendgrid
            return nodemailer.createTransport({
                // service: 'SendGrid',
                host: "smtp.mail.ru",
                port: 465,
                auth: {
                    user: 'diyaz_k@mail.ru',
                    pass: 'brncFWQDRqK8zK7MUtTz'
                }
                // auth: {
                //     user: process.env.SENDGRID_USERNAME,
                //     pass: process.env.SENDGRID_PASSWORD,
                // }
            })

            // return

            // return nodemailer.createTransport(
            //     nodemailerSendgrid({
            //         apiKey: process.env.SENDGRID_PASSWORD
            //     })
            // )
        }

        return nodemailer.createTransport({
            // service: 'Gmail',
            host: 'smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: "2e23bd3dbbb624",
                pass: "a2cb76ee480b70"
            }
            //Activate in gmail "less secure app" option
            //Don't use gmail for production purpose. 500 emails only also will be included into spam and crush
        })
    }

// Send the actual email
    async send(template, subject) {
        // 1) Render html based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject: subject
        })


        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: htmlToText(html)
        };

        // const msg = {
        //     to: this.to,
        //     from: this.from,
        //     subject,
        //     html: html,
        //     text: htmlToText(html)
        // }

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
        // await sgMail.send(msg);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for 10 minutes only');
    }
}



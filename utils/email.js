const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
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
    // 2) Define the email options
    const mailOptions = {
        from: 'Diyaz Mukhanov <mukhanov.developer@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
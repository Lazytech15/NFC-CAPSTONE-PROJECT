import nodemailer from 'nodemailer';

export async function handler(event, context) {
    const { to, subject, text } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'renatoablao24@gmail.com',
            pass: 'TheZombie'
        }
    });

    const mailOptions = {
        from: 'renatoablao24@gmail.com',
        to,
        subject,
        text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent: ' + info.response })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.toString() })
        };
    }
}

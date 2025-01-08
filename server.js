import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'renatoablao24@gmail.com',
        pass: 'TheZombie11223344'
    }
});

app.post('/send-email', (req, res) => {
    const { to, subject, text } = req.body;
    const mailOptions = {
        from: 'renatoablao24@gmail.com',
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.status(200).send('Email sent: ' + info.response);
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

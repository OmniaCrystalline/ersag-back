require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const { HOST_DB, USER, PASS, EMAIL } = process.env;
const PORT = 3000;
const router = express.Router()
const logger = require('morgan')
const cors = require('cors')
const { Types } = require('mongoose')
const { Schema, model } = require('mongoose');


async function main() {
    try {
        if (!HOST_DB) {
            throw new Error("HOST_DB not set!");
        }

        await mongoose.connect(HOST_DB);

        console.log("Database connection successful");

        app.listen(PORT, (err) => {
            if (err) throw err;
            console.log(`server is listening on port: ${PORT}`);
        });
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}
main()

//model

const OrderSchema = new Schema({
    order: {
        type: Array,
    }
})

const Order = model('orders', OrderSchema)

//routes
const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())
app.use('/', router)
app.use((req, res) => {
    return res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
    console.log('500', err)
    if (!Types.ObjectId.isValid(req.params.id)) res.status(404).json({ message: "Not found" })
    return res.status(500).json({ message: err.message })
})

async function sendMail(req, res, next) {
    const { body } = req
    console.log('body', body)

    await mailSender(body)
    return res.json({ message: body });
}

router.post('/', sendMail)

const nodemailer = require("nodemailer");

async function mailSender(body) {
    const { order:{order, name, phone} } = body
    console.log('body', order)

    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            secure: false,
            port: 587,
            auth: {
                user: USER,
                pass: PASS,
            }
        });

        const letter = {
            from: 'client',
            to: EMAIL,
            subject: "order",
            html: `<p>name: ${name}</p>
            <p>phone: ${phone}</p>
            <p>order: ${order}
            `,
            text: `<p>замовлення</p>`,
        };

        await transport.sendMail(letter);
        console.log("Message sent: %s", letter.messageId);


    } catch (error) {
        console.log('error', error)
    }

}

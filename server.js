require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const { HOST_DB, USER, PASS, EMAIL, NEWPASS, USER_NAME, MONGO_URL } =
  process.env;
const PORT = 3000;
const router = express.Router()
const logger = require('morgan')
const cors = require('cors')
const { Types } = require('mongoose')
const { Schema, model } = require('mongoose');
const controller = require("./models/goods.models")



async function main() {
    try {
        if (!MONGO_URL) {
          throw new Error("HOST_DB not set!");
        }
        await mongoose.connect(MONGO_URL);
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
    const { order, name, phone } = body
    const result = await mailSender(order, name, phone)
    return res.json({ mes: order })
}

router.post('/', sendMail)
router.post('/add', controller.addGoods)
router.get('/', controller.getGoods)

const nodemailer = require("nodemailer");

async function mailSender(order, name, phone) {
    const list = order.map(({ name, quantity, price, ml }) =>
    `<li>${name}-${ml}ml-${quantity}шт-${price}грн</li>`).join('')

    const s = order.reduce((acc, cur)=> 
        acc+= Number(cur.quantity) * Number(cur.price), 0)

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
            <ul>
            ${list}
            <p>на суму: ${s}</p>`,
            text: `<p>замовлення</p>`,
        };
        await transport.sendMail(letter);
        console.log("Message sent: %s", letter.messageId);
    } catch (error) {
        console.log('error', error)
    }
}

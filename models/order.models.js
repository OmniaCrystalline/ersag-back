/** @format */

const { Order } = require("../schemas/order.schema");

async function addOrder(req, res, next) {
    try {
        await Order.create(req.body);
        await mailSender(req)
        
    return res.json({message: res.data});
  } catch (error) {
    return res.json(error);
  }
}

const nodemailer = require("nodemailer");

async function mailSender({req:{order, name, phone}}) {
  const list = order
    .map(
      ({ title, quantity, price, volume }) =>
        `<li>${title}-${volume}ml-${quantity}шт-${price}грн</li>`
    )
    .join("");

  const s = order.reduce(
    (acc, cur) => (acc += Number(cur.quantity) * Number(cur.price)),
    0
  );

  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      secure: false,
      port: 587,
      auth: {
        user: USER,
        pass: PASS,
      },
    });

    const letter = {
      from: "client",
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
    console.log("error", error);
  }
}

module.exports = {
    addOrder,
}


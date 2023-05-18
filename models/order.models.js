/** @format */

///server update get order router , add order render

const { Order } = require("../schemas/order.schema");

async function addOrder(req, res, next) {
  try {
    req.body.active = true;
    await Order.create(req.body);
    await mailSender(req.body);

    return res.json({ message: "order added" });
  } catch (error) {
    return res.json(error);
  }
}

const nodemailer = require("nodemailer");

async function mailSender(req) {
  const { name, phone, order } = req.body;
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

async function fetchOrders(req, res, next) {
  try {
    const data = await Order.find({ active: true });
    if (data.length === 0) return res.json({ message: "no orders" });
    else {
      return res.json({ data });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
}

async function fetchArchive(req, res, next) {
  
  try {
    const data = await Order.find({ active: false });
    console.log('data', data)
    return res.json({data});
  } catch (error) {
    return res.status(500).json({ message: error });
  }
}

async function moveToArchive(req, res, next) {
  try {
    const response = await Order.findByIdAndUpdate(
      req.body._id,
      { active: false },
      { new: true }
    );
    return res.json({ message: response });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
}

module.exports = {
  addOrder,
  fetchOrders,
  fetchArchive,
  moveToArchive,
};

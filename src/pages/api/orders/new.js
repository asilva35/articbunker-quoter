import axios from 'axios';
import { getToken } from 'next-auth/jwt';

function generateUUID() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (d + Math.random() * 16) % 16 | 0;
    // eslint-disable-next-line no-bitwise
    d = Math.floor(d / 16);
    // eslint-disable-next-line no-bitwise
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

async function createOrder(userid, data_contact, order_request) {
  const url = `${process.env.VIRTEL_DASHBOARD_URL}6d498a2a94a3/quoter/orders`;

  try {
    const order_new = {
      id: generateUUID(),
      status: 'pendiente',
      userid,
      product: order_request.id,
    };
    const response = await axios({
      method: 'post',
      url: url,
      headers: {
        Authorization: `Bearer ${process.env.VIRTEL_DASHBOARD_API_KEY}`,
      },
      data: order_new,
    });

    const order = response.data || null;

    return order;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    const { id: userid } = token;

    const { data_contact, order_request } = req.body;

    const order = await createOrder(userid, data_contact, order_request);

    if (!order)
      return res.status(500).send({ message: 'Order could not be processed ' });

    res.status(200).json({ order });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}

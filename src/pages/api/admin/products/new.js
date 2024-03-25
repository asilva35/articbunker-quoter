import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import { sanitizeOBJ } from '@/utils/utils';

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

async function createRecord(userid, record) {
  const url = `${process.env.VIDASHY_URL}6d498a2a94a3/quoter/products`;
  try {
    const new_record = sanitizeOBJ({
      id: generateUUID(),
      productName: record.productName,
      description: record.description,
      productImage: record.productImage,
      status: 'active',
    });
    const response = await axios({
      method: 'post',
      url: url,
      headers: {
        Authorization: `Bearer ${process.env.VIDASHY_API_KEY}`,
      },
      data: new_record,
    });

    return response.data || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    const { id: userid, role } = token;

    if (role !== 'admin') {
      return res.status(401).send({ message: 'Not authorized' });
    }

    const { record_request } = req.body;

    const validation = {};

    if (!record_request.productName || record_request.productName === '') {
      validation.productName = 'Field Required';
    }
    if (!record_request.description || record_request.description === '') {
      validation.description = 'Field Required';
    }

    //EVALUATE IF VALIDATION IS NOT EMPTY
    if (Object.keys(validation).length > 0) {
      return res.status(500).send({
        message: 'Product could not be processed',
        validation,
      });
    }

    const product = await createRecord(userid, record_request);

    if (!product)
      return res
        .status(500)
        .send({ message: 'Product could not be processed ' });

    res.status(200).json({ product });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}

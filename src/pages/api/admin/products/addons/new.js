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
  const url = `${process.env.VIDASHY_URL}6d498a2a94a3/quoter/addons`;
  try {
    const new_record = sanitizeOBJ({
      id: generateUUID(),
      userid,
      text: record.text,
      productName: record.productName,
      productID: record.productID,
      help: record.help,
      percent: record.percent,
      category: record.category,
      status: 'active',
    });
    const response = await axios({
      method: 'post',
      url,
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
    if (!record_request.text || record_request.text === '') {
      validation.text = 'Field Required';
    }
    if (!record_request.productName || record_request.productName === '') {
      validation.productName = 'Field Required';
    }
    if (!record_request.help || record_request.help === '') {
      validation.help = 'Field Required';
    }
    if (!record_request.percent || record_request.percent === '') {
      validation.percent = 'Field Required';
    }
    if (
      record_request.percent &&
      isNaN(Number.parseInt(record_request.percent))
    ) {
      validation.percent = 'This field must be a number';
    }
    if (!record_request.category || record_request.category === '') {
      validation.category = 'Field Required';
    }

    //EVALUATE IF VALIDATION IS NOT EMPTY
    if (Object.keys(validation).length > 0) {
      return res.status(500).send({
        message: 'Record could not be processed',
        validation,
      });
    }

    const response = await createRecord(userid, record_request);

    if (!response)
      return res
        .status(500)
        .send({ message: 'Record could not be processed ' });

    res.status(200).json({ response });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}

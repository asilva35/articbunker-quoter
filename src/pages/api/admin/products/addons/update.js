import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import { sanitizeOBJ } from '@/utils/utils';

async function updateRecord(userid, record) {
  const url = `${process.env.VIDASHY_URL}6d498a2a94a3/quoter/addons`;

  try {
    const record_update = sanitizeOBJ({
      id: record.id,
      category: record.category,
      productID: record.productID,
      productName: record.productName,
      text: record.text,
      help: record.help,
      percent: record.percent,
    });

    const response = await axios({
      method: 'patch',
      url: url,
      headers: {
        Authorization: `Bearer ${process.env.VIDASHY_API_KEY}`,
      },
      data: record_update,
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

    const response = await updateRecord(userid, record_request);

    if (!response)
      return res
        .status(500)
        .send({ message: 'Record could not be processed ' });

    res.status(200).json({ response });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}

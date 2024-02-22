import axios from 'axios';
import bcryptjs from 'bcryptjs';
import { getToken } from 'next-auth/jwt';
import { sanitizeOBJ } from '@/utils/utils';
import { getRecords } from '@/vidashy-sdk/dist/backend';
import { filterBy, filterValue, filterComparison } from '@/utils/filters';

async function updateRecord(userid, record) {
  const url = `${process.env.VIDASHY_URL}6d498a2a94a3/quoter/users`;

  try {
    const record_update = sanitizeOBJ({
      id: record.id,
      name: record.name,
      username: record.username,
      email: record.email,
      role: record.role,
      address: record.address,
      invoice_to: record.invoice_to,
      contact_name: record.contact_name,
      contact_phone: record.contact_phone,
    });

    if (record.password) {
      const salt = `$2a$10$${process.env.BCRIPT_SALT}`;
      const hash = bcryptjs.hashSync(record.password, salt);
      record_update.password = hash;
    }

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

async function verifyUsername(id, username) {
  return await getRecords({
    backend_url: process.env.VIDASHY_URL,
    organization: process.env.VIDASHY_ORGANIZATION,
    database: process.env.VIDASHY_DATABASE,
    object: 'users',
    api_key: process.env.VIDASHY_API_KEY,
    params: {
      filterBy: filterBy({ id, username }),
      filterValue: filterValue({ id, username }),
      filterComparison: filterComparison({ id: 'ne', username: 'eq' }),
    },
  });
}

async function verifyEmail(id, email) {
  return await getRecords({
    backend_url: process.env.VIDASHY_URL,
    organization: process.env.VIDASHY_ORGANIZATION,
    database: process.env.VIDASHY_DATABASE,
    object: 'users',
    api_key: process.env.VIDASHY_API_KEY,
    params: {
      filterBy: filterBy({ id, email }),
      filterValue: filterValue({ id, email }),
      filterComparison: filterComparison({ id: 'ne', username: 'eq' }),
    },
  });
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    const { id: userid, role } = token;

    if (role !== 'admin') {
      return res.status(401).send({ message: 'Not authorized' });
    }

    const { record } = req.body;

    const validation = {};

    if (!record.name || record.name === '') {
      validation.name = 'Field Required';
    }
    if (!record.username || record.username === '') {
      validation.username = 'Field Required';
    }
    if (!record.email || record.email === '') {
      validation.email = 'Field Required';
    }
    if (!record.role || record.role === '') {
      validation.role = 'Field Required';
    }
    if (!record.address || record.address === '') {
      validation.address = 'Field Required';
    }
    if (!record.invoice_to || record.invoice_to === '') {
      validation.invoice_to = 'Field Required';
    }
    if (!record.contact_name || record.contact_name === '') {
      validation.contact_name = 'Field Required';
    }
    if (!record.contact_phone || record.contact_phone === '') {
      validation.contact_phone = 'Field Required';
    }

    //VERIFY IF USERNAME EXISTS
    if (record.email && record.email !== '') {
      const user = await verifyUsername(record.id, record.username);
      if (user && user.records && user.records.length > 0) {
        validation.username = 'Username already exists';
      }
    }

    //VERIFY IF EMAIL EXISTS
    if (record.email && record.email !== '') {
      const user = await verifyEmail(record.id, record.email);
      if (user && user.records && user.records.length > 0) {
        validation.email = 'Email already exists';
      }
    }

    //EVALUATE IF VALIDATION IS NOT EMPTY
    if (Object.keys(validation).length > 0) {
      return res.status(500).send({
        message: 'Record could not be processed',
        validation,
      });
    }

    const response = await updateRecord(userid, record);

    if (!response)
      return res
        .status(500)
        .send({ message: 'Record could not be processed ' });

    res.status(200).json({ response });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}

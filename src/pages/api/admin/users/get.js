import { getRecords } from '@/vidashy-sdk/dist/backend';
import { getToken } from 'next-auth/jwt';
import { filterBy, filterValue } from '@/utils/filters';

async function listRecords(id) {
  const params = {
    filter: {
      id,
    },
  };
  return await getRecords({
    backend_url: process.env.VIDASHY_URL,
    organization: process.env.VIDASHY_ORGANIZATION,
    database: process.env.VIDASHY_DATABASE,
    object: 'users',
    api_key: process.env.VIDASHY_API_KEY,
    v: '1.1',
    params,
  });
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token)
      return res.status(401).send({ data: {}, message: 'Not authorized' });

    const { id } = req.query;
    const { role } = token;

    if (role !== 'admin') {
      return res.status(401).send({ data: {}, message: 'Not authorized' });
    }

    let records = await listRecords(id);

    if (!records || !records.records || records.records.length === 0)
      return res
        .status(404)
        .send({ data: records, message: 'Records Not found' });

    //REMOVE SENSIBLE DATA OF RECORDS
    records.records.map((_record) => {
      delete _record.password;
      delete _record._id;
      delete _record.updatedAt;
    });

    res.status(200).json({ data: records });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}

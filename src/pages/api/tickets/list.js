import { getRecords } from '@/virtel-sdk/dist/backend';
import { getToken } from 'next-auth/jwt';
import { filterBy, filterValue } from '@/utils/filters';

async function listRecords(userid, page = 1, pageSize = 5) {
  return await getRecords({
    backend_url: process.env.VIRTEL_DASHBOARD_URL,
    organization: process.env.VIRTEL_DASHBOARD_ORGANIZATION,
    database: process.env.VIRTEL_DASHBOARD_DATABASE,
    object: 'tickets',
    api_key: process.env.VIRTEL_DASHBOARD_API_KEY,
    params: {
      filterBy: filterBy({ 'userOwner.userid': userid }),
      filterValue: filterValue({ 'userOwner.userid': userid }),
      page,
      pageSize,
    },
  });
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token)
      return res.status(401).send({ data: {}, message: 'Not authorized' });

    const { page, pageSize } = req.query;
    const { id: userid } = token;

    let records;

    records = await listRecords(userid, page, pageSize);

    if (!records || !records.records || records.records.length === 0)
      return res
        .status(404)
        .send({ data: records, message: 'Records Not found' });

    //REMOVE SENSIBLE DATA OF RECORDS
    records.records.map((_record) => {
      delete _record._id;
      delete _record.updatedAt;
    });

    res.status(200).json({ data: records });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}

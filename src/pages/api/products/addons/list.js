import { getRecords } from '@/virtel-sdk/dist/backend';
import { getToken } from 'next-auth/jwt';
import { filterBy, filterValue } from '@/utils/filters';

async function listRecords(object, productid) {
  return await getRecords({
    backend_url: process.env.VIRTEL_DASHBOARD_URL,
    organization: process.env.VIRTEL_DASHBOARD_ORGANIZATION,
    database: process.env.VIRTEL_DASHBOARD_DATABASE,
    object,
    api_key: process.env.VIRTEL_DASHBOARD_API_KEY,
    params: {
      filterBy: filterBy({ productID: productid }),
      filterValue: filterValue({ productID: productid }),
      page: 1,
      pageSize: 100,
    },
  });
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    const { productid } = req.query;

    const records = await listRecords('addons', productid);

    if (!records) return res.status(404).send({ message: 'Records Not found' });

    res.status(200).json({ records });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}

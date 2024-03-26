import { getRecords } from '@/vidashy-sdk/dist/backend';
import { getToken } from 'next-auth/jwt';

async function getProducts(page = 1, pageSize = 5, search = '') {
  const params = {
    page,
    pageSize,
    filter: {
      status: 'active',
    },
  };
  if (search) {
    params.filter = {
      and: [
        { and: [{ status: 'active' }] },
        {
          or: [
            {
              productName: { regex: `.*${search}.*`, optionsRegex: 'i' },
            },
            { description: { regex: `.*${search}.*`, optionsRegex: 'i' } },
          ],
        },
      ],
    };
  }
  return await getRecords({
    backend_url: process.env.VIDASHY_URL,
    organization: process.env.VIDASHY_ORGANIZATION,
    database: process.env.VIDASHY_DATABASE,
    object: 'products',
    api_key: process.env.VIDASHY_API_KEY,
    v: '1.1',
    params,
  });
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    const { page, pageSize, search } = req.query;
    const { role } = token;

    let products;

    products = await getProducts(page, pageSize, search);

    if (!products || !products.records || products.records.length === 0)
      return res.status(404).send({ products, message: 'Products Not found' });

    //REMOVE SENSIBLE DATA OF RECORDS
    products.records.map((_record) => {
      delete _record._id;
      delete _record.updatedAt;
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}

import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import { sanitizeOBJ } from '@/utils/utils';

async function updateProduct(userid, product_request) {
  const url = `${process.env.VIDASHY_URL}6d498a2a94a3/quoter/products`;

  try {
    const product_update = sanitizeOBJ({
      id: product_request.id,
      productName: product_request.productName,
      productSubtitle: product_request.productSubtitle,
      description: product_request.description,
      productImage: product_request.productImage,
    });

    const response = await axios({
      method: 'patch',
      url: url,
      headers: {
        Authorization: `Bearer ${process.env.VIDASHY_API_KEY}`,
      },
      data: product_update,
    });

    const product = response.data || null;

    return product_update;
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

    const { product_request } = req.body;

    const validation = {};

    if (!product_request.productName || product_request.productName === '') {
      validation.productName = 'Field Required';
    }
    if (!product_request.description || product_request.description === '') {
      validation.description = 'Field Required';
    }
    if (
      !product_request.productImage.src ||
      product_request.productImage.src === ''
    ) {
      validation.productImage = 'Field Required';
    }

    //EVALUATE IF VALIDATION IS NOT EMPTY
    if (Object.keys(validation).length > 0) {
      return res.status(500).send({
        message: 'Product could not be processed',
        validation,
      });
    }

    const product = await updateProduct(userid, product_request);

    if (!product)
      return res
        .status(500)
        .send({ message: 'Product could not be processed ' });

    res.status(200).json({ product });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}

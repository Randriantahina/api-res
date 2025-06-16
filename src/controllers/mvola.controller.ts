import axios from 'axios';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';
import prisma from '@/lib/db';
import { validationResult } from 'express-validator';

const getAccessToken = async (): Promise<string> => {
  const consumerKey = process.env.MVOLA_CONSUMER_KEY!;
  const consumerSecret = process.env.MVOLA_CONSUMER_SECRET!;

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    'base64',
  );

  const response = await axios.post(
    'https://developer.mvola.mg/oauth2/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  return response.data.access_token;
};

type TransactionRequest = {
  amount: number;
  currency: string;
  descriptionText: string;
  requestDate: string;
  debitParty: { key: string; value: string }[];
  creditParty: { key: string; value: string }[];
  metadata: { key: string; value: string }[];
  requestingOrganisationTransactionReference: string;
  originalTransactionReference: string;
};

const createTransactionBody = (
  amount: number,
  payer: string,
  payee: string,
  description: string,
  partnerName: string,
): TransactionRequest => {
  const transactionRef = uuidv4();
  return {
    amount,
    currency: 'Ar',
    descriptionText: description,
    requestDate: new Date().toISOString(),
    debitParty: [{ key: 'msisdn', value: payer }],
    creditParty: [{ key: 'msisdn', value: payee }],
    metadata: [
      { key: 'partnerName', value: partnerName },
      { key: 'fc', value: 'Ar' },
      { key: 'amountFc', value: amount.toString() },
    ],
    requestingOrganisationTransactionReference: transactionRef,
    originalTransactionReference: transactionRef,
  };
};

const sendMerchantPayment = async (
  accessToken: string,
  transaction: TransactionRequest,
  partnerName: string,
  callbackUrl: string,
) => {
  const correlationId = uuidv4();

  const response = await axios.post(
    'https://developer.mvola.mg/mvola/mm/transactions/type/merchantpay/1.0.0',
    transaction,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-USER-LANGUAGE': 'FR',
        'X-USER-CURRENCY': 'Ar',
        'X-CorrelationID': correlationId,
        'X-Callback-URL': callbackUrl,
        'X-PartnerName': partnerName,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};
const requestToPay = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { amount, payer, bookingId } = req.body;

    const accessToken = await getAccessToken();
    const partnerName = process.env.MVOLA_PARTNER_NAME!;
    const callbackUrl = process.env.MVOLA_CALLBACK_URL!;

    const payee = '0340000000';
    const description = `Paiement réservation #${bookingId}`;

    const transaction = createTransactionBody(
      amount,
      payer,
      payee,
      description,
      partnerName,
    );

    const response = await sendMerchantPayment(
      accessToken,
      transaction,
      partnerName,
      callbackUrl,
    );

    await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: {
        status: 'confirmed',
        updatedAt: new Date(),
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: Number(bookingId),
        amount,
        status: 'paid',
      },
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
};

export { requestToPay };

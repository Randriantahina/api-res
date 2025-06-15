import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as mvolaService from '../services/mvola.service';

async function getToken(req: Request, res: Response) {
  try {
    const token = await mvolaService.getAccessToken();
    res.json({ access_token: token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
}

async function transfer(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { amount, phoneNumber, externalId, payerMessage, payeeNote } = req.body;

  try {
    const data = {
      amount,
      currency: 'MGA',
      externalId: externalId || 'EXT123456',
      payer: { partyIdType: 'MSISDN', partyId: phoneNumber },
      payeeNote: payeeNote || 'Paiement MVola',
      payerMessage: payerMessage || 'Merci pour votre paiement',
    };

    const response = await mvolaService.makeApiCall(
      '/mvola/v1/transfer',
      'POST',
      data,
    );
    res.json(response);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
}

export { getToken, transfer };

import { Router, Request, Response } from 'express';
import { validateTransfer } from '@/validations/mvola.validator';
import { requestToPay } from '@/controllers/mvola.controller';

const router = Router();

router.post('/', validateTransfer, requestToPay);

export default router;

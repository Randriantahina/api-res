import { Router } from 'express';
import { getToken, transfer } from '@/controllers/mvola.controller';
import { validateTransfer } from '@/validations/mvola.validator';

const router = Router();

router.get('/token', getToken);
router.post('/transfer', validateTransfer, transfer);

export default router;

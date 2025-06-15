import { body } from 'express-validator';

export const validateTransfer = [
  body('amount')
    .notEmpty()
    .withMessage('Le montant est requis')
    .isNumeric()
    .withMessage('Le montant doit être un nombre'),

  body('phoneNumber')
    .notEmpty()
    .withMessage('Le numéro de téléphone est requis')
    .matches(/^(0|261)34\d{7}$/)
    .withMessage('Numéro MVola invalide'),
];

import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer({ dest: 'tmp/' });

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category } = request.body;

    const createTransaction = new CreateTransactionService();

    const transaction = await createTransaction.execute({
      title,
      value,
      type,
      category,
    });

    return response.json(transaction);
  } catch (err) {
    return response.status(400).json({ message: err.message, status: 'error' });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const deleteTransaction = new DeleteTransactionService();

    await deleteTransaction.execute(id);

    return response.status(204).send();
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransaction = new ImportTransactionsService();
    const transaction = await importTransaction.execute(request.file.path);
    return response.json(transaction);
  },
);

export default transactionsRouter;

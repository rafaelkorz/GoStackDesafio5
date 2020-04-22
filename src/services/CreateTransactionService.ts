import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    if (!['outcome', 'income'].includes(type)) {
      throw new AppError('Type not allowed', 400);
    }

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome') {
      if (total < value) {
        throw new AppError('Dont have balance');
      }
    }

    let checkFindCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkFindCategory) {
      checkFindCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(checkFindCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: checkFindCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

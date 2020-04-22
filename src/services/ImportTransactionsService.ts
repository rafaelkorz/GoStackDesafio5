import csvtojson from 'csvtojson';
import fs from 'fs';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(transactionPath: string): Promise<Transaction[]> {
    const csv_exists = await fs.promises.stat(transactionPath);

    if (!csv_exists) {
      throw new AppError('File doesnt found', 404);
    }

    const imports = await csvtojson().fromFile(transactionPath);
    fs.unlinkSync(transactionPath); // remove temp file

    const createTransaction = new CreateTransactionService();

    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < imports.length; index++) {
      // eslint-disable-next-line no-await-in-loop
      await createTransaction.execute({
        title: imports[index].title,
        type: imports[index].type,
        value: imports[index].value,
        category: imports[index].category,
      });
    }

    return imports;
  }
}

export default ImportTransactionsService;

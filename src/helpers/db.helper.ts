import type { Sequelize, Transaction } from 'sequelize';

export enum AdvisoryLockNamespace {
  SignIn = 1,
  CodeIssue = 2,
}

export const lockByKey = async (
  sequelize: Sequelize,
  namespace: AdvisoryLockNamespace,
  key: string,
  transaction: Transaction,
): Promise<void> => {
  await sequelize.query(
    'SELECT pg_advisory_xact_lock(:namespace, hashtext(:key))',
    {
      replacements: { namespace, key },
      transaction,
    },
  );
};

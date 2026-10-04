import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Authors } from './authors.model';

// форма "верификация профиля"
@Table({ tableName: 'author_verifications' })
export class AuthorVerifications extends Model {
  declare id: number;

  @ForeignKey(() => Authors)
  @Column({ type: DataType.INTEGER, unique: true })
  declare authorId: number;

  @Column({ type: DataType.STRING(100), defaultValue: 'Россия' })
  declare country: string;

  @Column({ type: DataType.STRING(30) })
  declare taxStatus: string;

  // Самозанятый / ИП
  @Column({ type: DataType.STRING(100), allowNull: true })
  declare lastName: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare firstName: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare middleName: string | null;

  // Самозанятый
  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare birthDate: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare snils: string | null;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare passportIssueDate: string | null;

  @Column({ type: DataType.STRING(10), allowNull: true })
  declare passportSeries: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare passportNumber: string | null;

  // ИП / ООО
  @Column({ type: DataType.STRING(20), allowNull: true })
  declare inn: string | null;

  // ООО
  @Column({ type: DataType.STRING(20), allowNull: true })
  declare kpp: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare ogrn: string | null;

  // Общие для всех веток
  @Column({ type: DataType.STRING(30), allowNull: true })
  declare bankAccount: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare bik: string | null;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare agreedToTerms: boolean;

  @BelongsTo(() => Authors)
  declare author: Authors;
}

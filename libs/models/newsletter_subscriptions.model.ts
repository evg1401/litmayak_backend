import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'newsletter_subscriptions' })
export class NewsletterSubscriptions extends Model {
  declare id: number;

  @Column({ type: DataType.STRING(150), unique: true })
  declare email: string;
}

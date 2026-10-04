import { Authors, AuthorVerifications } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  AuthorTaxStatus,
  AuthorVerificationStatus,
} from '@/common/constants/author_verification.constants';
import { SubmitAuthorVerificationRequestDto } from './dto/author_verifications.request.dto';

export interface AuthorVerificationSubmissionView {
  country: string;
  taxStatus: string;
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
  birthDate: string | null;
  snils: string | null;
  passportIssueDate: string | null;
  passportSeries: string | null;
  passportNumber: string | null;
  inn: string | null;
  kpp: string | null;
  ogrn: string | null;
  bankAccount: string | null;
  bik: string | null;
}

export interface AuthorVerificationView {
  status: string;
  submission: AuthorVerificationSubmissionView | null;
}

function present(row: AuthorVerifications): AuthorVerificationSubmissionView {
  return {
    country: row.country,
    taxStatus: row.taxStatus,
    lastName: row.lastName,
    firstName: row.firstName,
    middleName: row.middleName,
    birthDate: row.birthDate,
    snils: row.snils,
    passportIssueDate: row.passportIssueDate,
    passportSeries: row.passportSeries,
    passportNumber: row.passportNumber,
    inn: row.inn,
    kpp: row.kpp,
    ogrn: row.ogrn,
    bankAccount: row.bankAccount,
    bik: row.bik,
  };
}

@Injectable()
export class AuthorVerificationsService {
  constructor(
    @InjectModel(Authors) protected authorsRepository: typeof Authors,
    @InjectModel(AuthorVerifications)
    protected model: typeof AuthorVerifications,
  ) {}

  private async getAuthor(userId: number): Promise<Authors> {
    const author = await this.authorsRepository.findOne({
      where: { userId },
    });
    if (!author) throw new Error('вы не являетесь автором');
    return author;
  }

  async getStatus(userId: number): Promise<AuthorVerificationView> {
    const author = await this.getAuthor(userId);
    const submission = await this.model.findOne({
      where: { authorId: author.id },
    });
    return {
      status: author.verificationStatus,
      submission: submission ? present(submission) : null,
    };
  }

  private validateByTaxStatus(request: SubmitAuthorVerificationRequestDto) {
    if (!request.bankAccount || !request.bik) {
      throw new Error('заполните расчётный счёт и БИК');
    }

    if (request.taxStatus === AuthorTaxStatus.SelfEmployed) {
      if (
        !request.lastName ||
        !request.firstName ||
        !request.birthDate ||
        !request.snils ||
        !request.passportIssueDate ||
        !request.passportSeries ||
        !request.passportNumber
      ) {
        throw new Error('заполните все поля для самозанятого');
      }
    } else if (request.taxStatus === AuthorTaxStatus.IndividualEntrepreneur) {
      if (!request.lastName || !request.firstName || !request.inn) {
        throw new Error(
          'заполните все поля для индивидуального предпринимателя',
        );
      }
    } else if (request.taxStatus === AuthorTaxStatus.Llc) {
      if (!request.inn || !request.kpp || !request.ogrn) {
        throw new Error('заполните все поля для организации');
      }
    }
  }

  async submit(
    userId: number,
    request: SubmitAuthorVerificationRequestDto,
  ): Promise<AuthorVerificationView> {
    if (!request.agreedToTerms) {
      throw new Error('нужно подтвердить согласие с условиями');
    }
    this.validateByTaxStatus(request);

    const author = await this.getAuthor(userId);

    const [row] = await this.model.findOrCreate({
      where: { authorId: author.id },
      defaults: { authorId: author.id, ...request },
    });
    await row.update({ ...request });

    author.verificationStatus = AuthorVerificationStatus.Pending;
    await author.save();

    return {
      status: AuthorVerificationStatus.Pending,
      submission: present(row),
    };
  }
}

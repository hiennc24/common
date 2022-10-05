export abstract class BaseEntity {
  _id!: string;
  id!: string;
  modifiedBy!: string;
  _destroy!: boolean;
  createdAt!: string | Date;
  updatedAt!: string | Date;
}

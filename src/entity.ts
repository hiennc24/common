export abstract class BaseEntity {
  id!: string;
  modifiedBy!: string;
  _destroy!: boolean;
  createdAt!: string | Date;
  updatedAt!: string | Date;
}

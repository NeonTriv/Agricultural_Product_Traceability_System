export enum EditType {
  Rename = 'Rename',
  SetQuantity = 'SetQuantity',
  IncQuantity = 'IncQuantity',
  DecQuantity = 'DecQuantity',
}

export type UpdatePayload = {
  type?: EditType | string | number;  
  value?: string | number;            

  editType?: EditType | string | number;
  name?: string;
  quantity?: number;
  by?: number;
};

export class CreateVegetableDto {
  Name!: string;
  Quantity!: number;
}

export class UpdateVegetableDto {
  Name?: string;
  Quantity?: number;
}
export enum EditType {
  Rename = 'rename',
  SetQuantity = 'setQuantity',
  IncQuantity = 'incQuantity',
  DecQuantity = 'decQuantity',
}

export type EditPayload =
  | { editType: EditType.Rename; name: string }
  | { editType: EditType.SetQuantity; quantity: number }
  | { editType: EditType.IncQuantity; by: number }
  | { editType: EditType.DecQuantity; by: number };

export class CreateVegetableDto {
  Name!: string;
  Quantity!: number;
}

export class UpdateVegetableDto {
  Name?: string;
  Quantity?: number;
}
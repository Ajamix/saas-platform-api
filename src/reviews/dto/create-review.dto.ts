export class CreateReviewDto {
    name: string;
    description?: string;
    tenantId: string;
    type: 'testimony' | 'star'; 
  }

  
 export class CreateReviewSubmissionDto {
    reviewTypeId: number;
    content?: string;
    rating?: number;
    comment?: string;
    tenantId: string;
    isActive: boolean;
  }
  
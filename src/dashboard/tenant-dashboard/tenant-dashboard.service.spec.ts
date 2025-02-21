import { Test, TestingModule } from '@nestjs/testing';
import { TenantDashboardService } from './tenant-dashboard.service';

describe('TenantDashboardService', () => {
  let service: TenantDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantDashboardService],
    }).compile();

    service = module.get<TenantDashboardService>(TenantDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

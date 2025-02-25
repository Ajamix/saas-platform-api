import { Test, TestingModule } from '@nestjs/testing';
import { TenantDashboardController } from './tenant-dashboard.controller';
import { TenantDashboardService } from './tenant-dashboard.service';

describe('TenantDashboardController', () => {
  let controller: TenantDashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantDashboardController],
      providers: [TenantDashboardService],
    }).compile();

    controller = module.get<TenantDashboardController>(
      TenantDashboardController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Controller, Get } from '@nestjs/common';
import { JobDepartmentService } from './job-department.service';

@Controller('job-department')
export class JobDepartmentController {
  constructor(private readonly jobDepartmentSerivce: JobDepartmentService) {}
  @Get('list')
  async list() {
    return this.jobDepartmentSerivce.listJobDepartment();
  }
}

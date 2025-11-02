import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      websocket: 'enabled',
    };
  }

  @Get()
  getRoot() {
    return {
      message: 'Scrum Poker API is running',
      version: '1.0.0',
      websocket: 'enabled',
    };
  }
}
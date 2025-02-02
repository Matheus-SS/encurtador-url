import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { NextFunction, Response } from 'express';
import { Counter, Gauge } from 'prom-client';
import { Request } from 'express';

@Injectable()
export class CustomMetricsMiddleware implements NestMiddleware {
  public customDurationGauge: Gauge<string>;
  public customErrorsCounter: Counter<string>;
  public customCounterSignUp: Counter<string>;

  constructor(
    // Deve ser identico ao declarado no AppModule
    @InjectMetric('count') public appCounter: Counter<string>,
    @InjectMetric('gauge') public appGauge: Gauge<string>,
  ) {
    // Customizando os nomes e as mensagens de ajuda  para as metricas
    this.customDurationGauge = new Gauge<string>({
      name: 'app_duration_metrics',
      help: 'app concurrent metrics help',
      labelNames: ['app_method', 'app_origin', 'le'],
    });
    this.customErrorsCounter = new Counter<string>({
      name: 'app_error_metrics',
      help: 'app usage metrics to detect errors',
      labelNames: ['app_method', 'app_origin', 'app_status'],
    });

    this.customCounterSignUp = new Counter<string>({
      name: 'app_http_signup_metrics',
      help: 'app that counter requests to the signup route',
      labelNames: ['app_origin', 'app_status'],
    });
  }
  use(req: Request, res: Response, next: NextFunction) {
    // Incrementa a mesma rota e  metodo mesmo com  status diferente
    this.appCounter.labels(req.method, req.originalUrl).inc();
    this.appGauge.inc();
    const startTime = Date.now();

    res.on('finish', () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.customDurationGauge
        .labels(req.method, req.originalUrl, (duration / 1000).toString())
        .set(duration);

      // Incrementa o contador separados pelos metodos, url e status code
      this.customErrorsCounter
        .labels(req.method, req.originalUrl, res.statusCode.toString())
        .inc();

      if (req.originalUrl === '/api/v1/auth/signup') {
        this.customCounterSignUp
          .labels(req.originalUrl, res.statusCode.toString())
          .inc();
      }
    });

    next();
  }
}

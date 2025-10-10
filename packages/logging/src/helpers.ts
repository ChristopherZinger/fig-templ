import { log } from './logger';

export const logPdfGeneration = (data: {
  generationId: string;
  organizationId?: string;
  templateId?: string;
  userId: string;
  status: 'started' | 'completed' | 'failed';
  duration?: number;
  error?: string;
}) => {
  log.info('pdf_generation', {
    ...data,
    severity: data.status === 'failed' ? 'WARNING' : 'INFO'
  });
};

export const logApiRequest = (data: {
  method: string;
  url: string;
  status?: number;
  duration?: number;
  userId?: string;
}) => {
  log.info('api_request', data);
};

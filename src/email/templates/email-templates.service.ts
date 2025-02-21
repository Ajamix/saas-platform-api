import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class EmailTemplatesService {
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map();
  private readonly templatesDir = join(__dirname, 'views');

  constructor() {
    this.loadTemplates();
    this.registerHelpers();
  }

  private loadTemplates() {
    const templates = {
      'user-registration': this.loadTemplate('user-registration.hbs'),
      'password-reset': this.loadTemplate('password-reset.hbs'),
      'subscription-change': this.loadTemplate('subscription-change.hbs'),
      'payment-reminder': this.loadTemplate('payment-reminder.hbs'),
      'system-update': this.loadTemplate('system-update.hbs'),
      'role-change': this.loadTemplate('role-change.hbs'),
      'team-update': this.loadTemplate('team-update.hbs'),
    };

    Object.entries(templates).forEach(([name, template]) => {
      this.templates.set(name, Handlebars.compile(template));
    });
  }

  private loadTemplate(filename: string): string {
    return readFileSync(join(this.templatesDir, filename), 'utf-8');
  }

  private registerHelpers() {
    Handlebars.registerHelper('formatDate', function(date: Date) {
      return date.toLocaleDateString();
    });

    Handlebars.registerHelper('formatCurrency', function(amount: number) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    });
  }

  renderTemplate(templateKey: string, context: Record<string, any>): string {
    const template = this.templates.get(templateKey);
    if (!template) {
      throw new Error(`Template ${templateKey} not found`);
    }

    const baseContext = {
      year: new Date().getFullYear(),
      ...context,
    };

    return template(baseContext);
  }
} 
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

@Injectable()
export class EmailTemplatesService implements OnModuleInit {
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map();
  private readonly templatesDir: string;

  constructor() {
    // Use src in development and dist in production
    const baseDir = process.env.NODE_ENV === 'production' ? 'dist' : 'src';
    this.templatesDir = join(process.cwd(), 'backend', baseDir, 'email', 'templates', 'views');
  }

  async onModuleInit() {
    this.loadTemplates();
    this.registerHelpers();
  }

  private loadTemplates() {
    const templateFiles = {
      'user-registration': 'user-registration.hbs',
      'password-reset': 'password-reset.hbs',
      'subscription-change': 'subscription-change.hbs',
      'payment-reminder': 'payment-reminder.hbs',
      'system-update': 'system-update.hbs',
      'role-change': 'role-change.hbs',
      'team-update': 'team-update.hbs',
    };

    for (const [name, file] of Object.entries(templateFiles)) {
      try {
        const templatePath = join(this.templatesDir, file);
        if (existsSync(templatePath)) {
          const template = readFileSync(templatePath, 'utf-8');
          this.templates.set(name, Handlebars.compile(template));
        } else {
          console.warn(`Template file not found: ${templatePath}`);
          // Set a default template as fallback
          this.templates.set(name, Handlebars.compile(this.getDefaultTemplate(name)));
        }
      } catch (error) {
        console.error(`Error loading template ${name}:`, error);
        // Set a default template as fallback
        this.templates.set(name, Handlebars.compile(this.getDefaultTemplate(name)));
      }
    }
  }

  private registerHelpers() {
    Handlebars.registerHelper('formatDate', function(date: Date) {
      return date ? date.toLocaleDateString() : '';
    });

    Handlebars.registerHelper('formatCurrency', function(amount: number) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    });
  }

  private getDefaultTemplate(type: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
    .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>{{title}}</h2>
    </div>
    <div class="content">
      <p>Hello {{firstName}},</p>
      <p>{{message}}</p>
    </div>
    <div class="footer">
      <p>&copy; {{year}} {{companyName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
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
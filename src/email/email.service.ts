import { Injectable, OnModuleInit } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { SettingsProvider } from '../settings/settings.provider';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { EmailTemplatesService } from './templates/email-templates.service';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporters: Map<string, Transporter> = new Map();
  private defaultTransporter: Transporter;

  constructor(private readonly settingsProvider: SettingsProvider,
              private readonly emailTemplatesService: EmailTemplatesService) {}

  async onModuleInit() {
    // Initialize default transporter with global settings
    await this.initializeDefaultTransporter();
  }

  private async initializeDefaultTransporter() {
    const settings = await this.settingsProvider.getEffectiveSettings();
    const smtpConfig = settings.smtp;

    this.defaultTransporter = createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    });
  }

  private async getTransporter(tenantId?: string): Promise<Transporter> {
    if (!tenantId) {
      return this.defaultTransporter;
    }

    if (!this.transporters.has(tenantId)) {
      const settings = await this.settingsProvider.getEffectiveSettings(tenantId);
      const smtpConfig = settings.smtp;

      // If tenant uses custom SMTP, create a new transporter
      if (smtpConfig.useCustomSmtp) {
        const transporter = createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          auth: {
            user: smtpConfig.user,
            pass: smtpConfig.password,
          },
        });
        this.transporters.set(tenantId, transporter);
      } else {
        // If tenant uses global SMTP, use default transporter
        this.transporters.set(tenantId, this.defaultTransporter);
      }
    }

    return this.transporters.get(tenantId)!;
  }

  async sendEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    tenantId?: string;
  }) {
    const { to, subject, html, from, tenantId } = options;
    const settings = await this.settingsProvider.getEffectiveSettings(tenantId);
    const transporter = await this.getTransporter(tenantId);

    return transporter.sendMail({
      from: from || settings.smtp.from,
      to,
      subject,
      html,
    });
  }

  async sendTemplatedEmail(options: {
    to: string | string[];
    templateKey: string;
    context: Record<string, any>;
    tenantId?: string;
  }) {
    const { to, templateKey, context, tenantId } = options;
    const settings = await this.settingsProvider.getEffectiveSettings(tenantId);
    
    // Get template based on settings
    const template = tenantId && settings.notifications.customEmailTemplates?.[templateKey]
      ? settings.notifications.customEmailTemplates[templateKey]
      : settings.notifications.defaultEmailTemplate;

    // TODO: Implement template rendering with context
    const html = template; // Replace with actual template rendering

    return this.sendEmail({
      to,
      subject: templateKey, // TODO: Get subject from template metadata
      html,
      tenantId,
    });
  }

  clearTransporters(tenantId?: string) {
    if (tenantId) {
      this.transporters.delete(tenantId);
    } else {
      this.transporters.clear();
      this.initializeDefaultTransporter();
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;
    const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;    const context = {
      companyName: 'Your Company',
      firstName: 'User', // Replace with actual user's first name
      verificationRequired: true,
      verificationUrl: verificationLink,
      supportEmail: 'support@yourcompany.com',
      year: new Date().getFullYear(),
      email: to,
    };

    const html = this.emailTemplatesService.renderTemplate('user-registration', context);

    const subject = 'Email Verification';

    await this.sendEmail({
      to,
      subject,
      html,
    });
  }
} 
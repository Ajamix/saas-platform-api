import { Injectable, OnModuleInit } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { SettingsProvider } from '../settings/settings.provider';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporters: Map<string, Transporter> = new Map();
  private defaultTransporter: Transporter;

  constructor(private readonly settingsProvider: SettingsProvider) {}

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
} 
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SettingsProvider } from '../settings/settings.provider';
import Stripe from 'stripe';
import { PayPalClient } from '@paypal/checkout-server-sdk';

@Injectable()
export class PaymentService implements OnModuleInit {
  private stripeClient: Stripe;
  private paypalClient: PayPalClient;

  constructor(private readonly settingsProvider: SettingsProvider) {}

  async onModuleInit() {
    await this.initializePaymentClients();
  }

  private async initializePaymentClients() {
    const settings = await this.settingsProvider.getEffectiveSettings();
    const paymentSettings = settings.payment;

    if (paymentSettings.stripeEnabled) {
      this.stripeClient = new Stripe(paymentSettings.stripeSecretKey, {
        
      });
    }

    if (paymentSettings.paypalEnabled) {
      // Initialize PayPal client
      // TODO: Implement PayPal client initialization
    }
  }

  async createSubscription(options: {
    customerId: string;
    priceId: string;
    paymentMethod?: 'stripe' | 'paypal';
  }) {
    const { customerId, priceId, paymentMethod = 'stripe' } = options;
    const settings = await this.settingsProvider.getEffectiveSettings();

    if (paymentMethod === 'stripe' && settings.payment.stripeEnabled) {
      return this.createStripeSubscription(customerId, priceId);
    } else if (paymentMethod === 'paypal' && settings.payment.paypalEnabled) {
      return this.createPayPalSubscription(customerId, priceId);
    }

    throw new Error(`Payment method ${paymentMethod} is not enabled`);
  }

  private async createStripeSubscription(customerId: string, priceId: string) {
    return this.stripeClient.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  private async createPayPalSubscription(customerId: string, priceId: string) {
    // TODO: Implement PayPal subscription creation
    throw new Error('PayPal subscriptions not implemented yet');
  }

  async cancelSubscription(options: {
    subscriptionId: string;
    paymentMethod: 'stripe' | 'paypal';
  }) {
    const { subscriptionId, paymentMethod } = options;
    const settings = await this.settingsProvider.getEffectiveSettings();

    if (paymentMethod === 'stripe' && settings.payment.stripeEnabled) {
      return this.stripeClient.subscriptions.cancel(subscriptionId);
    } else if (paymentMethod === 'paypal' && settings.payment.paypalEnabled) {
      // TODO: Implement PayPal subscription cancellation
      throw new Error('PayPal subscription cancellation not implemented yet');
    }

    throw new Error(`Payment method ${paymentMethod} is not enabled`);
  }

  async createCustomer(options: {
    email: string;
    name?: string;
    paymentMethod: 'stripe' | 'paypal';
  }) {
    const { email, name, paymentMethod } = options;
    const settings = await this.settingsProvider.getEffectiveSettings();

    if (paymentMethod === 'stripe' && settings.payment.stripeEnabled) {
      return this.stripeClient.customers.create({
        email,
        name,
      });
    } else if (paymentMethod === 'paypal' && settings.payment.paypalEnabled) {
      // TODO: Implement PayPal customer creation
      throw new Error('PayPal customer creation not implemented yet');
    }

    throw new Error(`Payment method ${paymentMethod} is not enabled`);
  }

  async handleWebhook(options: {
    body: any;
    signature: string;
    paymentMethod: 'stripe' | 'paypal';
  }) {
    const { body, signature, paymentMethod } = options;
    const settings = await this.settingsProvider.getEffectiveSettings();

    if (paymentMethod === 'stripe' && settings.payment.stripeEnabled) {
      const event = this.stripeClient.webhooks.constructEvent(
        body,
        signature,
        settings.payment.stripeWebhookSecret
      );
      return this.handleStripeWebhook(event);
    } else if (paymentMethod === 'paypal' && settings.payment.paypalEnabled) {
      // TODO: Implement PayPal webhook handling
      throw new Error('PayPal webhook handling not implemented yet');
    }

    throw new Error(`Payment method ${paymentMethod} is not enabled`);
  }

  private async handleStripeWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Handle subscription events
        break;
      case 'invoice.paid':
      case 'invoice.payment_failed':
        // Handle invoice events
        break;
      // Add more event handlers as needed
    }
  }
} 
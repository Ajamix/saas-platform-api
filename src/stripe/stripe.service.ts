import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import { GlobalSetting } from 'src/settings/global-settings/entities/global-setting.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { SubscriptionPlan } from 'src/subscriptions/entities/subscription-plan.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(GlobalSetting)
    private globalSettingRepository: Repository<GlobalSetting>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.initializeStripe();
  }

  private async initializeStripe() {
    const secretKey = await this.getStripeSecretKey();
    this.stripe = new Stripe(secretKey);
  }

  private async getStripeSecretKey(): Promise<string> {
    const settings = await this.globalSettingRepository.find();
    const setting = settings[0];
    if (
      !setting ||
      !setting.paymentSettings ||
      !setting.paymentSettings.stripeSecretKey
    ) {
      throw new Error('Stripe secret key not found in global settings.');
    }
    return setting.paymentSettings.stripeSecretKey;
  }
  async cancelStripeSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }
  async createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }
  async getStripeSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }
  async constructEvent(
    payload: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    const webhookSecret = await this.getStripeWebhookSecret();
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  private async getStripeWebhookSecret(): Promise<string> {
    const settings = await this.globalSettingRepository.find();
    const setting = settings[0];
    if (
      !setting ||
      !setting.paymentSettings ||
      !setting.paymentSettings.stripeWebhookSecret
    ) {
      throw new Error('Stripe webhook secret not found in global settings.');
    }
    return setting.paymentSettings.stripeWebhookSecret;
  }

  create(createStripeDto: CreateStripeDto) {
    return 'This action adds a new stripe';
  }

  findAll() {
    return `This action returns all stripe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stripe`;
  }

  update(id: number, updateStripeDto: UpdateStripeDto) {
    return `This action updates a #${id} stripe`;
  }

  remove(id: number) {
    return `This action removes a #${id} stripe`;
  }
  async getSessionLineItems(sessionId: string) {
    return this.stripe.checkout.sessions.listLineItems(sessionId);
  }

  async updateSubscriptionStatus(
    customerEmail: string,
    stripeProductId: string,
    subscriptionId: string,
  ): Promise<void> {
    // Find the subscription plan associated with the Stripe subscription ID
    console.log(stripeProductId);
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { stripeProductId: stripeProductId },
    });
    const user = await this.userRepository.findOne({
      where: { email: customerEmail },
      relations: ['tenant'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    // Create a new Subscription entity

    // Create a new Subscription entity
    const subscription = this.subscriptionRepository.create({
      tenantId: user?.tenant.id, // Assuming you have a way to determine the tenant
      planId: plan.id,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: calculateCurrentPeriodEnd(plan.interval),
      stripeCustomerId: customerEmail,
      stripeSubscriptionId: subscriptionId,
      priceAtCreation: plan.price, // Set the price at the time of creation
    });

    await this.subscriptionRepository.save(subscription);

    await this.subscriptionRepository.save(subscription);
  }
}
function calculateCurrentPeriodEnd(interval: string): Date {
  const currentDate = new Date();
  if (interval === 'monthly') {
    return new Date(currentDate.setMonth(currentDate.getMonth() + 1));
  } else if (interval === 'yearly') {
    return new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
  } else {
    throw new Error('Unsupported interval type');
  }
}

export const GlobalSettingsSchema = {
  example: {
    smtpSettings: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: true,
      user: 'user@example.com',
      password: 'password123',
      from: 'noreply@example.com',
      fromName: 'My Company',
    },
    notificationSettings: {
      enableEmailNotifications: true,
      enablePushNotifications: true,
      enableInAppNotifications: true,
      defaultEmailTemplate: '<html>...</html>',
      notificationTypes: {
        userRegistration: true,
        passwordReset: true,
        subscriptionChanges: true,
        paymentReminders: true,
        systemUpdates: true,
      },
    },
    paymentSettings: {
      stripeEnabled: true,
      stripePublicKey: 'pk_test_123',
      stripeSecretKey: 'sk_test_123',
      paypalEnabled: true,
      paypalClientId: 'client_id_123',
      paypalClientSecret: 'client_secret_123',
      currency: 'USD',
    },
    systemSettings: {
      maintenanceMode: false,
      maintenanceMessage: 'System under maintenance',
      allowUserRegistration: true,
      requireEmailVerification: true,
      defaultUserRole: 'Admin',
      passwordPolicy: {
        minLength: 8,
        requireNumbers: true,
        requireSpecialChars: true,
        requireUppercase: true,
        requireLowercase: true,
      },
      sessionTimeout: 15,
    },
  },
};

export const TenantSettingsSchema = {
  example: {
    customSmtp: {
      enabled: true,
      ...GlobalSettingsSchema.example.smtpSettings,
    },
    customNotifications: {
      enabled: true,
      templates: {
        welcome: '<html>Welcome template</html>',
        passwordReset: '<html>Password reset template</html>',
      },
    },
    branding: {
      logo: 'https://example.com/logo.png',
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
      },
      favicon: 'https://example.com/favicon.ico',
    },
    features: {
      chat: true,
      fileSharing: true,
      videoConference: false,
    },
    limits: {
      maxUsers: 10,
      storageLimit: 5120, // 5GB in MB
      monthlyBandwidth: 102400, // 100GB in MB
    },
  },
};

import twilio from 'twilio';
import Settings from '@/models/Settings';
import dbConnect from './db';

let twilioClient: twilio.Twilio | null = null;
let lastInitTime = 0;
const INIT_COOLDOWN = 60000; // 1 minute cooldown

export async function initTwilioClient() {
  try {
    // Only reinitialize if it's been more than the cooldown period
    const now = Date.now();
    if (twilioClient && now - lastInitTime < INIT_COOLDOWN) {
      return twilioClient;
    }
    
    await dbConnect();
    const settings = await Settings.findOne();
    
    if (!settings?.whatsappEnabled || 
        !settings.twilioAccountSid || 
        !settings.twilioAuthToken || 
        !settings.twilioPhoneNumber) {
      return null;
    }

    twilioClient = twilio(settings.twilioAccountSid, settings.twilioAuthToken);
    lastInitTime = now;
    return twilioClient;
  } catch (error) {
    console.error('Error initializing Twilio client:', error);
    return null;
  }
}

export async function sendWhatsAppNotification(to: string, message: string) {
  try {
    if (!to || !to.trim()) {
      console.log('No WhatsApp number provided, skipping notification');
      return;
    }
    
    await dbConnect();
    const settings = await Settings.findOne();
    if (!settings?.whatsappEnabled) {
      console.log('WhatsApp notifications are disabled');
      return;
    }

    const client = await initTwilioClient();
    if (!client) {
      console.log('Failed to initialize Twilio client');
      return;
    }

    // Format the phone number correctly
    let formattedNumber = to.replace(/\D/g, '');
    if (!formattedNumber.startsWith('+')) {
      // Add Brazil country code if not present
      if (!formattedNumber.startsWith('55')) {
        formattedNumber = '55' + formattedNumber;
      }
      formattedNumber = '+' + formattedNumber;
    }

    console.log(`Sending WhatsApp notification to ${formattedNumber}`);
    
    await client.messages.create({
      body: message,
      from: `whatsapp:${settings.twilioPhoneNumber}`,
      to: `whatsapp:${formattedNumber}`
    });
    
    console.log('WhatsApp notification sent successfully');
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
  }
}
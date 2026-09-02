import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

export class PaymentService {
  /**
   * Generates MD5 signature for PayHere payment gateway integration
   * Hash format: md5(merchant_id + order_id + amount + currency + md5(merchant_secret))
   */
  static generatePayHereHash(orderId: string, amount: number, currency = 'LKR'): string {
    const merchantId = process.env.PAYMENT_GATEWAY_ID || '1211111';
    const merchantSecret = process.env.PAYMENT_GATEWAY_SECRET || 'sample_secret_key';

    const formattedAmount = amount.toFixed(2);
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;

    return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
  }

  static getPayHereParams(order: { id: string; orderNumber: string; totalAmount: number }, user: { name: string; email: string; phone?: string | null }, address: { addressLine: string; locationName?: string }) {
    const merchantId = process.env.PAYMENT_GATEWAY_ID || '1211111';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const hash = this.generatePayHereHash(order.orderNumber, Number(order.totalAmount));

    return {
      sandbox: true,
      merchant_id: merchantId,
      return_url: `${appUrl}/orders/${order.id}?payment=success`,
      cancel_url: `${appUrl}/orders/${order.id}?payment=cancelled`,
      notify_url: `${appUrl}/api/payments/payhere/notify`,
      order_id: order.orderNumber,
      items: `OoruMart Order ${order.orderNumber}`,
      amount: Number(order.totalAmount).toFixed(2),
      currency: 'LKR',
      hash,
      first_name: user.name.split(' ')[0] || 'Customer',
      last_name: user.name.split(' ').slice(1).join(' ') || 'User',
      email: user.email,
      phone: user.phone || '0770000000',
      address: address.addressLine,
      city: address.locationName || 'Colombo',
      country: 'Sri Lanka',
    };
  }

  static async verifyAndProcessPayHereIPN(payload: {
    merchant_id: string;
    order_id: string;
    payhere_amount: string;
    payhere_currency: string;
    status_code: string;
    md5sig: string;
    payment_id?: string;
  }): Promise<boolean> {
    const merchantSecret = process.env.PAYMENT_GATEWAY_SECRET || 'sample_secret_key';
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const localHash = crypto
      .createHash('md5')
      .update(`${payload.merchant_id}${payload.order_id}${payload.payhere_amount}${payload.payhere_currency}${payload.status_code}${hashedSecret}`)
      .digest('hex')
      .toUpperCase();

    if (localHash !== payload.md5sig) {
      return false;
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: payload.order_id },
    });

    if (!order) return false;

    // Status 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Chargedback
    if (payload.status_code === '2') {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'PAID' },
        }),
        prisma.payment.updateMany({
          where: { orderId: order.id },
          data: {
            status: 'PAID',
            transactionId: payload.payment_id || `PAYHERE-${Date.now()}`,
            paidAt: new Date(),
          },
        }),
      ]);
      return true;
    }

    return false;
  }
}

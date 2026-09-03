import { Injectable, NgZone } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';

export interface RazorpayNativePlugin {
  open(options: any): Promise<{
    success: boolean;
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }>;
}

const RazorpayPlugin = registerPlugin<RazorpayNativePlugin>('RazorpayPlugin');
declare var Razorpay: any;

export interface RazorpayResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

@Injectable({
  providedIn: 'root'
})
export class RazorpayNativeService {
  constructor(private ngZone: NgZone) {}

  open(options: any): Promise<RazorpayResult> {
    return new Promise((resolve, reject) => {
      if (Capacitor.isNativePlatform()) {
        // Native Android Execution via Razorpay Android SDK
        RazorpayPlugin.open(options)
          .then((res) => {
            this.ngZone.run(() => {
              resolve({
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_order_id: res.razorpay_order_id,
                razorpay_signature: res.razorpay_signature
              });
            });
          })
          .catch((err) => {
            this.ngZone.run(() => {
              reject(err);
            });
          });
      } else {
        // Web / PC browser fallback using checkout.js
        if (typeof Razorpay === 'undefined') {
          reject(new Error('Razorpay SDK not loaded on Web.'));
          return;
        }

        const webOptions = {
          ...options,
          handler: (response: any) => {
            this.ngZone.run(() => {
              resolve({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              });
            });
          },
          modal: {
            ondismiss: () => {
              this.ngZone.run(() => {
                reject(new Error('Payment modal dismissed by user.'));
              });
            }
          }
        };

        try {
          const rzp = new Razorpay(webOptions);
          rzp.on('payment.failed', (resp: any) => {
            this.ngZone.run(() => {
              reject(resp.error || new Error('Payment failed.'));
            });
          });
          rzp.open();
        } catch (e) {
          reject(e);
        }
      }
    });
  }
}

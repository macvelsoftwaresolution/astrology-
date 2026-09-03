package com.aruthra.astrology;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.razorpay.PaymentData;
import com.razorpay.PaymentResultWithDataListener;

public class MainActivity extends BridgeActivity implements PaymentResultWithDataListener {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RazorpayPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onPaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
        RazorpayPlugin.handlePaymentSuccess(razorpayPaymentId, paymentData);
    }

    @Override
    public void onPaymentError(int code, String response, PaymentData paymentData) {
        RazorpayPlugin.handlePaymentError(code, response, paymentData);
    }
}

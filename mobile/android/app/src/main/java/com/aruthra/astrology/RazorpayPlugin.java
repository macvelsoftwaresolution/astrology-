package com.aruthra.astrology;

import android.app.Activity;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.razorpay.Checkout;
import com.razorpay.PaymentData;
import com.razorpay.PaymentResultWithDataListener;
import org.json.JSONObject;

@CapacitorPlugin(name = "RazorpayPlugin")
public class RazorpayPlugin extends Plugin implements PaymentResultWithDataListener {
    private static final String TAG = "RazorpayPlugin";
    private static RazorpayPlugin instance;
    private PluginCall savedCall;

    @Override
    public void load() {
        super.load();
        instance = this;
        try {
            Checkout.preload(getContext());
        } catch (Exception e) {
            Log.e(TAG, "Error in Checkout.preload", e);
        }
    }

    public static RazorpayPlugin getInstance() {
        return instance;
    }

    @PluginMethod
    public void open(PluginCall call) {
        this.savedCall = call;
        instance = this;
        call.setKeepAlive(true);

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        activity.runOnUiThread(() -> {
            try {
                JSObject data = call.getData();
                Checkout checkout = new Checkout();
                String key = data.optString("key");
                if (key != null && !key.isEmpty()) {
                    checkout.setKeyID(key);
                }
                JSONObject options = new JSONObject(data.toString());
                checkout.open(activity, options);
            } catch (Exception e) {
                Log.e(TAG, "Error opening Razorpay checkout: " + e.getMessage(), e);
                if (savedCall != null) {
                    savedCall.reject("Error opening Razorpay: " + e.getMessage());
                    savedCall = null;
                }
            }
        });
    }

    @Override
    public void onPaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
        Log.d(TAG, "onPaymentSuccess: " + razorpayPaymentId);
        if (savedCall != null) {
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("razorpay_payment_id", razorpayPaymentId != null ? razorpayPaymentId : "");
            ret.put("razorpay_order_id", (paymentData != null && paymentData.getOrderId() != null) ? paymentData.getOrderId() : "");
            ret.put("razorpay_signature", (paymentData != null && paymentData.getSignature() != null) ? paymentData.getSignature() : "");
            savedCall.resolve(ret);
            savedCall = null;
        }
    }

    @Override
    public void onPaymentError(int code, String response, PaymentData paymentData) {
        Log.d(TAG, "onPaymentError: code=" + code + ", response=" + response);
        if (savedCall != null) {
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("code", code);
            ret.put("message", response != null ? response : "Payment Cancelled");
            if (paymentData != null && paymentData.getOrderId() != null) {
                ret.put("razorpay_order_id", paymentData.getOrderId());
            }
            savedCall.reject(response != null ? response : "Payment Cancelled", String.valueOf(code), ret);
            savedCall = null;
        }
    }

    public static void handlePaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
        if (instance != null) {
            instance.onPaymentSuccess(razorpayPaymentId, paymentData);
        }
    }

    public static void handlePaymentError(int code, String response, PaymentData paymentData) {
        if (instance != null) {
            instance.onPaymentError(code, response, paymentData);
        }
    }
}

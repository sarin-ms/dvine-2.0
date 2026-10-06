# DVINE Frontend Integration Guide

This guide is for the frontend engineer building the DVINE registration and payment flow. It details all screen states, TypeScript interfaces, form validations, API calls, and Razorpay modal handling.

---

## 1. Quick Setup & Environment

### Base URLs

- **Local Dev:** `http://127.0.0.1:8787`
- **Production:** `https://your-production-domain.com`

### Required External Scripts

Add Razorpay Checkout SDK to `index.html`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## 2. TypeScript Definitions (Copy-Paste Ready)

```typescript
// --- API Common ---
export interface ApiErrorResponse {
  error: string;
  message: string;
}

// --- Seat Availability ---
export interface SeatStatusResponse {
  total: number;
  registered: number;
  locked: number;
  available: number;
}

// --- OTP Flow ---
export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string; // Exactly 6 digits
}

// --- Registration ---
export interface MemberData {
  firstName: string;
  lastName: string;
  gender: string; // e.g. "Male" | "Female" | "Other"
  email: string;
  phone: string; // 10 digits, e.g. "9876543210"
  collegeName: string;
  yearOfStudy: string; // e.g. "1st Year", "2nd Year", "3rd Year", "4th Year"
  department: string;
}

export interface RegisterRequest {
  teamName: string;
  member1: MemberData; // Lead (email must match verified OTP)
  member2: MemberData;
}

export interface RegisterSuccessResponse {
  teamId: string;
  amount: number; // 600
  currency: string; // "INR"
  orderId: string; // Razorpay order ID (e.g. "order_xyz123")
  keyId: string; // Razorpay public key ID
  lockExpiresAt: number; // Unix timestamp (seconds)
}

// --- Payment Verification ---
export interface PaymentVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerifyResponse {
  ok: true;
  status: "paid";
}

// --- Cancellation & Status Polling ---
export interface CancelRequest {
  teamId: string;
}

export interface CancelResponse {
  cancelled: boolean;
  reason?: "ALREADY_PAID" | "PAYMENT_IN_PROGRESS" | "CHECK_FAILED";
}

export interface TeamStatusResponse {
  status: "pending" | "paid" | "expired";
  lockExpiresAt?: number;
}
```

---

## 3. UI States & Step-by-Step Flow

```
[Screen 1: Landing & Seats]
          │
          ▼
[Screen 2: Member 1 OTP Verification]
          │ (OTP verified in KV for 15 mins)
          ▼
[Screen 3: Team & Member Details Form]
          │ (POST /register -> seat locked for 15 mins)
          ▼
[Screen 4: Razorpay Checkout Modal]
    ┌─────┴────────────────────────┐
    ▼                              ▼
(Success)                  (Modal Dismissed)
    │                              │
POST /payment/verify        POST /register/cancel
    │                              ├─ cancelled: true  -> Back to Form / Seats
    ▼                              └─ PAYMENT_IN_PROGRESS -> Poll /register/status/:teamId
[Screen 5: Success Ticket]                                           │
                                                                     ▼
                                                          [Screen 5: Success Ticket]
```

---

### Step 1: Check Seat Availability

Fetch seat count on page load and before letting the user begin.

- **Endpoint:** `GET /register/get-av-seats`
- **Example Response:**
  ```json
  { "total": 30, "registered": 12, "locked": 2, "available": 16 }
  ```
- **UI Logic:**
  - If `available === 0`: Show **"Registrations are Sold Out"** banner and disable starting registration.
  - Display badge: `"16 seats remaining"` (or `available / total`).

---

### Step 2: Member 1 Email OTP Verification

The lead member must verify their email before form submission.

1. **User enters Member 1 Email.**
2. **Send OTP:**
   - **Endpoint:** `POST /register/otp/send`
   - **Body:** `{ "email": "lead@example.com" }`
   - **Frontend UI Behavior:**
     - On `200`: Show 6-digit OTP input. Start a **60-second countdown timer** for the "Resend OTP" button.
     - On `409` (`EMAIL_TAKEN`): Show error _"This email is already registered."_
     - On `429` (`COOLDOWN`): Show error _"Please wait 1 minute before resending."_
3. **Verify OTP:**
   - **Endpoint:** `POST /register/otp/verify`
   - **Body:** `{ "email": "lead@example.com", "code": "123456" }`
   - **Frontend UI Behavior:**
     - On `200`: Mark email as verified (e.g. green checkmark). Disable email input so user cannot edit it. Unlock Step 3.
     - On `400` (`INVALID_CODE`): Show _"Incorrect OTP code."_
     - On `400` (`CODE_EXPIRED`): Show _"OTP expired. Please request a new one."_
     - On `429` (`TOO_MANY_ATTEMPTS`): Show _"Too many incorrect attempts. Please request a new code."_

---

### Step 3: Registration Form & Validations

Once Member 1's email is verified, display the full registration form.

#### Client-side Validations

| Field                   | Rule                                                                    |
| ----------------------- | ----------------------------------------------------------------------- |
| `teamName`              | Required, trimmed, max 80 chars                                         |
| `member1.email`         | Read-only, locked to verified email                                     |
| `member2.email`         | Valid email, **must be different** from `member1.email`                 |
| `phone`                 | Indian 10-digit format: `^[6-9]\d{9}$` (strip leading `+91` or spaces)  |
| `firstName`, `lastName` | Required, trimmed, max 100 chars                                        |
| `collegeName`           | Required, trimmed, max 150 chars                                        |
| `department`            | Required, trimmed, max 100 chars                                        |
| `gender`                | Dropdown (`Male`, `Female`, `Other`)                                    |
| `yearOfStudy`           | Dropdown or text (e.g., `1st Year`, `2nd Year`, `3rd Year`, `4th Year`) |

#### Submit Registration

- **Endpoint:** `POST /register`
- **Body:** See `RegisterRequest` in definitions above.
- **Handling Responses:**
  - **`201 Created`**: Returns `{ teamId, amount, currency, orderId, keyId, lockExpiresAt }`.
    - Immediately proceed to **Step 4 (Launch Razorpay)**.
    - Start a 15-minute countdown timer matching `lockExpiresAt`.
  - **`403 Forbidden` (`EMAIL_NOT_VERIFIED`)**: Show _"Please verify your email before submitting."_
  - **`409 Conflict`**:
    - `SOLD_OUT`: _"Registrations just filled up. Seats are no longer available."_
    - `TEAM_NAME_TAKEN`: _"Team name already taken. Please choose another."_
    - `EMAIL_TAKEN`: _"One of these emails is already registered."_
  - **`502 Bad Gateway` (`PAYMENT_INIT_FAILED`)**: _"Could not initialize payment gateway. Please retry."_

---

### Step 4: Razorpay Checkout Integration

Use the data returned from `POST /register` to open Razorpay Checkout:

```javascript
const options = {
  key: registerData.keyId,
  order_id: registerData.orderId,
  amount: registerData.amount * 100, // Amount in paise (60000)
  currency: registerData.currency, // "INR"
  name: "DVINE",
  description: `Registration for team: ${formData.teamName}`,
  prefill: {
    name: `${formData.member1.firstName} ${formData.member1.lastName}`,
    email: formData.member1.email,
    contact: formData.member1.phone,
  },
  theme: {
    color: "#6366f1", // Adjust to match brand theme
  },

  // 1. Success Handler (Payment completed in modal)
  handler: async function (response) {
    try {
      // Call backend to verify signature & mark team 'paid'
      const verifyRes = await fetch("http://127.0.0.1:8787/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.status === "paid") {
        showSuccessScreen(registerData.teamId);
      } else if (verifyRes.status === 410) {
        showError(
          "Your 15-minute reservation expired. Any deducted amount will be refunded automatically.",
        );
      } else {
        showError(verifyData.message || "Payment verification failed.");
      }
    } catch (err) {
      showError(
        "Network error verifying payment. Please wait, our system is confirming your payment.",
      );
    }
  },

  // 2. Dismiss Handler (User closed modal or exited)
  modal: {
    ondismiss: async function () {
      try {
        const cancelRes = await fetch("http://127.0.0.1:8787/register/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId: registerData.teamId }),
        });

        const cancelData = await cancelRes.json();

        // Case A: Payment was in-flight (e.g., user approved UPI app while closing web tab)
        if (cancelData.reason === "PAYMENT_IN_PROGRESS") {
          showPendingProcessingScreen(registerData.teamId);
          return;
        }

        // Case B: Clean cancel -> Seat was freed
        showInfo(
          "Payment cancelled. Your temporary seat reservation has been released.",
        );
      } catch (e) {
        console.error("Cancel call error", e);
      }
    },
  },
};

const rzp = new window.Razorpay(options);
rzp.open();
```

---

### Step 5: Handling In-Flight Payments (Polling)

When `POST /register/cancel` returns `reason: "PAYMENT_IN_PROGRESS"`:

1. Show a loading screen: _"Confirming your payment status with bank... Please do not close this window."_
2. Poll `GET /register/status/:teamId` every 3 seconds for up to 90–120 seconds:

```typescript
async function pollPaymentStatus(teamId: string) {
  const maxAttempts = 30; // 30 * 3s = 90 seconds
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;
    try {
      const res = await fetch(
        `http://127.0.0.1:8787/register/status/${teamId}`,
      );
      const data: TeamStatusResponse = await res.json();

      if (data.status === "paid") {
        clearInterval(interval);
        showSuccessScreen(teamId);
      } else if (data.status === "expired" || attempts >= maxAttempts) {
        clearInterval(interval);
        showError(
          "Payment timed out or failed. If money was debited, it will be refunded automatically.",
        );
      }
    } catch (err) {
      console.error("Polling error", err);
    }
  }, 3000);
}
```

---

## 4. Complete Error Codes Reference

All error responses from the API return HTTP status >= 400 with:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable explanation."
}
```

| HTTP Status | Error Code            | Recommended User-Facing Notification                                                        |
| ----------- | --------------------- | ------------------------------------------------------------------------------------------- |
| `400`       | `INVALID_CODE`        | "Invalid OTP code. Please check and re-enter."                                              |
| `400`       | `CODE_EXPIRED`        | "Verification code has expired. Request a new one."                                         |
| `400`       | `BAD_SIGNATURE`       | "Payment security verification failed. Please contact support."                             |
| `403`       | `EMAIL_NOT_VERIFIED`  | "Please verify Member 1's email before registering."                                        |
| `409`       | `SOLD_OUT`            | "Registrations are now full. No seats remaining."                                           |
| `409`       | `TEAM_NAME_TAKEN`     | "This team name is already taken. Please choose a different name."                          |
| `409`       | `EMAIL_TAKEN`         | "One of the provided email addresses is already registered."                                |
| `410`       | `LOCK_EXPIRED`        | "Your 15-minute seat reservation expired. Deducted payment will be automatically refunded." |
| `429`       | `COOLDOWN`            | "Please wait 60 seconds before requesting another verification code."                       |
| `429`       | `TOO_MANY_ATTEMPTS`   | "Maximum OTP attempts exceeded. Please request a new code."                                 |
| `502`       | `EMAIL_FAILED`        | "Unable to send verification email. Please check the address or try again."                 |
| `502`       | `PAYMENT_INIT_FAILED` | "Could not connect to payment gateway. Please try again."                                   |

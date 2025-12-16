
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export const stripeService = {
    async startCheckout(priceId: string, userId: string, userEmail: string) {
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    userId,
                    userEmail,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const { url } = await response.json();

            // Redirect to Stripe Checkout
            if (url) {
                window.location.href = url;
            }

        } catch (error) {
            console.error("Stripe Checkout Error:", error);
            alert("Error initiating checkout. Check console.");
        }
    }
};

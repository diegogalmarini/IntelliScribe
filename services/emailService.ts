
interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html }),
        });

        if (!response.ok) {
            throw new Error('Failed to send email');
        }

        return await response.json();
    } catch (error) {
        console.error('Email service error:', error);
        return null;
    }
};

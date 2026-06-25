import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY || 're_dummyKeyForBuildTime');
  try {
    const { name, email, subject, message } = await request.json();

    // Basic Validation
    if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const emailSubject = `[BudgetEV Query] ${subject || 'New Query'}`;
    const emailBody = `New BudgetEV Query

Name: ${name}
Email: ${email}
Subject: ${subject || 'N/A'}

Message:
${message}`;

    const data = await resend.emails.send({
      from: 'BudgetEV Support <onboarding@resend.dev>',
      to: [process.env.CONTACT_EMAIL || 'mouliksharma618@gmail.com'],
      subject: emailSubject,
      text: emailBody,
    });

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

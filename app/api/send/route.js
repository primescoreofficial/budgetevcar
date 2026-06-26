import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Error parsing JSON body:', e.message);
      return NextResponse.json(
        { error: 'Invalid JSON request.' },
        { status: 400 }
      );
    }

    const { name, email, query } = body;

    // Strict Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      console.error('Validation Error: "name" field is missing or empty.');
      return NextResponse.json(
        { error: 'Name is required.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      console.error('Validation Error: "email" field is missing or empty.');
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.error('Validation Error: Invalid email format.');
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    if (!query || typeof query !== 'string' || !query.trim()) {
      console.error('Validation Error: "query" field is missing or empty.');
      return NextResponse.json(
        { error: 'Query is required.' },
        { status: 400 }
      );
    }

    // Construct EmailJS payload using the provided credentials
    const emailJsPayload = {
      service_id: process.env.EMAILJS_SERVICE_ID || 'service_lv7uesm',
      template_id: process.env.EMAILJS_TEMPLATE_ID || 'template_q2h3wip',
      user_id: process.env.EMAILJS_PUBLIC_KEY || 'ATgdcDnCyAozeXFYu',
      template_params: {
        name: name.trim(),
        email: email.trim(),
        query: query.trim(),
      },
    };

    // Trigger EmailJS API request
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailJsPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`EmailJS API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to send message: ${errorText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Internal Server Error processing query form:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}


import { config } from '../config.js';

export type BrandInfo = {
  companyName: string;
  companyTagline: string;
  contactEmail: string;
  phoneNumber: string;
  location: string;
};

export function defaultBrand(): BrandInfo {
  return {
    companyName: 'Visit KIBUYE',
    companyTagline: 'Kibuye • Karongi • Lake Kivu',
    contactEmail: config.adminEmail,
    phoneNumber: '',
    location: 'Kibuye, Karongi, Rwanda',
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout(brand: BrandInfo, title: string, bodyHtml: string) {
  const name = escapeHtml(brand.companyName || 'Visit KIBUYE');
  const tagline = escapeHtml(brand.companyTagline || '');
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f7;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0c4a6e,#0e7490);padding:28px 28px 24px;color:#ffffff;">
              <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">${tagline || 'Lake Kivu experiences'}</div>
              <div style="font-size:28px;font-weight:700;margin-top:8px;letter-spacing:-0.03em;">${name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;letter-spacing:-0.02em;">${safeTitle}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 28px;border-top:1px solid #e2e8f0;color:#64748b;font-size:13px;line-height:1.6;">
              ${brand.phoneNumber ? `<div>Phone: ${escapeHtml(brand.phoneNumber)}</div>` : ''}
              ${brand.contactEmail ? `<div>Email: ${escapeHtml(brand.contactEmail)}</div>` : ''}
              ${brand.location ? `<div>${escapeHtml(brand.location)}</div>` : ''}
              <div style="margin-top:10px;">© ${new Date().getFullYear()} ${name}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailsTable(rows: { label: string; value: string }[]) {
  const cells = rows
    .filter((row) => row.value)
    .map(
      (row) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;width:140px;vertical-align:top;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;vertical-align:top;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join('');

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0;">${cells}</table>`;
}

function cta(label: string, href: string) {
  return `<p style="margin:24px 0 8px;">
    <a href="${escapeHtml(href)}" style="display:inline-block;background:#0c4a6e;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:12px;">${escapeHtml(label)}</a>
  </p>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 12px;line-height:1.7;color:#334155;">${escapeHtml(text)}</p>`;
}

export function welcomeEmail(brand: BrandInfo, name: string) {
  const title = `Welcome to ${brand.companyName}`;
  const html = layout(
    brand,
    title,
    [
      paragraph(`Hi ${name},`),
      paragraph(`Thanks for creating your account. You can browse Lake Kivu experiences and book tours online anytime.`),
      cta('Open my account', `${config.frontendUrl}/account`),
      paragraph('If you did not create this account, you can ignore this email.'),
    ].join(''),
  );
  const text = `Hi ${name},\n\nWelcome to ${brand.companyName}. Browse and book tours at ${config.frontendUrl}/account\n`;
  return { subject: title, html, text };
}

export function verifyEmailTemplate(
  brand: BrandInfo,
  input: { name: string; code: string; token: string },
) {
  const title = 'Verify your email';
  const verifyUrl = `${config.frontendUrl}/account/verify?code=${encodeURIComponent(input.code)}`;
  const html = layout(
    brand,
    title,
    [
      paragraph(`Hi ${input.name},`),
      paragraph('Thanks for signing up. Use the verification code below to finish setting up your account.'),
      `<p style="margin:24px 0;text-align:center;font-size:32px;font-weight:800;letter-spacing:0.28em;color:#0c4a6e;">${input.code}</p>`,
      paragraph('Enter this 6-digit code on the verification page. It expires in 24 hours.'),
      cta('Open verification page', verifyUrl),
      paragraph('If you did not create an account, you can ignore this email.'),
    ].join(''),
  );
  const text = `Hi ${input.name},\n\nYour Visit KIBUYE verification code is: ${input.code}\n\nEnter it here: ${verifyUrl}\n\nThis code expires in 24 hours.\n`;
  return { subject: `${title} — ${input.code} — ${brand.companyName}`, html, text };
}

export function bookingReceivedClientEmail(
  brand: BrandInfo,
  input: {
    clientName: string;
    tourName: string;
    tourDate: string;
    guests: number;
    totalUsd: number;
    status: string;
  },
) {
  const title = 'We received your booking request';
  const html = layout(
    brand,
    title,
    [
      paragraph(`Hi ${input.clientName},`),
      paragraph('Thanks for booking with us. Your request is pending confirmation. Here are the details:'),
      detailsTable([
        { label: 'Tour', value: input.tourName },
        { label: 'Date', value: input.tourDate },
        { label: 'Guests', value: String(input.guests) },
        { label: 'Total', value: `$${input.totalUsd.toFixed(2)} USD` },
        { label: 'Status', value: input.status },
      ]),
      cta('Track my bookings', `${config.frontendUrl}/account`),
      paragraph('We will email you again when your booking status changes.'),
    ].join(''),
  );
  const text = `Hi ${input.clientName},\n\nWe received your booking for ${input.tourName} on ${input.tourDate} (${input.guests} guests, $${input.totalUsd.toFixed(2)} USD). Status: ${input.status}.\nTrack it: ${config.frontendUrl}/account\n`;
  return { subject: `${title} — ${input.tourName}`, html, text };
}

export function bookingReceivedAdminEmail(
  brand: BrandInfo,
  input: {
    clientName: string;
    clientEmail: string;
    clientPhone?: string | null;
    tourName: string;
    tourDate: string;
    guests: number;
    totalUsd: number;
    notes?: string | null;
  },
) {
  const title = 'New booking request';
  const html = layout(
    brand,
    title,
    [
      paragraph('A client submitted a new booking on the website.'),
      detailsTable([
        { label: 'Client', value: input.clientName },
        { label: 'Email', value: input.clientEmail },
        { label: 'Phone', value: input.clientPhone || '' },
        { label: 'Tour', value: input.tourName },
        { label: 'Date', value: input.tourDate },
        { label: 'Guests', value: String(input.guests) },
        { label: 'Total', value: `$${input.totalUsd.toFixed(2)} USD` },
        { label: 'Notes', value: input.notes || '' },
      ]),
      cta('Open admin bookings', `${config.frontendUrl}/admin`),
    ].join(''),
  );
  const text = `New booking from ${input.clientName} (${input.clientEmail}) for ${input.tourName} on ${input.tourDate}. Guests: ${input.guests}. Total: $${input.totalUsd.toFixed(2)}.\n`;
  return { subject: `${title}: ${input.tourName}`, html, text };
}

export function bookingStatusClientEmail(
  brand: BrandInfo,
  input: {
    clientName: string;
    tourName: string;
    tourDate: string;
    guests: number;
    totalUsd: number;
    status: string;
  },
) {
  const statusLabel = input.status.charAt(0).toUpperCase() + input.status.slice(1);
  const title = `Booking ${statusLabel.toLowerCase()}`;
  const intro =
    input.status === 'confirmed'
      ? 'Great news — your booking is confirmed.'
      : input.status === 'cancelled'
        ? 'Your booking has been cancelled.'
        : input.status === 'completed'
          ? 'Your trip is marked as completed. We hope you enjoyed Lake Kivu.'
          : `Your booking status is now ${input.status}.`;

  const html = layout(
    brand,
    title,
    [
      paragraph(`Hi ${input.clientName},`),
      paragraph(intro),
      detailsTable([
        { label: 'Tour', value: input.tourName },
        { label: 'Date', value: input.tourDate },
        { label: 'Guests', value: String(input.guests) },
        { label: 'Total', value: `$${input.totalUsd.toFixed(2)} USD` },
        { label: 'Status', value: statusLabel },
      ]),
      cta('View my account', `${config.frontendUrl}/account`),
    ].join(''),
  );
  const text = `Hi ${input.clientName},\n\n${intro}\nTour: ${input.tourName}\nDate: ${input.tourDate}\nStatus: ${statusLabel}\n${config.frontendUrl}/account\n`;
  return { subject: `Booking ${statusLabel} — ${input.tourName}`, html, text };
}

export function bookingCancelledAdminEmail(
  brand: BrandInfo,
  input: {
    clientName: string;
    clientEmail: string;
    tourName: string;
    tourDate: string;
  },
) {
  const title = 'Client cancelled a booking';
  const html = layout(
    brand,
    title,
    [
      paragraph('A client cancelled their booking.'),
      detailsTable([
        { label: 'Client', value: input.clientName },
        { label: 'Email', value: input.clientEmail },
        { label: 'Tour', value: input.tourName },
        { label: 'Date', value: input.tourDate },
      ]),
      cta('Open admin bookings', `${config.frontendUrl}/admin`),
    ].join(''),
  );
  const text = `${input.clientName} (${input.clientEmail}) cancelled ${input.tourName} on ${input.tourDate}.\n`;
  return { subject: title, html, text };
}

export function contactReceivedAdminEmail(
  brand: BrandInfo,
  input: { name: string; email: string; phone?: string | null; message: string },
) {
  const title = 'New contact message';
  const html = layout(
    brand,
    title,
    [
      paragraph('Someone sent a message from the website contact form.'),
      detailsTable([
        { label: 'Name', value: input.name },
        { label: 'Email', value: input.email },
        { label: 'Phone', value: input.phone || '' },
        { label: 'Message', value: input.message },
      ]),
      cta('Open contact inbox', `${config.frontendUrl}/admin`),
    ].join(''),
  );
  const text = `Contact from ${input.name} <${input.email}>\nPhone: ${input.phone || '-'}\n\n${input.message}\n`;
  return { subject: `${title} from ${input.name}`, html, text };
}

export function contactAutoReplyEmail(brand: BrandInfo, name: string) {
  const title = 'We received your message';
  const html = layout(
    brand,
    title,
    [
      paragraph(`Hi ${name},`),
      paragraph(`Thanks for contacting ${brand.companyName}. Our team will get back to you soon.`),
      paragraph('For urgent booking questions, WhatsApp is often the fastest option from our contact page.'),
      cta('Visit website', config.frontendUrl),
    ].join(''),
  );
  const text = `Hi ${name},\n\nThanks for contacting ${brand.companyName}. We will reply soon.\n${config.frontendUrl}\n`;
  return { subject: title, html, text };
}

export function profileUpdatedEmail(
  brand: BrandInfo,
  input: { name: string; emailChanged: boolean; passwordChanged: boolean },
) {
  const changes = [
    input.emailChanged ? 'email address' : '',
    input.passwordChanged ? 'password' : '',
  ].filter(Boolean);
  const title = 'Your profile was updated';
  const detail =
    changes.length > 0
      ? `We updated your ${changes.join(' and ')}.`
      : 'Your profile details were saved successfully.';

  const html = layout(
    brand,
    title,
    [
      paragraph(`Hi ${input.name},`),
      paragraph(detail),
      paragraph('If you did not make this change, please contact us right away.'),
      cta('Open profile', `${config.frontendUrl}/account/profile`),
    ].join(''),
  );
  const text = `Hi ${input.name},\n\n${detail}\n${config.frontendUrl}/account/profile\n`;
  return { subject: title, html, text };
}

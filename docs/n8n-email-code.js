// Paste into n8n → Code in JavaScript node (replaces existing code).
// Handles: plan_brochure, loyalty_brochure, loyalty_redeemed, gear_fitting_confirmed,
// booking_received, booking_confirmed, booking_cancelled, booking_rescheduled

const raw = $input.first().json;
const body = raw.body ?? raw;

function emailShell(title, badge, badgeColor, innerHtml) {
  return `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e6eef6;">
    <div style="background:linear-gradient(135deg,#0b3d5c,#1f6f8b);color:#fff;padding:28px 24px;">
      <div style="font-size:12px;letter-spacing:1px;opacity:.85;">SNOWVEIL</div>
      <h1 style="margin:8px 0 0;font-size:24px;">${title}</h1>
    </div>
    <div style="padding:24px;">
      <div style="display:inline-block;${badgeColor};border-radius:999px;padding:6px 12px;font-size:12px;font-weight:700;">${badge}</div>
      ${innerHtml}
    </div>
    <div style="padding:16px 24px 24px;color:#889;font-size:12px;">Snowveil Alpine Concierge</div>
  </div>
</div>`;
}

// --- Plan brochure (send_plan_details) ---
if (body.event === 'plan_brochure' || body.type === 'PLAN_BROCHURE') {
  const plans = body.plans || [];
  const availability = body.availability;
  let plansHtml = '';
  for (const p of plans) {
    const includes = (p.includes || []).map((i) => `<li>${i}</li>`).join('');
    plansHtml += `
      <div style="border:1px solid #e6eef6;border-radius:12px;padding:14px 16px;margin:12px 0;">
        <div style="font-weight:700;font-size:16px;color:#0b3d5c;">${p.name}</div>
        <div style="color:#667;font-size:13px;margin:4px 0 8px;">${p.best_for || ''}</div>
        <div style="font-size:18px;font-weight:700;">EUR ${p.rate_per_night}<span style="font-size:12px;font-weight:500;color:#667;"> / night</span></div>
        <div style="font-size:12px;color:#556;margin:8px 0;">Lift +EUR ${p.lift_pass_per_night}/night · Lessons +EUR ${p.lessons_per_night}/night</div>
        <ul style="margin:0;padding-left:18px;color:#334;font-size:13px;">${includes}</ul>
      </div>`;
  }
  let availabilityHtml = '';
  if (availability?.packages) {
    const rows = availability.packages.map((pkg) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eef3f8;">${pkg.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:center;">${pkg.available ? 'Available' : 'Limited'}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;font-weight:600;">EUR ${pkg.total}</td>
      </tr>`).join('');
    availabilityHtml = `
      <h3 style="margin:20px 0 8px;font-size:16px;">Availability snapshot</h3>
      <p style="color:#556;font-size:13px;">${availability.arrival_date} → ${availability.departure_date} · ${availability.nights} night(s)</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">${rows}</table>`;
  }
  const guestName = body.guestName || body.guest_name || 'Guest';
  const loyalty = body.loyalty || {};
  let loyaltyHtml = '';
  if (loyalty.enrolled) {
    const tiers = (loyalty.available_redemptions || []).map((t) => `<li><strong>${t.label}</strong>: ${t.points} pts · ${t.description || ''}</li>`).join('');
    loyaltyHtml = `
      <div style="margin-top:20px;padding:14px 16px;background:#f0f7ff;border-radius:12px;color:#334;font-size:13px;line-height:1.6;">
        <strong>Summit Circle: your balance: ${loyalty.points_balance} pts</strong>
        ${tiers ? `<ul style="margin:8px 0 0;padding-left:18px;">${tiers}</ul>` : '<p style="margin:8px 0 0;">Keep earning. See loyalty email for redemption tiers.</p>'}
      </div>`;
  } else if (loyalty.welcome_bonus_eligible) {
    loyaltyHtml = `
      <div style="margin-top:20px;padding:14px 16px;background:#f0f7ff;border-radius:12px;color:#334;font-size:13px;line-height:1.6;">
        <strong>New to Summit Circle?</strong> Receive <strong>${loyalty.welcome_bonus_points || 200} welcome points</strong> on your first booking.
      </div>`;
  }
  const html = emailShell(
    'Plans & pricing',
    'PLAN BROCHURE',
    'background:#e8f1ff;color:#1a4d8c;',
    `<h2 style="margin:18px 0 8px;">Hi ${guestName},</h2>
     <p style="color:#445;line-height:1.5;">Here are our packages, inclusions, and EUR pricing.</p>
     ${plansHtml}${availabilityHtml}${loyaltyHtml}`,
  );
  return [{ json: { event: 'plan_brochure', to: body.to || body.contact, subject: 'Snowveil: plans & EUR pricing', html, guestName } }];
}

// --- Loyalty brochure (send_loyalty_details) ---
if (body.event === 'loyalty_brochure' || body.type === 'LOYALTY_BROCHURE') {
  const guestName = body.guestName || body.guest_name || 'Guest';
  const tiers = body.redemption_tiers || [];
  const available = body.available_redemptions || [];
  const tierRows = tiers.map((t) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eef3f8;font-weight:600;">${t.points} pts</td>
      <td style="padding:10px 0;border-bottom:1px solid #eef3f8;">${t.label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eef3f8;color:#667;font-size:13px;">${t.description || ''}</td>
    </tr>`).join('');
  const availableHtml = available.length
    ? `<p style="margin:16px 0 8px;color:#0b3d5c;font-weight:700;">You can redeem today:</p><ul style="margin:0;padding-left:18px;color:#445;">${available.map((t) => `<li>${t.label} (${t.points} pts)</li>`).join('')}</ul>`
    : body.enrolled
      ? `<p style="margin:16px 0 8px;color:#667;">You need ${body.points_to_next_tier || 'more'} points for your next reward${body.next_tier ? ` (${body.next_tier.label})` : ''}.</p>`
      : `<p style="margin:16px 0 8px;color:#667;">Book your first stay to receive <strong>${body.welcome_bonus_points || 200} welcome points</strong>.</p>`;
  const html = emailShell(
    'Summit Circle rewards',
    body.enrolled ? `● ${body.points_balance} POINTS` : '● WELCOME OFFER',
    body.enrolled ? 'background:#e8f1ff;color:#1a4d8c;' : 'background:#e8f6ef;color:#0f6b4c;',
    `<h2 style="margin:18px 0 8px;">Hi ${guestName},</h2>
     <p style="color:#445;line-height:1.5;">Your Snowveil loyalty summary and redemption options.</p>
     ${availableHtml}
     <h3 style="margin:24px 0 8px;font-size:16px;">Redemption tiers</h3>
     <table style="width:100%;border-collapse:collapse;font-size:14px;">${tierRows}</table>
     <p style="margin-top:16px;color:#667;font-size:12px;">Redeem anytime through the voice concierge. Credits apply to your stay or on-mountain services.</p>`,
  );
  return [{ json: { event: 'loyalty_brochure', to: body.to || body.contact, subject: 'Snowveil: Summit Circle rewards & discounts', html, guestName } }];
}

// --- Loyalty redeemed (redeem_loyalty_points) ---
if (body.event === 'loyalty_redeemed' || body.type === 'LOYALTY_REDEEMED') {
  const guestName = body.guestName || body.guest_name || 'Guest';
  const html = emailShell(
    'Points redeemed',
    '● REDEMPTION CONFIRMED',
    'background:#e8f6ef;color:#0f6b4c;',
    `<h2 style="margin:18px 0 8px;">Hi ${guestName},</h2>
     <p style="color:#445;line-height:1.5;">Your Summit Circle redemption is confirmed.</p>
     <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
       <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Points redeemed</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;font-weight:600;">${body.points_redeemed}</td></tr>
       <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Discount applied</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;font-weight:600;">${body.discount_label || ('EUR ' + (body.discount_eur || 0))}</td></tr>
       <tr><td style="padding:8px 0;color:#667;">Remaining balance</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#0b3d5c;">${body.points_balance} pts</td></tr>
     </table>
     <p style="margin-top:16px;color:#667;font-size:13px;">${body.discount_description || 'Credit will be applied to your account for your next eligible purchase.'}</p>`,
  );
  return [{ json: { event: 'loyalty_redeemed', to: body.to || body.contact, subject: 'Snowveil: Summit Circle redemption confirmed', html, guestName } }];
}

// --- Gear fitting confirmed (submit_gear_fitting) ---
if (body.event === 'gear_fitting_confirmed' || body.type === 'GEAR_FITTING_CONFIRMED') {
  const guestName = body.guestName || body.guest_name || 'Guest';
  const skillLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  const skill = skillLabels[body.skill_level] || body.skill_level || '';
  const packages = {
    alpine_escape: 'Alpine Escape',
    summit_luxury: 'Summit Luxury Chalet',
    family_adventure: 'Family Adventure',
    day_pass: 'Day Pass Package',
  };
  const packageName = packages[body.package_type] || body.package_type || '';
  const notesRow = body.notes
    ? `<tr><td style="padding:8px 0;color:#667;vertical-align:top;">Notes</td><td style="padding:8px 0;text-align:right;font-weight:600;">${body.notes}</td></tr>`
    : '';
  const html = emailShell(
    'Gear fitting confirmed',
    '● FITTING SAVED',
    'background:#e8f1ff;color:#1a4d8c;',
    `<h2 style="margin:18px 0 8px;">Hi ${guestName},</h2>
     <p style="color:#445;line-height:1.5;">Your ski gear fitting is saved. We will stage equipment before your first ski day.</p>
     <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
       <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Stay</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;">${body.arrival_date || ''} → ${body.departure_date || ''}</td></tr>
       <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Package</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;">${packageName}</td></tr>
       <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Height</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;font-weight:600;">${body.height_cm} cm</td></tr>
       <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Boot size (EU)</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;font-weight:600;">${body.boot_size}</td></tr>
       <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Skill level</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;font-weight:600;">${skill}</td></tr>
       ${notesRow}
     </table>
     <div style="margin-top:20px;padding:14px 16px;background:#f7fafc;border-radius:12px;color:#556;font-size:13px;line-height:1.6;">
       <strong>Before you arrive</strong><br>
       Heated ski lockers are complimentary overnight. Boot dryers and a tuning bench are available in the gear atelier until 9:00 PM.
     </div>`,
  );
  return [{ json: { event: 'gear_fitting_confirmed', to: body.to || body.contact, subject: 'Snowveil: gear fitting confirmed', html, guestName } }];
}

function buildBookingPricingRows(record, catalogTotal) {
  const before = Number(record.estimated_total_eur ?? catalogTotal);
  const discount = Number(record.loyalty_discount_eur ?? 0);
  const points = Number(record.loyalty_points_redeemed ?? 0);
  const after = Number(record.final_total_eur ?? Math.max(0, before - discount));

  if (discount > 0 && points > 0) {
    return `
    <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Subtotal</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;font-weight:600;">EUR ${before}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Summit Circle discount (${points} pts)</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;font-weight:600;color:#0f6b4c;">− EUR ${discount}</td></tr>
    <tr><td style="padding:8px 0;color:#667;">Total after discount</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#0b3d5c;">EUR ${after}</td></tr>`;
  }

  return `<tr><td style="padding:8px 0;color:#667;">Estimated total</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#0b3d5c;">EUR ${before}</td></tr>`;
}

const record = body.record ?? {};
const old = body.old_record ?? {};
const packages = {
  alpine_escape: 'Alpine Escape',
  summit_luxury: 'Summit Luxury Chalet',
  family_adventure: 'Family Adventure',
  day_pass: 'Day Pass Package',
};
const catalog = {
  alpine_escape: { rate: 420, lift: 85, lessons: 120 },
  summit_luxury: { rate: 890, lift: 95, lessons: 150 },
  family_adventure: { rate: 560, lift: 70, lessons: 95 },
  day_pass: { rate: 180, lift: 65, lessons: 110 },
};

const contact = String(record.contact || '').trim();
const isEmail = contact.includes('@');
const pkgKey = record.package_type;
const pkg = catalog[pkgKey] || { rate: 0, lift: 0, lessons: 0 };
const arrival = record.arrival_date;
const departure = record.departure_date;
const nights = arrival && departure
  ? Math.max(1, Math.round((new Date(departure + 'T00:00:00.000Z') - new Date(arrival + 'T00:00:00.000Z')) / 86400000))
  : 1;
const liftPass = !!record.lift_pass_included;
const lessons = !!record.lessons_included;
const total = pkg.rate * nights + (liftPass ? pkg.lift * nights : 0) + (lessons ? pkg.lessons * nights : 0);
const guestName = record.guest_name || 'Guest';
const packageName = packages[pkgKey] || pkgKey;

let event = 'ignore';
if (body.type === 'INSERT' && record.status === 'pending') event = 'booking_received';
else if (body.type === 'UPDATE' && old.status !== record.status) {
  if (record.status === 'confirmed') event = 'booking_confirmed';
  if (record.status === 'cancelled') event = 'booking_cancelled';
  if (record.status === 'rescheduled') event = 'booking_rescheduled';
}

const detailsTable = `
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
    <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Guest</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;font-weight:600;">${guestName}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Booking ID</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;font-family:monospace;font-size:12px;">${record.id || ''}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Package</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;">${packageName}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eef3f8;color:#667;">Stay</td><td style="padding:8px 0;border-bottom:1px solid #eef3f8;text-align:right;">${arrival} → ${departure}</td></tr>
    ${buildBookingPricingRows(record, total)}
  </table>`;

let subject = 'Snowveil: update';
let html = '';

if (event === 'booking_received') {
  subject = 'Snowveil: booking request received';
  html = emailShell(
    'Booking request received',
    '● PENDING CONFIRMATION',
    'background:#e8f6ef;color:#0f6b4c;',
    `<h2 style="margin:18px 0 8px;">Hi ${guestName},</h2>
     <p style="color:#445;line-height:1.5;">We received your request. Our team will confirm shortly.</p>${detailsTable}`,
  );
} else if (event === 'booking_confirmed') {
  subject = 'Snowveil: your stay is confirmed';
  html = emailShell(
    'Booking confirmed',
    '● CONFIRMED',
    'background:#e8f6ef;color:#0f6b4c;',
    `<h2 style="margin:18px 0 8px;">Hi ${guestName},</h2>
     <p style="color:#445;line-height:1.5;">Your Snowveil stay is confirmed. We look forward to welcoming you.</p>${detailsTable}`,
  );
} else if (event === 'booking_cancelled') {
  subject = 'Snowveil: booking cancelled';
  html = emailShell(
    'Booking cancelled',
    '● CANCELLED',
    'background:#fdecea;color:#b42318;',
    `<h2 style="margin:18px 0 8px;">Hi ${guestName},</h2>
     <p style="color:#445;line-height:1.5;">Your booking has been cancelled as requested.</p>
     ${detailsTable}
     <div style="margin-top:20px;padding:14px 16px;background:#f7fafc;border-radius:12px;color:#556;font-size:13px;line-height:1.6;">
       <strong>Cancellation policy</strong><br>
       Weather-related cancellations: fees waived; prepaid amounts refunded in full.<br>
       Guest-choice cancellations: EUR 150 administrative fee may apply.<br>
       Refunds (where applicable) are processed within 5–7 business days.
     </div>`,
  );
} else if (event === 'booking_rescheduled') {
  subject = 'Snowveil: booking rescheduled';
  html = emailShell(
    'Booking rescheduled',
    '● RESCHEDULED',
    'background:#e8f1ff;color:#1a4d8c;',
    `<h2 style="margin:18px 0 8px;">Hi ${guestName},</h2>
     <p style="color:#445;line-height:1.5;">Your stay dates have been updated.</p>${detailsTable}`,
  );
} else {
  return [{ json: { event: 'ignore', to: '', subject: '', html: '' } }];
}

return [{ json: { event, to: isEmail ? contact : '', subject, html, guestName } }];

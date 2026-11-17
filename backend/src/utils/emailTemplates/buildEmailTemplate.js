/**
 * Minimal, inline-styled email template so it renders consistently
 * across email clients without relying on external CSS.
 */
function buildEmailTemplate({ title, bodyLines = [], ctaText, ctaUrl }) {
  const paragraphs = bodyLines
    .map((line) => `<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">${line}</p>`)
    .join('');

  const ctaButton = ctaUrl
    ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:8px;padding:12px 24px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${ctaText}</a>`
    : '';

  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;">
    <h1 style="font-size:20px;color:#0f172a;margin:0 0 20px;">${title}</h1>
    ${paragraphs}
    ${ctaButton}
    <p style="margin-top:32px;color:#94a3b8;font-size:12px;">TalentForge — A Modern AI-Ready Recruitment &amp; Job Portal Platform</p>
  </div>`;
}

module.exports = { buildEmailTemplate };
